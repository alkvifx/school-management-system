import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import * as notificationService from "../services/notification.service.js";
import ChatRoom from "../models/chatRoom.model.js";
import Message from "../models/message.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Class from "../models/class.model.js";

// Connection tracking for presence + cleanup
const userSockets = new Map();
const socketMeta = new Map();

// Per-user message queue (deliver on reconnect)
const messageQueue = new Map();
const MAX_QUEUE_SIZE = 100;

// Metrics
const metrics = {
  connections: 0,
  disconnects: 0,
  peakConnections: 0,
  lastConnectAt: null,
  lastDisconnectAt: null,
};

const MAX_SOCKETS_PER_USER = 5;

const emitChatError = (socket, message) => {
  try {
    socket.emit("error", { message });
  } catch {}
};

const safeAck = (ack, payload) => {
  if (typeof ack !== "function") return;
  try {
    ack(payload);
  } catch {}
};

/**
 * Authenticate Socket.IO connection using JWT (handshake.auth.token)
 */
export const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (!user.isActive) {
      return next(new Error("Authentication error: User account is inactive"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

const validateClassAccess = async (user, classId, classDoc = null) => {
  if (user.role === "TEACHER") {
    const teacher = await Teacher.findOne({ userId: user._id });
    if (!teacher) return false;
    return teacher.assignedClasses.some((id) => id.toString() === classId);
  } else if (user.role === "STUDENT") {
    const student = await Student.findOne({ userId: user._id });
    if (!student) return false;
    return student.classId.toString() === classId;
  } else if (user.role === "PRINCIPAL") {
    if (!user.schoolId) return false;
    const doc = classDoc || (await Class.findById(classId).select("schoolId isActive"));
    if (!doc) return false;
    return doc.schoolId?.toString() === user.schoolId?.toString();
  } else if (user.role === "SUPER_ADMIN") {
    return true;
  }
  return false;
};

const getSchoolRoom = (schoolId) => `school-${schoolId}`;
const getSchoolRoleRoom = (schoolId, role) => `school-${schoolId}-${role}`;
const getUserRoom = (userId) => `user-${userId}`;

/**
 * Emit user presence to school room
 */
const emitPresence = (io, userId, schoolId, role, status) => {
  if (!schoolId) return;
  const payload = { userId, schoolId: schoolId.toString(), role, status };
  io.to(getSchoolRoom(schoolId)).emit("userPresence", payload);
};

/**
 * Queue a message for offline user
 */
const queueForUser = (userId, event, payload) => {
  let queue = messageQueue.get(userId) || [];
  if (queue.length >= MAX_QUEUE_SIZE) queue = queue.slice(-MAX_QUEUE_SIZE + 1);
  queue.push({ event, payload });
  messageQueue.set(userId, queue);
};

/**
 * Deliver queued messages to socket
 */
const deliverQueued = (socket, userId) => {
  const queue = messageQueue.get(userId);
  if (!queue || queue.length === 0) return;
  queue.forEach(({ event, payload }) => {
    try {
      socket.emit(event, payload);
    } catch {}
  });
  messageQueue.delete(userId);
};

/**
 * Initialize Socket.IO event handlers
 */
export const initializeSocketIO = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const schoolId = socket.user.schoolId?.toString();
    const role = socket.user.role;

    metrics.connections++;
    metrics.lastConnectAt = Date.now();
    if (metrics.connections > metrics.peakConnections) {
      metrics.peakConnections = metrics.connections;
    }

    const existing = userSockets.get(userId) || new Set();
    existing.add(socket.id);
    userSockets.set(userId, existing);
    socketMeta.set(socket.id, { userId, schoolId, role });

    if (existing.size > MAX_SOCKETS_PER_USER) {
      console.warn(`User ${userId} exceeded max sockets (${existing.size}). Disconnecting ${socket.id}.`);
      emitChatError(socket, "Too many active connections. Please close extra tabs and retry.");
      socket.disconnect(true);
      return;
    }

    // Personal room (for targeted events)
    socket.join(getUserRoom(userId));

    // joinSchoolRoom: join school and role rooms
    if (schoolId) {
      socket.join(getSchoolRoom(schoolId));
      socket.join(getSchoolRoleRoom(schoolId, role));
    }

    emitPresence(io, userId, schoolId, role, "online");

    // Deliver queued messages on reconnect
    deliverQueued(socket, userId);

    socket.emit("joinedSchoolRoom", {
      success: true,
      schoolId: schoolId || null,
      role,
      userId,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`User connected: ${socket.user.name} (${role}) [${socket.id}]`);
    }

    // joinClassRoom
    socket.on("joinClassRoom", async (data = {}, ack) => {
      try {
        const { classId } = data;
        if (!classId) {
          emitChatError(socket, "Class ID is required");
          safeAck(ack, { success: false, message: "Class ID is required" });
          return;
        }
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          emitChatError(socket, "Invalid class ID");
          safeAck(ack, { success: false, message: "Invalid class ID" });
          return;
        }
        const classDoc = await Class.findById(classId);
        if (!classDoc || !classDoc.isActive) {
          emitChatError(socket, "Class not found or inactive");
          safeAck(ack, { success: false, message: "Class not found or inactive" });
          return;
        }
        const hasAccess = await validateClassAccess(socket.user, classId, classDoc);
        if (!hasAccess) {
          emitChatError(socket, "You do not have access to this class chat");
          safeAck(ack, { success: false, message: "You do not have access to this class chat" });
          return;
        }
        const roomName = `class-${classId}`;
        socket.join(roomName);
        socket.emit("joinedClassRoom", { success: true, classId, roomName });
        safeAck(ack, { success: true, classId, roomName });
      } catch (error) {
        console.error("Error joining class room:", error);
        emitChatError(socket, "Failed to join class room");
        safeAck(ack, { success: false, message: "Failed to join class room" });
      }
    });

    // sendMessage
    socket.on("sendMessage", async (data = {}, ack) => {
      try {
        const {
          classId,
          chatRoomId: bodyChatRoomId,
          text,
          messageType = "text",
          mediaUrl,
          clientMessageId,
        } = data;

        if (!classId) {
          emitChatError(socket, "Class ID is required");
          safeAck(ack, { success: false, message: "Class ID is required" });
          return;
        }
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          emitChatError(socket, "Invalid class ID");
          safeAck(ack, { success: false, message: "Invalid class ID" });
          return;
        }

        const classDoc = await Class.findById(classId).select(
          "isActive schoolId classTeacherId"
        );
        if (!classDoc || !classDoc.isActive) {
          emitChatError(socket, "Class not found or inactive");
          safeAck(ack, { success: false, message: "Class not found or inactive" });
          return;
        }

        const hasAccess = await validateClassAccess(socket.user, classId, classDoc);
        if (!hasAccess) {
          emitChatError(socket, "You do not have access to this class chat");
          safeAck(ack, { success: false, message: "You do not have access to this class chat" });
          return;
        }

        if (!text && !mediaUrl) {
          emitChatError(socket, "Message text or media is required");
          safeAck(ack, { success: false, message: "Message text or media is required" });
          return;
        }

        let chatRoom = null;
        if (bodyChatRoomId && mongoose.Types.ObjectId.isValid(bodyChatRoomId)) {
          chatRoom = await ChatRoom.findOne({
            _id: bodyChatRoomId,
            classId: classDoc._id,
          });
        }
        if (!chatRoom) {
          chatRoom = await ChatRoom.findOne({ classId: classDoc._id });
        }
        if (!chatRoom) {
          const classTeacher = classDoc.classTeacherId
            ? await Teacher.findById(classDoc.classTeacherId)
            : null;
          if (!classTeacher) {
            emitChatError(socket, "Class teacher not assigned");
            safeAck(ack, { success: false, message: "Class teacher not assigned" });
            return;
          }
          try {
            chatRoom = await ChatRoom.create({
              classId: classDoc._id,
              teacherId: classTeacher._id,
            });
          } catch (createErr) {
            if (createErr.code === 11000 || createErr.code === 11001) {
              chatRoom = await ChatRoom.findOne({ classId: classDoc._id });
              if (!chatRoom) throw createErr;
            } else {
              throw createErr;
            }
          }
        }

        if (clientMessageId && typeof clientMessageId === "string") {
          const existingMsg = await Message.findOne({
            chatRoomId: chatRoom._id,
            senderId: socket.user._id,
            clientMessageId,
          }).populate("senderId", "name email");
          if (existingMsg) {
            const messageData = {
              id: existingMsg._id,
              chatRoomId: existingMsg.chatRoomId,
              sender: {
                id: existingMsg.senderId._id,
                name: existingMsg.senderId.name,
                email: existingMsg.senderId.email,
              },
              senderRole: existingMsg.senderRole,
              messageType: existingMsg.messageType,
              text: existingMsg.text,
              mediaUrl: existingMsg.mediaUrl,
              createdAt: existingMsg.createdAt,
              clientMessageId: existingMsg.clientMessageId,
            };
            safeAck(ack, { success: true, message: messageData, deduped: true });
            return;
          }
        }

        const message = await Message.create({
          chatRoomId: chatRoom._id,
          senderId: socket.user._id,
          senderRole: socket.user.role,
          messageType: messageType || "text",
          text: text || null,
          mediaUrl: mediaUrl || null,
          clientMessageId:
            clientMessageId && typeof clientMessageId === "string"
              ? clientMessageId
              : null,
        });

        await message.populate("senderId", "name email");

        const messageData = {
          id: message._id,
          chatRoomId: message.chatRoomId,
          classId,
          sender: {
            id: message.senderId._id,
            name: message.senderId.name,
            email: message.senderId.email,
          },
          senderRole: message.senderRole,
          messageType: message.messageType,
          text: message.text,
          mediaUrl: message.mediaUrl,
          createdAt: message.createdAt,
          clientMessageId: message.clientMessageId || undefined,
        };

        const roomName = `class-${classId}`;
        io.to(roomName).emit("newChatMessage", { success: true, message: messageData });
        io.to(roomName).emit("receiveMessage", { success: true, message: messageData });

        // Web Push: notify class members (except sender) when app is in background
        const senderIdStr = socket.user._id.toString();
        const classDocForNotify = await Class.findById(classId)
          .populate("classTeacherId", "userId")
          .lean();
        const recipientIds = new Set();
        if (classDocForNotify?.classTeacherId?.userId) {
          recipientIds.add(classDocForNotify.classTeacherId.userId.toString());
        }
        const students = await Student.find({
          classId: classDocForNotify?._id,
          isActive: true,
        })
          .select("userId")
          .lean();
        students.forEach((s) => s.userId && recipientIds.add(s.userId.toString()));
        recipientIds.delete(senderIdStr);
        const pushPayload = {
          title: `${message.senderId.name}: New message`,
          body: (message.text || "Media").slice(0, 100),
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          data: { url: "/notifications", type: "chat", classId },
        };
        recipientIds.forEach((uid) => {
          notificationService.sendPushToUser(uid, pushPayload).catch(() => {});
        });

        safeAck(ack, { success: true, message: messageData, chatRoomId: chatRoom._id });
      } catch (error) {
        console.error("Error sending message:", error);
        emitChatError(socket, "Failed to send message");
        safeAck(ack, { success: false, message: "Failed to send message" });
      }
    });

    socket.on("leaveClassRoom", (data) => {
      const { classId } = data || {};
      if (classId) {
        socket.leave(`class-${classId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      metrics.disconnects++;
      metrics.lastDisconnectAt = Date.now();

      const meta = socketMeta.get(socket.id);
      if (meta?.userId) {
        const set = userSockets.get(meta.userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            userSockets.delete(meta.userId);
            emitPresence(io, meta.userId, meta.schoolId, meta.role, "offline");
          } else {
            userSockets.set(meta.userId, set);
          }
        }
      }
      socketMeta.delete(socket.id);

      if (process.env.NODE_ENV !== "production") {
        console.log(`User disconnected: ${socket.user?.name} [${reason}]`);
      }
    });
  });

  // Log metrics periodically (optional)
  if (process.env.NODE_ENV !== "production") {
    setInterval(() => {
      const count = io.engine.clientsCount;
      if (count > 0) {
        console.log(
          `[socket] connections: ${count} | peak: ${metrics.peakConnections} | queue size: ${messageQueue.size}`
        );
      }
    }, 60000);
  }

  return io;
};

/**
 * Queue notification for offline user (call from controllers when user is offline)
 */
export const queueNotificationForUser = (io, userId, notification) => {
  const isOnline = userSockets.has(userId);
  if (isOnline) {
    io.to(getUserRoom(userId)).emit("notification", { notification });
  } else {
    queueForUser(userId, "notification", { notification });
  }
};

/**
 * Emit notification to user (online or queue)
 */
export const emitNotificationToUser = (io, userId, notification) => {
  queueNotificationForUser(io, userId, notification);
};
