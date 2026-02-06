import apiClient from './apiClient';
import { API_BASE_URL } from '@/src/utils/constants';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL || '';

export const aiService = {
  // ——— Principal AI (unchanged behavior, updated path) ———
  generateTemplate: async (payload, token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/school-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getTemplates: async (token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/school-templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  downloadTemplate: async (id, format = 'pdf', token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/school-template/${id}/download?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
  generateNotice: async (payload, token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getNotices: async (token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/notices`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  generatePoster: async (formData, token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/poster`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },
  getPosters: async (token) => {
    const base = API_BASE || '/api';
    const res = await fetch(`${base}/principal/ai/posters`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },

  // ——— AI Doubt Solver Chat (STUDENT + TEACHER) ———
  sendChat: async (message, role) => {
    const res = await apiClient.post('/ai/chat', { message, role });
    return res.data;
  },
  getChatHistory: async () => {
    const res = await apiClient.get('/ai/history');
    return res.data;
  },
};

export default aiService;