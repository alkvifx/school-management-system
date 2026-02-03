import apiClient from './apiClient';

export const chatService = {
  /**
   * Get or create chat room for a class
   * @param {string} classId
   * @returns {Promise<object>}
   *
   * BUG FIX: Backend returns { success: true, data: { chatRoom: {...} } }
   * but frontend needs unwrapped chatRoom object
   */
  async getChatRoom(classId) {
    try {
      const response = await apiClient.get(`/chat/class/${classId}`);
      if (response.data.success) {
        // BUG FIX: Unwrap nested structure properly
        const chatRoomData = response.data.data?.chatRoom || response.data.data;
        return chatRoomData;
      }
      throw new Error(response.data.message || 'Failed to get chat room');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to get chat room'
      );
    }
  },

  /**
   * Fetch messages for a class
   * @param {string} classId
   * @param {object} params - { page, limit }
   * @returns {Promise<Array>}
   */
  async getMessages(classId, params = { page: 1, limit: 50 }) {
    try {
      const response = await apiClient.get(`/chat/${classId}/messages`, { params });
      if (response.data.success) {
        const data = response.data.data;
        // Backend may return an array OR an object like { messages: [...] }
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.messages)) return data.messages;
        return [];
      }
      throw new Error(response.data.message || 'Failed to fetch messages');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch messages'
      );
    }
  },

  /**
   * Send a message to a class
   * @param {string} classId
   * @param {object} messageData - { text?, media?: File }
   * @returns {Promise<object>}
   */
  async sendMessage(classId, messageData) {
    try {
      const formData = new FormData();

      if (messageData.text) {
        formData.append('text', messageData.text);
      }

      if (messageData.media) {
        formData.append('media', messageData.media);
      }

      const response = await apiClient.post(`/chat/${classId}/message`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        // Backend may return message directly OR wrapped
        return data?.message || data;
      }
      throw new Error(response.data.message || 'Failed to send message');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to send message'
      );
    }
  },
};
