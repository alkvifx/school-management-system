import Notice from "../models/notice.model.js";
import Student from "../models/student.model.js";

const ROLE = {
  PRINCIPAL: "PRINCIPAL",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
};

const normalizeRole = (role) => (role || "").toUpperCase();

const buildExpiryFilter = () => ({
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

const getStudentClassId = async (user) => {
  const student = await Student.findOne({
    userId: user._id,
    schoolId: user.schoolId,
    isActive: true,
  })
    .select("classId")
    .lean();
  return student?.classId || null;
};

export const buildNoticeQueryForUser = async (user, { unreadOnly = false } = {}) => {
  if (!user?.schoolId) {
    const err = new Error("User not assigned to any school");
    err.status = 403;
    throw err;
  }

  const role = normalizeRole(user.role);
  let baseQuery = {};

  if (role === ROLE.PRINCIPAL) {
    baseQuery = { createdBy: user._id, schoolId: user.schoolId };
  } else if (role === ROLE.TEACHER) {
    baseQuery = {
      schoolId: user.schoolId,
      $or: [
        { targetRole: "ALL" },
        { targetRole: "TEACHER", teacherId: null },
        { teacherId: user._id },
      ],
    };
  } else if (role === ROLE.STUDENT) {
    const classId = await getStudentClassId(user);
    const orConditions = [
      { targetRole: "ALL", classId: null },
      { targetRole: "STUDENT", studentId: null, classId: null },
      { studentId: user._id },
    ];

    if (classId) {
      orConditions.push({ classId, targetRole: { $in: ["STUDENT", "ALL"] } });
    }

    baseQuery = { schoolId: user.schoolId, $or: orConditions };
  } else {
    const err = new Error("Access denied");
    err.status = 403;
    throw err;
  }

  const query = {
    ...baseQuery,
    $and: [buildExpiryFilter()],
  };

  if (unreadOnly) {
    query.readBy = { $ne: user._id };
  }

  return query;
};

export const fetchNoticesForUser = async (user, options = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
  } = options;

  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * limitNum;

  const query = await buildNoticeQueryForUser(user, { unreadOnly });

  const [notices, total] = await Promise.all([
    Notice.find(query)
      .populate("createdBy", "name")
      .populate("classId", "name section")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notice.countDocuments(query),
  ]);

  const formatted = notices.map((n) => ({
    ...n,
    isReadByUser: n.readBy && n.readBy.some((id) => id.toString() === user._id.toString()),
  }));

  return {
    notices: formatted,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const markAllNoticesReadForUser = async (user) => {
  const query = await buildNoticeQueryForUser(user, { unreadOnly: true });
  const result = await Notice.updateMany(query, { $addToSet: { readBy: user._id } });
  return { modifiedCount: result.modifiedCount };
};
