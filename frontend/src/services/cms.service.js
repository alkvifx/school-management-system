import apiClient from './apiClient';

export const cmsService = {
  /**
   * Create a new page
   * @param {object} pageData - { title, content, isPublished }
   * @returns {Promise<object>}
   */
  async createPage(pageData) {
    try {
      const response = await apiClient.post('/principal/pages', pageData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create page');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create page'
      );
    }
  },

  /**
   * Get all pages
   * @returns {Promise<Array>}
   */
  async getPages() {
    try {
      const response = await apiClient.get('/principal/pages');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pages');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch pages'
      );
    }
  },

  /**
   * Update a page
   * @param {string} pageId
   * @param {object} pageData - { title, content, isPublished }
   * @returns {Promise<object>}
   */
  async updatePage(pageId, pageData) {
    try {
      const response = await apiClient.put(`/principal/pages/${pageId}`, pageData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update page');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update page'
      );
    }
  },

  /**
   * Delete a page
   * @param {string} pageId
   * @returns {Promise<void>}
   */
  async deletePage(pageId) {
    try {
      const response = await apiClient.delete(`/principal/pages/${pageId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete page');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete page'
      );
    }
  },

  /**
   * Upload media file
   * @param {File} file
   * @returns {Promise<object>}
   */
  async uploadMedia(file) {
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await apiClient.post('/principal/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to upload media');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload media'
      );
    }
  },

  /**
   * Get all media
   * @param {object} filters - Optional filters like { type, page, limit }
   * @returns {Promise<Array>}
   */
  async getMedia(filters = {}) {
    try {
      const response = await apiClient.get('/principal/media', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch media');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch media'
      );
    }
  },

  /**
   * Delete media
   * @param {string} mediaId
   * @returns {Promise<void>}
   */
  async deleteMedia(mediaId) {
    try {
      const response = await apiClient.delete(`/principal/media/${mediaId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete media');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete media'
      );
    }
  },
};
