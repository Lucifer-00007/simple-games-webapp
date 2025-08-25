
'use server';

import { getGameRecommendations } from '@/ai/flows/game-recommendations';

export async function getRecommendationsAction(searchHistory: string[]) {
  if (searchHistory.length === 0) {
    return [];
  }
  
  try {
    const result = await getGameRecommendations({ searchHistory });
    return result.recommendations;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // In a real app, you might want to handle this error more gracefully
    return [];
  }
}
