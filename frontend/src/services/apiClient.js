import axios from 'axios';
import { API_BASE_URL } from '@/src/utils/constants';

// Create axios instance (uses NEXT_PUBLIC_API_URL or http://localhost:5000/api)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or cookie if using httpOnly)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: only clear auth on 401 (not on network/offline errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear auth on explicit 401 (token expired/invalid), not on network failure
    const status = error.response?.status;
    const isNetworkError = !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error');
    if (status === 401 && !isNetworkError && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
