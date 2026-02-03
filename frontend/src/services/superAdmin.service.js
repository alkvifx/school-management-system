import apiClient from './apiClient';

export const superAdminService = {
  /**
   * Create a new school
   * @param {object} schoolData
   * @returns {Promise<object>}
   */
  async createSchool(schoolData) {
    try {
      const response = await apiClient.post('/super-admin/create-school', schoolData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create school');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create school'
      );
    }
  },

  /**
   * Create a new principal
   * @param {object} principalData
   * @returns {Promise<object>}
   */
  async createPrincipal(principalData) {
    try {
      const response = await apiClient.post('/super-admin/create-principal', principalData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create principal');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create principal'
      );
    }
  },

  /**
   * Assign principal to a school
   * @param {string} principalId
   * @param {string} schoolId
   * @returns {Promise<object>}
   */
  async assignPrincipal(principalId, schoolId) {
    try {
      const response = await apiClient.post('/super-admin/assign-principal', {
        principalId,
        schoolId,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to assign principal');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to assign principal'
      );
    }
  },

  /**
   * Get all schools
   * @returns {Promise<Array>}
   */
  async getSchools() {
    try {
      const response = await apiClient.get('/super-admin/schools');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch schools');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch schools'
      );
    }
  },

  /**
   * Get all principals
   * @returns {Promise<Array>}
   */
  async getPrincipals() {
    try {
      const response = await apiClient.get('/super-admin/principals');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch principals');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch principals'
      );
    }
  },
};
