import apiClient from './apiClient';

export const feesService = {
  /**
   * Create fee structure (Principal only)
   * @param {object} feeStructureData - { classId, academicYear, feeType, components, dueDate, lateFinePerDay }
   * @returns {Promise<object>}
   */
  async createFeeStructure(feeStructureData) {
    try {
      console.log(feeStructureData)
      const response = await apiClient.post('/fees/structure', feeStructureData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create fee structure');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create fee structure'
      );
    }
  },

  /**
   * Get all fee structures (Principal only)
   * @param {object} filters - Optional filters like { classId, academicYear, isActive }
   * @returns {Promise<Array>}
   */
  async getFeeStructures(filters = {}) {
    try {
      const response = await apiClient.get('/fees/structure', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee structures');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee structures'
      );
    }
  },

  /**
   * Get single fee structure by ID
   * @param {string} structureId
   * @returns {Promise<object>}
   */
  async getFeeStructure(structureId) {
    try {
      const response = await apiClient.get(`/fees/structure/${structureId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee structure');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee structure'
      );
    }
  },

  /**
   * Update fee structure (Principal only)
   * @param {string} structureId
   * @param {object} feeStructureData
   * @returns {Promise<object>}
   */
  async updateFeeStructure(structureId, feeStructureData) {
    try {
      const response = await apiClient.put(
        `/fees/structure/${structureId}`,
        feeStructureData
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update fee structure');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update fee structure'
      );
    }
  },

  /**
   * Activate/Deactivate fee structure (Principal only)
   * @param {string} structureId
   * @param {boolean} isActive
   * @returns {Promise<object>}
   */
  async toggleFeeStructureStatus(structureId, isActive) {
    try {
      const response = await apiClient.patch(`/fees/structure/${structureId}/status`, {
        isActive,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update fee structure status');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update fee structure status'
      );
    }
  },

  /**
   * Initialize student fees (Principal only)
   * @param {string} structureId
   * @returns {Promise<object>}
   */
  async initializeStudentFees(structureId) {
    try {
      const response = await apiClient.post('/fees/initialize', { structureId });
      if (response.data.success) {
        return {
          ...response.data.data,
          count: response.data.data.count || 0,
        };
      }
      throw new Error(response.data.message || 'Failed to initialize student fees');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to initialize student fees'
      );
    }
  },

  /**
   * Get preview of students to be initialized (Principal only)
   * @param {string} structureId
   * @returns {Promise<object>}
   */
  async getInitializationPreview(structureId) {
    try {
      const response = await apiClient.get(`/fees/initialize/preview/${structureId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch initialization preview');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch initialization preview'
      );
    }
  },

  /**
   * Collect fee manually (Principal only)
   * @param {string} studentFeeId - StudentFee record ID (not studentId)
   * @param {object} paymentData - { amount, paymentMode, referenceId }
   * @returns {Promise<object>}
   */
  async collectFee(studentFeeId, paymentData) {
    try {
      const response = await apiClient.post('/fees/collect', {
        studentFeeId,
        ...paymentData,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to collect fee');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to collect fee'
      );
    }
  },

  /**
   * Get student fees by class (for searching/listing)
   * @param {string} classId
   * @param {object} filters - { academicYear, status }
   * @returns {Promise<Array>}
   */
  async getClassFees(classId, filters = {}) {
    try {
      const response = await apiClient.get(`/fees/class/${classId}`, { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch class fees');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch class fees'
      );
    }
  },

  /**
   * Get lightweight fee status for dashboard banner (GET /api/fees/student/status).
   * Returns { status, dueAmount, dueDate, lateFine }.
   * @returns {Promise<{ status: 'PAID' | 'PARTIAL' | 'DUE', dueAmount: number, dueDate: string | null, lateFine: number }>}
   */
  async getFeeStatus() {
    try {
      const response = await apiClient.get('/fees/student/status');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee status');
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view fees.');
      }
      if (error.response?.status === 401) {
        throw new Error('Please log in again.');
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee status'
      );
    }
  },

  /**
   * Get own fee details for logged-in student (GET /api/fees/student/me).
   * Returns { feeStructure, payment, class, academicYear, dueDate } or message when no structure.
   * @returns {Promise<{ feeStructure, payment, class, academicYear, dueDate, message? }>}
   */
  async getMyFeeDetails() {
    try {
      const response = await apiClient.get('/fees/student/me');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee details');
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view fees.');
      }
      if (error.response?.status === 401) {
        throw new Error('Please log in again.');
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee details'
      );
    }
  },

  /**
   * Get student fees (Principal/Teacher/Student)
   * @param {string} studentId
   * @param {object} filters - { academicYear, status }
   * @returns {Promise<Array>}
   */
  async getStudentFees(studentId, filters = {}) {
    try {
      const response = await apiClient.get(`/fees/student/${studentId}`, { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch student fees');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch student fees'
      );
    }
  },

  /**
   * Get payment history from student fees (paymentHistory array)
   * This is extracted from getStudentFees response
   * @param {Array} studentFees - Array of student fee records
   * @returns {Promise<Array>}
   */
  async getPaymentHistory(studentFees) {
    // Extract and flatten payment history from all fee records
    if (!Array.isArray(studentFees)) return [];
    return studentFees
      .flatMap((fee) => 
        (fee.paymentHistory || []).map((payment) => ({
          ...payment,
          feeId: fee._id || fee.id,
          academicYear: fee.academicYear,
          feeType: fee.feeStructureId?.feeType,
        }))
      )
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  },

  /**
   * Send fee reminders (Principal only)
   * @param {object} reminderData - { classId?, studentId?, onlyDefaulters? }
   * @returns {Promise<object>}
   */
  async sendFeeReminders(reminderData) {
    try {
      const response = await apiClient.post('/fees/send-reminder', reminderData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to send fee reminders');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to send fee reminders'
      );
    }
  },

  /**
   * Get fee defaulters (Principal/Teacher)
   * @param {object} filters - Optional filters like { classId, overdueOnly }
   * @returns {Promise<Array>}
   */
  async getFeeDefaulters(filters = {}) {
    try {
      const response = await apiClient.get('/fees/defaulters', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee defaulters');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee defaulters'
      );
    }
  },

  /**
   * Get fee statistics (Principal/Teacher)
   * @param {object} filters - Optional filters like { classId, academicYear }
   * @returns {Promise<object>}
   */
  async getFeeStatistics(filters = {}) {
    try {
      const response = await apiClient.get('/fees/statistics', { params: filters });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee statistics');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch fee statistics'
      );
    }
  },
};
