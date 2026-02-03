import apiClient from './apiClient';

export const studentService = {
  /**
   * Get student profile
   * @returns {Promise<object>}
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/student/profile');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch profile'
      );
    }
  },

  /**
   * Get student attendance
   * @param {object} filters - Optional filters like { startDate, endDate, classId }
   * @returns {Promise<Array>}
   */
  async getAttendance(filters = {}) {
    try {
      const response = await apiClient.get('/student/attendance', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch attendance');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch attendance'
      );
    }
  },

  /**
   * Get student marks
   * @param {object} filters - Optional filters like { examType, subject, classId }
   * @returns {Promise<Array>}
   */
  async getMarks(filters = {}) {
    try {
      const response = await apiClient.get('/student/marks', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch marks');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch marks'
      );
    }
  },
};
