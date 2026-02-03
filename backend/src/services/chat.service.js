import ChatRoom from "../models/chatRoom.model.js";
import Class from "../models/class.model.js";
import Teacher from "../models/teacher.model.js";
import mongoose from "mongoose";

/**
 * Atomically get or create a class ChatRoom.
 * FIXED: Better race condition handling
 */
export async function getOrCreateClassChatRoom(classId) {
  // Validate class existence and teacher assignment
  const classDoc = await Class.findById(classId).select("classTeacherId name section isActive");
  if (!classDoc) {
    const err = new Error("Class not found");
    err.status = 404;
    throw err;
  }

  if (!classDoc.isActive) {
    const err = new Error("Class is not active");
    err.status = 400;
    throw err;
  }

  const classTeacher = classDoc.classTeacherId
    ? await Teacher.findById(classDoc.classTeacherId)
    : null;

  if (!classTeacher) {
    const err = new Error("Class teacher not assigned");
    err.status = 404;
    throw err;
  }

  // Try to find existing chat room first
  let chatRoom = await ChatRoom.findOne({ classId: classDoc._id })
    .populate("teacherId", "userId")
    .populate("classId", "name section");

  // If chat room exists, return it
  if (chatRoom) {
    return chatRoom;
  }

  // If not exists, try to create with better error handling
  try {
    chatRoom = await ChatRoom.create({
      classId: classDoc._id,
      teacherId: classTeacher._id,
    });

    // Populate after creation
    chatRoom = await ChatRoom.findById(chatRoom._id)
      .populate("teacherId", "userId")
      .populate("classId", "name section");

    return chatRoom;
  } catch (error) {
    // If duplicate error (race condition), find the existing one
    if (error.code === 11000 || error.code === 11001) {
      console.log("Race condition detected, finding existing chat room...");
      chatRoom = await ChatRoom.findOne({ classId: classDoc._id })
        .populate("teacherId", "userId")
        .populate("classId", "name section");

      if (chatRoom) {
        return chatRoom;
      }
    }
    throw error;
  }
}