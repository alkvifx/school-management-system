import apiClient from './apiClient';

export const noticeService = {
  /**
   * Get latest notices for dashboard banner (Teacher/Student only)
   * @param {object} params - { limit }
   * @returns {Promise<Array>}
   */
  async getDashboardNotices(params = {}) {
    try {
      const { limit = 3 } = params;
      const response = await apiClient.get('/notices/dashboard', {
        params: { limit },
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard notices');
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view notices.');
      }
      if (error.response?.status === 401) {
        throw new Error('Please log in again.');
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard notices'
      );
    }
  },

  /**
   * Get notices for current user (Principal: sent; Teacher/Student: received)
   * @param {object} params - { page, limit, unreadOnly }
   * @returns {Promise<{ notices: Array, pagination: object }>}
   */
  async getMyNotices(params = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly } = params;
      const response = await apiClient.get('/notices/me', {
        params: { page, limit, ...(unreadOnly ? { unreadOnly: 'true' } : {}) },
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch notices');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch notices'
      );
    }
  },

  /**
   * Create notice (Principal only)
   * @param {object} payload - { title, message, targetRole, classId?, studentId?, teacherId?, isImportant?, attachments?, expiresAt? }
   * @returns {Promise<object>}
   */
  async createNotice(payload) {
    try {
      const response = await apiClient.post('/notices', payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create notice');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create notice'
      );
    }
  },

  /**
   * Mark all notices as read (TEACHER | STUDENT)
   * @returns {Promise<{ modifiedCount: number }>}
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notices/mark-all-read');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to mark all as read');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to mark all as read'
      );
    }
  },

  /**
   * Mark notice as read
   * @param {string} noticeId
   * @returns {Promise<void>}
   */
  async markAsRead(noticeId) {
    try {
      const response = await apiClient.patch(`/notices/${noticeId}/read`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to mark as read');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to mark as read'
      );
    }
  },

  /**
   * Delete notice (Principal only)
   * @param {string} noticeId
   * @returns {Promise<void>}
   */
  async deleteNotice(noticeId) {
    try {
      const response = await apiClient.delete(`/notices/${noticeId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete notice');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete notice'
      );
    }
  },
};
