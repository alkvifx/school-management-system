import apiClient from './apiClient';

export const notificationService = {
  /**
   * Create a notification (Principal only)
   * @param {object} notificationData - { title, message, targetRole, targetClass }
   * @returns {Promise<object>}
   */
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post('/principal/notifications', notificationData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create notification');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create notification'
      );
    }
  },

  /**
   * Get all notifications (Teacher/Student)
   * @returns {Promise<{ notifications: Array, pagination?: object }>}
   */
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch notifications');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch notifications'
      );
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
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
   * Mark all notifications as read (single API call)
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.put('/notifications/read-all');
      if (response.data.success) {
        return;
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
   * Get sent notifications (Principal only)
   * @returns {Promise<Array>}
   */
  async getSentNotifications() {
    try {
      const response = await apiClient.get('/principal/notifications');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch sent notifications');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch sent notifications'
      );
    }
  },

  /**
   * Delete notification (Principal only)
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/principal/notifications/${notificationId}`);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete notification');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete notification'
      );
    }
  },

  /**
   * Get VAPID public key for push notifications
   * @returns {Promise<string>}
   */
  async getVapidKey() {
    try {
      const response = await apiClient.get('/notifications/vapid-key');
      if (response.data.success) {
        return response.data.data.publicKey;
      }
      throw new Error(response.data.message || 'Failed to fetch VAPID key');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch VAPID key'
      );
    }
  },

  /**
   * Subscribe to push notifications
   * @param {object} subscription - PushSubscription object
   * @returns {Promise<void>}
   */
  async subscribeToPush(subscription) {
    try {
      const response = await apiClient.post('/notifications/subscribe', {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
      });
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to subscribe to push notifications');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to subscribe to push notifications'
      );
    }
  },

  /**
   * Unsubscribe from push notifications
   * @param {string} endpoint - Push subscription endpoint
   * @returns {Promise<void>}
   */
  async unsubscribeFromPush(endpoint) {
    try {
      const response = await apiClient.post('/notifications/unsubscribe', { endpoint });
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to unsubscribe from push notifications');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to unsubscribe from push notifications'
      );
    }
  },
};
