/**
 * API helper for fetching dashboard stats
 */

import apiClient from './client';

/**
 * Get dashboard statistics based on user role and tenant info
 */
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}
