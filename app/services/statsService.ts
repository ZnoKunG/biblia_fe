import { GetWithQueryParams } from '../../services/serviceProvider';

export const getUserStats = async (userId: string) => {
  try {
    const response = await GetWithQueryParams('records', { userId });
    if (!response || !response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};
