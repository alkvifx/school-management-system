import apiClient from './apiClient';

export const principalService = {
  /**
   * Create a new teacher
   * @param {object} teacherData
   * @returns {Promise<object>}
   */
  async createTeacher(teacherData) {
    try {
      const response = await apiClient.post('/principal/create-teacher', teacherData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create teacher');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create teacher'
      );
    }
  },

  /**
   * Create a new student
   * @param {object} studentData
   * @returns {Promise<object>}
   */
  async createStudent(studentData) {
    try {
      const response = await apiClient.post('/principal/create-student', studentData);
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
   * Create a new class
   * @param {object} classData
   * @returns {Promise<object>}
   */
  async createClass(classData) {
    try {
      const response = await apiClient.post('/principal/create-class', classData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create class');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create class'
      );
    }
  },

  /**
   * Assign teacher to a class
   * @param {string} teacherId
   * @param {string} classId
   * @returns {Promise<object>}
   */
  async assignTeacher(teacherId, classId) {
    try {
      const response = await apiClient.post('/principal/assign-teacher', {
        teacherId,
        classId,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to assign teacher');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to assign teacher'
      );
    }
  },

  /**
   * Assign student to a class
   * @param {string} studentId
   * @param {string} classId
   * @returns {Promise<object>}
   */
  async assignStudent(studentId, classId) {
    try {
      const response = await apiClient.post('/principal/assign-student', {
        studentId,
        classId,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to assign student');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to assign student'
      );
    }
  },

  /**
   * Get all teachers
   * @returns {Promise<Array>}
   */
  async getTeachers() {
    try {
      const response = await apiClient.get('/principal/teachers');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teachers');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch teachers'
      );
    }
  },

  /**
   * Get all students
   * @returns {Promise<Array>}
   */
  async getStudents() {
    try {
      const response = await apiClient.get('/principal/students');
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
   * Get all classes
   * @returns {Promise<Array>}
   */
  async getClasses() {
    try {
      const response = await apiClient.get('/principal/classes');
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
   * Update school (with optional logo upload)
   * @param {object} schoolData - { name, address, logo?: File }
   * @returns {Promise<object>}
   */
  async updateSchool(schoolData) {
    try {
      const formData = new FormData();
      formData.append('name', schoolData.name);
      formData.append('address', schoolData.address);
      formData.append('phone', schoolData.phone);
      formData.append('email', schoolData.email);
      if (schoolData.logo) {
        formData.append('logo', schoolData.logo);
      }

      const response = await apiClient.put('principal/school', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update school');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update school'
      );
    }
  },

  /**
   * Get school info
   * @returns {Promise<object>}
   */
  async getSchool() {
    try {
      const response = await apiClient.get('/school');
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch school');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch school'
      );
    }
  },

  async getPrincipalDashboard() {
    try {
      const response = await apiClient.get('/principal');
      if (response.data.success) return response.data.data;
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
   * Aaj School Ka Pulse – today's school health overview (Principal only).
   * GET /api/principal/dashboard/pulse/today
   */
  async getPulseToday() {
    try {
      const response = await apiClient.get('/principal/dashboard/pulse/today');
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || 'Failed to fetch pulse');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch pulse'
      );
    }
  },

  /**
   * Silent Control – monitoring (Principal only).
   */
  async getMonitoringTeachers() {
    const response = await apiClient.get('/principal/monitoring/teachers');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch monitoring');
  },
  async getMonitoringClasses() {
    const response = await apiClient.get('/principal/monitoring/classes');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch monitoring');
  },
  async getMonitoringSummary() {
    const response = await apiClient.get('/principal/monitoring/summary');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch monitoring');
  },

  /**
   * Update teacher (with optional photo upload)
   * @param {string} teacherId
   * @param {object} teacherData - { name, email, qualification, experience, photo?: File }
   * @returns {Promise<object>}
   */
  async updateTeacher(teacherId, teacherData) {
    try {
      const formData = new FormData();
      formData.append('name', teacherData.name);
      formData.append('email', teacherData.email);
      if (teacherData.qualification) formData.append('qualification', teacherData.qualification);
      if (teacherData.experience) formData.append('experience', teacherData.experience);
      if (teacherData.photo) {
        formData.append('photo', teacherData.photo);
      }

      const response = await apiClient.put(`/principal/teacher/${teacherId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update teacher');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update teacher'
      );
    }
  },

  /**
   * Delete teacher
   * @param {string} teacherId
   * @returns {Promise<void>}
   */
  async deleteTeacher(teacherId) {
    try {
      const response = await apiClient.delete(`/principal/teacher/${teacherId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete teacher');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete teacher'
      );
    }
  },

  /**
   * Update student (with optional photo upload)
   * @param {string} studentId
   * @param {object} studentData - { name, email, classId, rollNumber, parentPhone, photo?: File }
   * @returns {Promise<object>}
   */
  async updateStudent(studentId, studentData) {
    try {
      const formData = new FormData();
      formData.append('name', studentData.name);
      formData.append('email', studentData.email);
      if (studentData.classId) formData.append('classId', studentData.classId);
      if (studentData.rollNumber) formData.append('rollNumber', studentData.rollNumber);
      if (studentData.parentPhone) formData.append('parentPhone', studentData.parentPhone);
      if (studentData.photo) {
        formData.append('photo', studentData.photo);
      }

      const response = await apiClient.put(`/principal/student/${studentId}`, formData, {
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

  /**
   * Delete student
   * @param {string} studentId
   * @returns {Promise<void>}
   */
  async deleteStudent(studentId) {
    try {
      const response = await apiClient.delete(`/principal/student/${studentId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete student');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete student'
      );
    }
  },

  /**
   * Update class
   * @param {string} classId
   * @param {object} classData - { name, section, classTeacherId }
   * @returns {Promise<object>}
   */
  async updateClass(classId, classData) {
    try {
      const response = await apiClient.put(`/principal/class/${classId}`, classData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update class');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update class'
      );
    }
  },

  /**
   * Delete class
   * @param {string} classId
   * @returns {Promise<void>}
   */
  async deleteClass(classId) {
    try {
      const response = await apiClient.delete(`/principal/class/${classId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete class');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete class'
      );
    }
  },
};
