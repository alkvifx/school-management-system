# Backend Upgrade Summary

## Overview
This document summarizes all the upgrades made to the School Management System backend, including UPDATE/DELETE permissions, media upload system, CMS, and notification system.

---

## ✅ PART 1: UPDATE & DELETE PERMISSIONS

### Principal Capabilities

#### Update Operations
- **Update School** (`PUT /api/principal/school`)
  - Update name, address
  - Upload/update logo (with Cloudinary)
  
- **Update Teacher** (`PUT /api/principal/teacher/:id`)
  - Update name, email, qualification, experience
  - Upload/update photo
  
- **Update Student** (`PUT /api/principal/student/:id`)
  - Update name, email, classId, rollNumber, parentPhone
  - Upload/update photo
  
- **Update Class** (`PUT /api/principal/class/:id`)
  - Update name, section
  - Update class teacher

#### Delete Operations (Soft Delete)
- **Delete Teacher** (`DELETE /api/principal/teacher/:id`)
  - Soft delete (sets `isActive: false`)
  - Prevents deletion if teacher is assigned to active classes
  
- **Delete Student** (`DELETE /api/principal/student/:id`)
  - Soft delete (sets `isActive: false`)
  
- **Delete Class** (`DELETE /api/principal/class/:id`)
  - Soft delete (sets `isActive: false`)
  - Prevents deletion if class has active students

### Teacher Capabilities

#### Update Operations
- **Update Student** (`PUT /api/teacher/student/:id`)
  - Can only update: name, parentPhone
  - Can upload photo
  - Must be assigned to student's class

#### Delete Operations
- **Remove Student** (`DELETE /api/teacher/student/:id`)
  - Teachers cannot delete students globally
  - Only principals can delete students

---

## ✅ PART 2: MEDIA UPLOAD SYSTEM (MULTER + CLOUDINARY)

### Features
- **Multiple Upload Types**
  - `uploadLogo` - For school logos (images only)
  - `uploadPhoto` - For user photos (images only)
  - `uploadMedia` - For website media (images + videos)

- **File Validation**
  - Allowed image types: JPEG, JPG, PNG, GIF, WEBP
  - Allowed video types: MP4, MPEG, MOV, AVI
  - Max file size: 10MB
  - Mime type validation

- **Cloudinary Integration**
  - Automatic upload to Cloudinary
  - Stores `url` and `publicId` in database
  - Automatic deletion of old assets on update/delete
  - Environment variable configuration

### Updated Models
All models now use photo object structure:
```javascript
photo: {
  url: String,
  publicId: String
}
```

### Utility Functions
- `deleteFromCloudinary(publicId)` - Delete single file
- `deleteMultipleFromCloudinary(publicIds)` - Delete multiple files

---

## ✅ PART 3: SCHOOL WEBSITE CMS

### Page Model
- `title` - Page title
- `slug` - URL-friendly slug (auto-generated)
- `content` - HTML/JSON content
- `schoolId` - School ownership
- `isPublished` - Publication status
- `createdBy` - Creator reference

### Media Model
- `url` - Cloudinary URL
- `publicId` - Cloudinary public ID
- `type` - image or video
- `schoolId` - School ownership
- `uploadedBy` - Uploader reference
- `filename` - Original filename
- `size` - File size in bytes

### Principal APIs

#### Pages
- `POST /api/principal/pages` - Create page
- `GET /api/principal/pages` - Get all pages (with filters)
- `GET /api/principal/pages/:id` - Get single page
- `PUT /api/principal/pages/:id` - Update page
- `DELETE /api/principal/pages/:id` - Delete page

#### Media
- `POST /api/principal/media` - Upload media
- `GET /api/principal/media` - Get all media (paginated, filterable by type)
- `DELETE /api/principal/media/:id` - Delete media

#### Logo Upload
- `POST /api/principal/upload/logo` - Upload school logo

### Features
- Auto slug generation from title
- Slug uniqueness validation
- Pagination for media
- Type filtering (image/video)
- Automatic Cloudinary cleanup on delete

---

## ✅ PART 4: NOTIFICATION SYSTEM

### Notification Model
- `title` - Notification title
- `message` - Notification message
- `schoolId` - School ownership
- `targetRole` - TEACHER | STUDENT | ALL
- `targetClass` - Optional class filter
- `createdBy` - Creator reference
- `isRead[]` - Array of user IDs who read it

### Principal APIs
- `POST /api/principal/notifications` - Create notification
- `GET /api/principal/notifications` - Get all notifications (paginated, filterable)
- `DELETE /api/principal/notifications/:id` - Delete notification

### User APIs (Teacher & Student)
- `GET /api/notifications` - Get user notifications (paginated)
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Features
- Role-based targeting (TEACHER, STUDENT, ALL)
- Class-specific notifications
- Read/unread tracking
- Pagination
- Automatic filtering based on user role and class

