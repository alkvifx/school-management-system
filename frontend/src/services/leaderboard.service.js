import apiClient from './apiClient';

export const leaderboardService = {
  async getMyRank(period = 'weekly') {
    const { data } = await apiClient.get('/leaderboard/me', { params: { period } });
    if (!data.success) throw new Error(data.message || 'Failed to fetch rank');
    return data.data;
  },

  async getClassLeaderboard(classId, period = 'weekly') {
    const { data } = await apiClient.get(`/leaderboard/class/${classId}`, { params: { period } });
    if (!data.success) throw new Error(data.message || 'Failed to fetch leaderboard');
    return data.data;
  },

  async getSchoolLeaderboard(schoolId, period = 'weekly') {
    const { data } = await apiClient.get(`/leaderboard/school/${schoolId}`, { params: { period } });
    if (!data.success) throw new Error(data.message || 'Failed to fetch leaderboard');
    return data.data;
  },
};
