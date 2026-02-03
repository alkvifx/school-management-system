const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const aiService = {
  generateTemplate: async (payload, token) => {
    const res = await fetch(`${API_BASE}/ai/school-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getTemplates: async (token) => {
    const res = await fetch(`${API_BASE}/ai/school-templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  downloadTemplate: async (id, format = 'pdf', token) => {
    const res = await fetch(`${API_BASE}/ai/school-template/${id}/download?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
  generateNotice: async (payload, token) => {
    const res = await fetch(`${API_BASE}/ai/notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getNotices: async (token) => {
    const res = await fetch(`${API_BASE}/ai/notices`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },

  // Poster generation (multipart/form-data for optional image)
  generatePoster: async (formData, token) => {
    const res = await fetch(`${API_BASE}/ai/poster`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  getPosters: async (token) => {
    const res = await fetch(`${API_BASE}/ai/posters`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  }
};

export default aiService;