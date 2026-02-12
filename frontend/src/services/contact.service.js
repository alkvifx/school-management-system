import apiClient from './apiClient';

export const contactService = {
  /**
   * Send a public contact message from the website.
   * @param {{name:string,email:string,phone?:string,subject:string,message:string}} payload
   */
  async sendMessage(payload) {
    try {
      const response = await apiClient.post('/public/contact', payload);
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to send message');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to send message. Please try again.'
      );
    }
  },
};

