import apiClient from './apiClient';

export const profileService = {
  /**
   * Get current user's profile
   * @returns {Promise<{profile: object}>}
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/profile/me');
      if (response.data.success) {
        return response.data.data.profile;
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch profile. Please try again.'
      );
    }
  },

  /**
   * Update profile (name, profile image)
   * @param {object} data - { name?: string, profileImage?: File }
   * @returns {Promise<{profile: object}>}
   */
  async updateProfile(data) {
    try {
      const formData = new FormData();
      
      if (data.name !== undefined) {
        formData.append('name', data.name);
      }
      
      if (data.profileImage instanceof File) {
        formData.append('profileImage', data.profileImage);
      }

      const response = await apiClient.put('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.profile;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile. Please try again.'
      );
    }
  },

  /**
   * Send OTP for email/phone update
   * @param {string} type - 'email' or 'phone'
   * @param {string} email - New email (if type is 'email')
   * @param {string} phone - New phone (if type is 'phone')
   * @returns {Promise<{success: boolean, message: string, data?: object}>}
   */
  async sendOTP(type, email = null, phone = null) {
    try {
      const payload = { type };
      if (type === 'email' && email) {
        payload.email = email;
      } else if (type === 'phone' && phone) {
        payload.phone = phone;
      }

      const response = await apiClient.post('/profile/send-otp', payload);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || {},
        };
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to send OTP. Please try again.'
      );
    }
  },

  /**
   * Verify OTP and update email/phone
   * @param {string} type - 'email' or 'phone'
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<{success: boolean, message: string, data?: object}>}
   */
  async verifyOTP(type, otp) {
    try {
      const response = await apiClient.post('/profile/verify-otp', {
        type,
        otp,
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || {},
        };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'OTP verification failed. Please try again.'
      );
    }
  },
};
