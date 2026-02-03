// User Roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};

// Route paths for each role
export const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.PRINCIPAL]: '/principal/dashboard',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
};

// Protected route patterns
export const PROTECTED_ROUTES = {
  [ROLES.SUPER_ADMIN]: ['/super-admin'],
  [ROLES.PRINCIPAL]: ['/principal', '/fees'],
  [ROLES.TEACHER]: ['/teacher', '/fees'],
  [ROLES.STUDENT]: ['/student', '/fees'],
};

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
