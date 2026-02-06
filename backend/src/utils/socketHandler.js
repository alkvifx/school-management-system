import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import ChatRoom from "../models/chatRoom.model.js";
import Message from "../models/message.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Class from "../models/class.model.js";

// In-memory connection tracking (Redis-adapter ready: replace Map with shared store)
const userSockets = new Map(); // userId -> Set(socketId)
const socketMeta = new Map(); // socketId -> { userId }

const MAX_SOCKETS_PER_USER = 5; // helps prevent leaks/abuse while allowing multi-tab

const emitChatError = (socket, message) => {
  // Keep frontend contract: event name is exactly "error" with { message }
  try {
    socket.emit("error", { message });
  } catch {
    // never throw from error path
  }
};

const safeAck = (ack, payload) => {
  if (typeof ack !== "function") return;
  try {
    ack(payload);
  } catch {
    // ignore client ack handler failures
  }
};

/**
 * Authenticate Socket.IO connection using JWT
 */
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (!user.isActive) {
      return next(new Error("Authentication error: User account is inactive"));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

/**
 * Validate if user has access to a class chat room
 */
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
    // Principal can access chats for classes in their school
    if (!user.schoolId) return false;
    const doc = classDoc || (await Class.findById(classId).select("schoolId isActive"));
    if (!doc) return false;
    return doc.schoolId?.toString() === user.schoolId.toString();
  } else if (user.role === "SUPER_ADMIN") {
    // Super admin can access any class chat
    return true;
  }
  return false;
};

/**
 * Initialize Socket.IO event handlers
 */
export const initializeSocketIO = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Track connection(s) per user for cleanup + online state
    const userId = socket.user._id.toString();
    const existing = userSockets.get(userId) || new Set();
    existing.add(socket.id);
    userSockets.set(userId, existing);
    socketMeta.set(socket.id, { userId });

    // Guard against runaway reconnection loops / abuse
    if (existing.size > MAX_SOCKETS_PER_USER) {
      console.warn(
        `User ${userId} exceeded max sockets (${existing.size}). Disconnecting newest socket ${socket.id}.`
      );
      emitChatError(socket, "Too many active connections. Please close extra tabs and retry.");
      socket.disconnect(true);
      return;
    }

    /**
     * Join a class chat room
     * Event: joinClassRoom
     * Payload: { classId: string }
     */
    socket.on("joinClassRoom", async (data = {}, ack) => {
      try {
        const { classId } = data;

        if (!classId) {
          emitChatError(socket, "Class ID is required");
          safeAck(ack, { success: false, message: "Class ID is required" });
          return;
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          emitChatError(socket, "Invalid class ID");
          safeAck(ack, { success: false, message: "Invalid class ID" });
          return;
        }

        // Validate class exists
        const classDoc = await Class.findById(classId);
        if (!classDoc || !classDoc.isActive) {
          emitChatError(socket, "Class not found or inactive");
          safeAck(ack, { success: false, message: "Class not found or inactive" });
          return;
        }

        // Validate user access
        const hasAccess = await validateClassAccess(socket.user, classId, classDoc);
        if (!hasAccess) {
          emitChatError(socket, "You do not have access to this class chat");
          safeAck(ack, { success: false, message: "You do not have access to this class chat" });
          return;
        }

        // Join the room (room name: class-{classId})
        const roomName = `class-${classId}`;
        socket.join(roomName);

        console.log(`User ${socket.user.name} joined room: ${roomName}`);

        // Emit success
        socket.emit("joinedClassRoom", {
          success: true,
          classId,
          roomName,
        });

        safeAck(ack, { success: true, classId, roomName });
      } catch (error) {
        console.error("Error joining class room:", error);
        emitChatError(socket, "Failed to join class room");
        safeAck(ack, { success: false, message: "Failed to join class room" });
      }
    });

    /**
     * Send a message
     * Event: sendMessage
     * Payload: { classId: string, text?: string, messageType: string }
     */
    socket.on("sendMessage", async (data = {}, ack) => {
      try {
        const { classId, chatRoomId: bodyChatRoomId, text, messageType = "text", mediaUrl, clientMessageId } = data;

        if (!classId) {
          emitChatError(socket, "Class ID is required");
          safeAck(ack, { success: false, message: "Class ID is required" });
          return;
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          emitChatError(socket, "Invalid class ID");
          safeAck(ack, { success: false, message: "Invalid class ID" });
          return;
        }

        // Validate class exists and is active
        const classDoc = await Class.findById(classId).select("isActive schoolId classTeacherId");
        if (!classDoc || !classDoc.isActive) {
          emitChatError(socket, "Class not found or inactive");
          safeAck(ack, { success: false, message: "Class not found or inactive" });
          return;
        }

        // Validate user access
        const hasAccess = await validateClassAccess(socket.user, classId, classDoc);
        if (!hasAccess) {
          emitChatError(socket, "You do not have access to this class chat");
          safeAck(ack, { success: false, message: "You do not have access to this class chat" });
          return;
        }

        // Validate message content
        if (!text && !mediaUrl) {
          emitChatError(socket, "Message text or media is required");
          safeAck(ack, { success: false, message: "Message text or media is required" });
          return;
        }

        // Resolve chat room: use provided chatRoomId if valid, else find or create by classId
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

        // Optional idempotency: prevent duplicates when client retries
        // (Frontend contract unchanged: clientMessageId is optional and ignored if absent)
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

            // Ack success but do NOT re-broadcast (prevents duplicates)
            safeAck(ack, { success: true, message: messageData, deduped: true });
            return;
          }
        }

        // Create message
        const message = await Message.create({
          chatRoomId: chatRoom._id,
          senderId: socket.user._id,
          senderRole: socket.user.role,
          messageType: messageType || "text",
          text: text || null,
          mediaUrl: mediaUrl || null,
          clientMessageId: clientMessageId && typeof clientMessageId === "string" ? clientMessageId : null,
        });

        // Populate sender info
        await message.populate("senderId", "name email");

        // Prepare message data for broadcast (include classId for frontend filtering)
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

        // Emit to all users in the class room (single emit, no duplicate)
        const roomName = `class-${classId}`;
        io.to(roomName).emit("receiveMessage", {
          success: true,
          message: messageData,
        });

        console.log(`Message sent in room ${roomName} by ${socket.user.name}`);
        safeAck(ack, { success: true, message: messageData, chatRoomId: chatRoom._id });
      } catch (error) {
        console.error("Error sending message:", error);
        emitChatError(socket, "Failed to send message");
        safeAck(ack, { success: false, message: "Failed to send message" });
      }
    });

    /**
     * Leave a class chat room
     */
    socket.on("leaveClassRoom", (data) => {
      const { classId } = data || {};
      if (classId) {
        const roomName = `class-${classId}`;
        socket.leave(roomName);
        console.log(`User ${socket.user.name} left room: ${roomName}`);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);

      // Cleanup connection tracking
      const meta = socketMeta.get(socket.id);
      if (meta?.userId) {
        const set = userSockets.get(meta.userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) userSockets.delete(meta.userId);
          else userSockets.set(meta.userId, set);
        }
      }
      socketMeta.delete(socket.id);
    });
  });

  return io;
};
