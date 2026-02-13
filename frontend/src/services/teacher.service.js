import apiClient from './apiClient';

export const teacherService = {
  /**
   * Get teacher dashboard stats (totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents)
   * @returns {Promise<{ totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents }>}
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/teacher/dashboard');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard'
      );
    }
  },

  /**
   * Get all classes assigned to teacher
   * @returns {Promise<Array>}
   */
  async getClasses() {
    try {
      const response = await apiClient.get('/teacher/classes');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch classes');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch classes'
      );
    }
  },

  /**
   * Get all students in teacher's classes (optional classId filter)
   * @param {{ classId?: string }} params
   * @returns {Promise<Array>}
   */
  async getStudents(params = {}) {
    try {
      const response = await apiClient.get('/teacher/students', { params });
      console.log(response)
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch students');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch students'
      );
    }
  },

  /**
   * Create a new student (teacher can only create in their assigned classes)
   * @param {object} data - { name, email, password, classId, rollNumber, parentPhone }
   * @returns {Promise<object>}
   */
  async createStudent(data) {
    try {
      const response = await apiClient.post('/teacher/students', data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create student');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create student'
      );
    }
  },

  /**
   * Mark attendance for students
   * @param {object} attendanceData - { date, classId, students: [{ studentId, status }] }
   * @returns {Promise<object>}
   */
  async markAttendance(attendanceData) {
    try {
      const response = await apiClient.post('/teacher/attendance', attendanceData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to mark attendance');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to mark attendance'
      );
    }
  },

  /**
   * Submit marks for students
   * @param {object} marksData - { examType, subject, classId, marks: [{ studentId, marks }] }
   * @returns {Promise<object>}
   */
  async submitMarks(marksData) {
    try {
      const response = await apiClient.post('/teacher/marks', marksData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit marks');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit marks'
      );
    }
  },

  /**
   * Update student (Teacher can update name, parentPhone, photo)
   * @param {string} studentId
   * @param {object} studentData - { name, parentPhone, photo?: File }
   * @returns {Promise<object>}
   */
  async updateStudent(studentId, studentData) {
    try {
      const formData = new FormData();
      if (studentData.name) formData.append('name', studentData.name);
      if (studentData.parentPhone) formData.append('parentPhone', studentData.parentPhone);
      if (studentData.photo) {
        formData.append('photo', studentData.photo);
      }

      const response = await apiClient.put(`/teacher/student/${studentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update student');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update student'
      );
    }
  },
};
