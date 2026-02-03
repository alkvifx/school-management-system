import apiClient from './apiClient';

export const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // Check if email is not verified
      if (!response.data.success && response.data.reason === 'EMAIL_NOT_VERIFIED') {
        // Store email in sessionStorage for verification page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', email);
        }
        const error = new Error('Email not verified');
        error.reason = 'EMAIL_NOT_VERIFIED';
        throw error;
      }

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store token and user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          // Clear pending verification email if exists
          sessionStorage.removeItem('pendingVerificationEmail');
        }

        return { token, user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Preserve EMAIL_NOT_VERIFIED reason
      if (error.reason === 'EMAIL_NOT_VERIFIED') {
        throw error;
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.'
      );
    }
  },

  /**
   * Logout user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user from storage
   * @returns {object|null}
   */
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  /**
   * Get token from storage
   * @returns {string|null}
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Verify email with OTP
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async verifyEmailOTP(email, otp) {
    try {
      const response = await apiClient.post('/auth/verify-email-otp', {
        email,
        otp,
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Verification failed. Please try again.'
      );
    }
  },

  /**
   * Resend email verification OTP
   * @param {string} email
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async resendEmailOTP(email) {
    try {
      const response = await apiClient.post('/auth/resend-verification-otp', {
        email,
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to resend OTP. Please try again.'
      );
    }
  },

  /**
   * Request password reset OTP
   * @param {string} email
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email,
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
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
   * Reset password with OTP
   * @param {string} email
   * @param {string} otp
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Password reset failed. Please try again.'
      );
    }
  },
};
