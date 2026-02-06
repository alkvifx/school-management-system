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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log(`[API] ${response.config?.method?.toUpperCase()} ${response.config?.url} → ${response.status}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}`, message);
      }
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
