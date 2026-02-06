  import mongoose from "mongoose";
  import ChatRoom from "../models/chatRoom.model.js";
  import Message from "../models/message.model.js";
  import Class from "../models/class.model.js";
  import Teacher from "../models/teacher.model.js";
  import { asyncHandler } from "../middlewares/error.middleware.js";

  /**
   * Get or create chat room for a class
   * @route   GET /api/chat/class/:classId
   * @access  Protected (TEACHER, STUDENT)
   */
  export const getOrCreateChatRoom = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const user = req.user;
    const classDoc = req.classDoc;

    // Find existing chat room
    let chatRoom = await ChatRoom.findOne({ classId }).populate("teacherId", "userId");

    if (!chatRoom) {
      // Create new chat room
      // Find the class teacher
      const classTeacher = await Teacher.findById(classDoc.classTeacherId);

      if (!classTeacher) {
        return res.status(404).json({
          success: false,
          message: "Class teacher not assigned. Please assign a class teacher first.",
        });
      }

      // Create chat room
      chatRoom = await ChatRoom.create({
        classId: classDoc._id,
        teacherId: classTeacher._id,
      });

      await chatRoom.populate("teacherId", "userId");
    }

    // Populate class info
    await chatRoom.populate("classId", "name section");

    res.status(200).json({
      success: true,
      message: "Chat room retrieved successfully",
      data: {
        chatRoom: {
          id: chatRoom._id,
          classId: chatRoom.classId._id,
          className: chatRoom.classId.name,
          classSection: chatRoom.classId.section,
          teacherId: chatRoom.teacherId._id,
          createdAt: chatRoom.createdAt,
        },
      },
    });
  });

  /**
   * Get paginated messages for a class chat
   * @route   GET /api/chat/:classId/messages
   * @access  Protected (TEACHER, STUDENT)
   */
  export const getMessages = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find chat room
    const chatRoom = await ChatRoom.findOne({ classId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found for this class",
      });
    }

    // Get messages (latest first)
    const messages = await Message.find({ chatRoomId: chatRoom._id })
      .populate("senderId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count
    const totalMessages = await Message.countDocuments({ chatRoomId: chatRoom._id });

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: messages.reverse(), // Reverse to show oldest first in response
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: skip + messages.length < totalMessages,
        },
      },
    });
  });

  /**
   * Send a message (text or media)
   * @route   POST /api/chat/:classId/message
   * @access  Protected (TEACHER, STUDENT)
   * Body: text?, chatRoomId? (optional; if provided and valid for this class, reuse it)
   */
  export const sendMessage = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const user = req.user;
    const { text, chatRoomId: bodyChatRoomId } = req.body;
    const file = req.file;

    // Validate: must have either text or file
    if (!text && !file) {
      return res.status(400).json({
        success: false,
        message: "Either text message or media file is required",
      });
    }

    // Resolve chat room: use provided chatRoomId if valid, else find or create by classId
    let chatRoom = null;
    if (bodyChatRoomId && mongoose.Types.ObjectId.isValid(bodyChatRoomId)) {
      chatRoom = await ChatRoom.findOne({
        _id: bodyChatRoomId,
        classId,
      });
      if (chatRoom) {
        // Reuse existing room (no create attempt)
      }
    }
    if (!chatRoom) {
      chatRoom = await ChatRoom.findOne({ classId });
    }
    if (!chatRoom) {
      const classDoc = await Class.findById(classId);
      const classTeacher = await Teacher.findById(classDoc?.classTeacherId);

      if (!classTeacher) {
        return res.status(404).json({
          success: false,
          message: "Class teacher not assigned. Please assign a class teacher first.",
        });
      }

      try {
        chatRoom = await ChatRoom.create({
          classId: classDoc._id,
          teacherId: classTeacher._id,
        });
      } catch (createErr) {
        // Duplicate key (race): another request created the room; reuse it
        if (createErr.code === 11000 || createErr.code === 11001) {
          chatRoom = await ChatRoom.findOne({ classId });
          if (chatRoom) {
            console.log("[chat] Duplicate room create for classId, reusing existing room:", classId);
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }
    }

    // Determine message type
    let messageType = "text";
    let mediaUrl = null;
    let mediaPublicId = null;

    if (file) {
      // Determine message type from file mime type
      if (file.mimetype.startsWith("image/")) {
        messageType = "image";
      } else if (file.mimetype === "application/pdf") {
        messageType = "pdf";
      } else if (file.mimetype.startsWith("audio/")) {
        messageType = "audio";
      }

      mediaUrl = file.path; // Cloudinary URL
      mediaPublicId = file.filename; // Cloudinary public_id
    }

    // Create message
    const message = await Message.create({
      chatRoomId: chatRoom._id,
      senderId: user._id,
      senderRole: user.role,
      messageType,
      text: text || null,
      mediaUrl,
      mediaPublicId,
    });

    // Populate sender info
    await message.populate("senderId", "name email");

    // Prepare message data (include classId for frontend room filtering)
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
    };

    // Emit Socket.IO event for real-time updates (single emit to room)
    const io = req.app.get("io");
    if (io) {
      const roomName = `class-${classId}`;
      io.to(roomName).emit("receiveMessage", {
        success: true,
        message: messageData,
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message: messageData,
        chatRoomId: chatRoom._id,
      },
    });
  });
