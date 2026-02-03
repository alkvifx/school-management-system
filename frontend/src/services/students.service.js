import apiClient from './apiClient';

/**
 * Public student profile (same school; teachers: assigned classes only).
 */
export async function getStudentPublicProfile(studentId) {
  const { data } = await apiClient.get(`/students/profile/${studentId}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch profile');
  return data.data;
}
