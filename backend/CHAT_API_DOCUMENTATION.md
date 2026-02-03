# Chat System API Documentation

## Overview
Class-based group chat system for Teachers and Students. Each class has one chat room where the assigned class teacher and all students of that class can communicate.

---

## Database Models

### ChatRoom
- `classId` (ObjectId, required, unique) - Reference to Class
- `teacherId` (ObjectId, required) - Reference to Teacher (class teacher)
- `createdAt` (Date, auto)

### Message
- `chatRoomId` (ObjectId, required) - Reference to ChatRoom
- `senderId` (ObjectId, required) - Reference to User
- `senderRole` (String, enum: "TEACHER" | "STUDENT", required)
- `messageType` (String, enum: "text" | "image" | "pdf" | "audio", default: "text")
- `text` (String, optional) - Text content
- `mediaUrl` (String, optional) - Cloudinary URL for media files
- `mediaPublicId` (String, optional) - Cloudinary public_id for media files
- `createdAt` (Date, auto)

---

## REST API Endpoints

### 1. Get or Create Chat Room
**GET** `/api/chat/class/:classId`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Chat room retrieved successfully",
  "data": {
    "chatRoom": {
      "id": "507f1f77bcf86cd799439011",
      "classId": "507f1f77bcf86cd799439012",
      "className": "10",
      "classSection": "A",
      "teacherId": "507f1f77bcf86cd799439013",
      "createdAt": "2026-01-25T10:00:00.000Z"
    }
  }
}
```

---

### 2. Get Messages (Paginated)
**GET** `/api/chat/:classId/messages?page=1&limit=50`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Messages per page

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "507f1f77bcf86cd799439014",
        "chatRoomId": "507f1f77bcf86cd799439011",
        "sender": {
          "id": "507f1f77bcf86cd799439015",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "senderRole": "TEACHER",
        "messageType": "text",
        "text": "Hello class!",
        "mediaUrl": null,
        "createdAt": "2026-01-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 125,
      "hasMore": true
    }
  }
}
```

---

### 3. Send Message
**POST** `/api/chat/:classId/message`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `text` (optional) - Text message
- `media` (optional) - Media file (image, PDF, or audio)

**Note:** Either `text` or `media` (or both) must be provided.

**Example 1: Text Message**
```
text: "Hello everyone!"
```

**Example 2: Image Message**
```
media: <image file>
text: "Check this out!"
```

**Example 3: PDF Message**
```
media: <PDF file>
text: "Assignment file"
```

**Example 4: Audio Message**
```
media: <audio file>
text: "Voice note"
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "507f1f77bcf86cd799439014",
      "chatRoomId": "507f1f77bcf86cd799439011",
      "sender": {
        "id": "507f1f77bcf86cd799439015",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "senderRole": "TEACHER",
      "messageType": "image",
      "text": "Check this out!",
      "mediaUrl": "https://res.cloudinary.com/...",
      "createdAt": "2026-01-25T10:00:00.000Z"
    }
  }
}
```

---

## Socket.IO Events

### Connection
Connect to Socket.IO server with authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

---

### Client → Server Events

#### 1. Join Class Room
**Event:** `joinClassRoom`

**Payload:**
```json
{
  "classId": "507f1f77bcf86cd799439012"
}
```

**Response Event:** `joinedClassRoom`
```json
{
  "success": true,
  "classId": "507f1f77bcf86cd799439012",
  "roomName": "class-507f1f77bcf86cd799439012"
}
```

**Error Event:** `error`
```json
{
  "message": "You do not have access to this class chat"
}
```

---

#### 2. Send Message
**Event:** `sendMessage`

**Payload:**
```json
{
  "classId": "507f1f77bcf86cd799439012",
  "text": "Hello class!",
  "messageType": "text"
}
```

**Or with media:**
```json
{
  "classId": "507f1f77bcf86cd799439012",
  "text": "Check this image",
  "messageType": "image",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

**Response Event:** `receiveMessage` (broadcasted to all users in the room)
```json
{
  "success": true,
  "message": {
    "id": "507f1f77bcf86cd799439014",
    "chatRoomId": "507f1f77bcf86cd799439011",
    "sender": {
      "id": "507f1f77bcf86cd799439015",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "senderRole": "TEACHER",
    "messageType": "text",
    "text": "Hello class!",
    "mediaUrl": null,
    "createdAt": "2026-01-25T10:00:00.000Z"
  }
}
```

---

#### 3. Leave Class Room
**Event:** `leaveClassRoom`

**Payload:**
```json
{
  "classId": "507f1f77bcf86cd799439012"
}
```

---

### Server → Client Events

#### 1. Receive Message
**Event:** `receiveMessage`

Emitted to all users in the class room when a new message is sent.

**Payload:** Same as `sendMessage` response above.

---

#### 2. Error
**Event:** `error`

Emitted when an error occurs.

**Payload:**
```json
{
  "message": "Error description"
}
```

---

## Authorization & Security

### Access Control
- **Teachers:** Can only access chats for classes they are assigned to
- **Students:** Can only access chats for their own class
- **Cross-class access is strictly blocked**

### Authentication
- All REST endpoints require JWT token in `Authorization` header
- Socket.IO connections require JWT token in `auth.token` or `Authorization` header

---

## Media Upload

### Supported File Types
- **Images:** JPEG, JPG, PNG, GIF, WebP
- **PDF:** application/pdf
- **Audio:** MP3, WAV, OGG, AAC

### File Size Limit
- Maximum: 10MB per file

### Storage
- All media files are uploaded to Cloudinary
- URLs are stored in the database
- Files are organized in `schools/chat-media/` folder

---

## Example Usage

### REST API Example (Node.js/Express)
```javascript
// Get chat room
const response = await fetch('http://localhost:5000/api/chat/class/CLASS_ID', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Send text message
const formData = new FormData();
formData.append('text', 'Hello class!');

await fetch('http://localhost:5000/api/chat/CLASS_ID/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Send image message
const formData = new FormData();
formData.append('media', imageFile);
formData.append('text', 'Check this out!');

await fetch('http://localhost:5000/api/chat/CLASS_ID/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Socket.IO Example (Client)
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});

// Join class room
socket.emit("joinClassRoom", { classId: "CLASS_ID" });

socket.on("joinedClassRoom", (data) => {
  console.log("Joined room:", data);
});

// Send message
socket.emit("sendMessage", {
  classId: "CLASS_ID",
  text: "Hello everyone!",
  messageType: "text"
});

// Receive messages
socket.on("receiveMessage", (data) => {
  console.log("New message:", data.message);
});

// Handle errors
socket.on("error", (error) => {
  console.error("Socket error:", error.message);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Either text message or media file is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not assigned to this class"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Class not found"
}
```

---

## Notes

1. Chat rooms are automatically created when first accessed
2. Messages are paginated (latest first, then reversed for display)
3. Real-time updates work for both REST API and Socket.IO
4. Media files must be uploaded via REST API (multipart/form-data)
5. Socket.IO is recommended for real-time chat experience
6. All timestamps are in ISO 8601 format (UTC)