---

## 📁 NEW FILES CREATED

### Models
- `src/models/page.model.js`
- `src/models/media.model.js`
- `src/models/notification.model.js`

### Controllers
- `src/controllers/cms.controller.js`
- `src/controllers/notification.controller.js`

### Routes
- `src/routes/notification.routes.js`

### Utils
- `src/utils/cloudinaryHelper.js`
- `src/utils/slugGenerator.js`

### Updated Files
- All model files (added photo objects)
- `src/middlewares/upload.middleware.js` (enhanced)
- `src/config/cloudinary.js` (env variables)
- `src/controllers/principal.controller.js` (added update/delete)
- `src/controllers/teacher.controller.js` (added update)
- `src/routes/principal.routes.js` (added new routes)
- `src/routes/teacher.routes.js` (added new routes)
- `src/app.js` (added notification routes)

---

## 🔒 SECURITY FEATURES

1. **Role-Based Access Control**
   - All endpoints validate user role
   - School-based data isolation

2. **School Ownership Validation**
   - Every update/delete validates school ownership
   - Users can only access their school's data

3. **ObjectId Validation**
   - All IDs validated before database queries
   - Prevents invalid ID errors

4. **Soft Delete**
   - All deletes are soft deletes (`isActive: false`)
   - Data preserved for audit purposes

5. **File Upload Security**
   - Mime type validation
   - File size limits
   - Secure Cloudinary storage

6. **Error Handling**
   - All controllers wrapped in `asyncHandler`
   - Centralized error handling
   - No server crashes

---

## 📝 ENVIRONMENT VARIABLES

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 API ENDPOINTS SUMMARY

### Principal Endpoints (New)
- `PUT /api/principal/school` - Update school
- `PUT /api/principal/teacher/:id` - Update teacher
- `PUT /api/principal/student/:id` - Update student
- `PUT /api/principal/class/:id` - Update class
- `DELETE /api/principal/teacher/:id` - Delete teacher
- `DELETE /api/principal/student/:id` - Delete student
- `DELETE /api/principal/class/:id` - Delete class
- `POST /api/principal/upload/logo` - Upload logo
- `POST /api/principal/pages` - Create page
- `GET /api/principal/pages` - Get pages
- `GET /api/principal/pages/:id` - Get page
- `PUT /api/principal/pages/:id` - Update page
- `DELETE /api/principal/pages/:id` - Delete page
- `POST /api/principal/media` - Upload media
- `GET /api/principal/media` - Get media
- `DELETE /api/principal/media/:id` - Delete media
- `POST /api/principal/notifications` - Create notification
- `GET /api/principal/notifications` - Get notifications
- `DELETE /api/principal/notifications/:id` - Delete notification

### Teacher Endpoints (New)
- `PUT /api/teacher/student/:id` - Update student
- `DELETE /api/teacher/student/:id` - Remove student (returns error - only principal can delete)

### Notification Endpoints (New)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

---

## 🎯 KEY FEATURES

1. **Complete CRUD Operations**
   - All entities now support update and delete
   - Soft delete preserves data

2. **Media Management**
   - Secure file uploads
   - Automatic Cloudinary integration
   - Old asset cleanup

3. **Content Management**
   - Page creation and management
   - Media library
   - Publication control

4. **Notification System**
   - Role-based targeting
   - Class-specific notifications
   - Read/unread tracking

5. **Pagination**
   - Media listing
   - Notification listing

6. **Slug Generation**
   - Auto-generated from title
   - Unique per school
   - URL-friendly

---

## ✅ QUALITY ASSURANCE

- ✅ All controllers use `asyncHandler`
- ✅ Structured JSON responses
- ✅ Proper HTTP status codes
- ✅ Input validation
- ✅ Error handling
- ✅ No server crashes
- ✅ Clean code architecture
- ✅ Reusable utilities
- ✅ Environment variable configuration

---

## 📚 USAGE EXAMPLES

### Update School with Logo
```bash
PUT /api/principal/school
Content-Type: multipart/form-data
{
  "name": "Updated School Name",
  "address": "New Address",
  "logo": <file>
}
```

### Create Page
```bash
POST /api/principal/pages
{
  "title": "About Us",
  "content": "<h1>About Our School</h1>",
  "isPublished": true
}
```

### Create Notification
```bash
POST /api/principal/notifications
{
  "title": "Important Announcement",
  "message": "School will be closed tomorrow",
  "targetRole": "ALL"
}
```

### Upload Media
```bash
POST /api/principal/media
Content-Type: multipart/form-data
{
  "media": <file>
}
```

---

## 🎉 Production Ready

All features are production-ready with:
- Proper error handling
- Security validations
- Clean architecture
- Scalable design
- Comprehensive documentation
