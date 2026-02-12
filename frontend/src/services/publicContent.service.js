import apiClient from './apiClient';

export const publicContentService = {
  /**
   * Fetch structured public website content for the active school
   * (used by public-facing pages like home, about, academics, gallery, footer).
   */
  async getPublicContent() {
    try {
      const response = await apiClient.get('/public/content');
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to load public content');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to load public content'
      );
    }
  },

  /**
   * Update public website content sections for the principal's school.
   * Only available to PRINCIPAL role via /api/principal/public-content.
   *
   * @param {object} sections - Partial sections object, e.g. { navbar: { callNumber }, footer: { social: {...} } }
   */
  async updatePublicContent(sections) {
    try {
      const response = await apiClient.put('/principal/public-content', {
        sections,
      });
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to update public content');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update public content'
      );
    }
  },
};

