import supabase from './database';
import { GotchaEvent } from './gotcha-types';

/**
 * Logs a Gotcha event when two users interact with a card
 */
export async function logGotchaEvent(
  userAId: number,
  userBId: number,
  cardId: string,
  location?: { lat: number; lng: number }
): Promise<GotchaEvent | null> {
  try {
    const eventData = {
      user_a_id: userAId,
      user_b_id: userBId,
      card_id: cardId,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
    };

    const { data, error } = await supabase
      .from('gotcha_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Gotcha event logged:', data);
    return data;
  } catch (error) {
    console.error('Error logging Gotcha event:', error);
    return null;
  }
}

/**
 * Marks a Gotcha event as completed
 */
export async function completeGotchaEvent(
  eventId: string,
  completionNotes?: string
): Promise<GotchaEvent | null> {
  try {
    const updateData = {
      completed_at: new Date().toISOString(),
      completion_notes: completionNotes || null
    };

    const { data, error } = await supabase
      .from('gotcha_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Gotcha event completed:', data);
    return data;
  } catch (error) {
    console.error('Error completing Gotcha event:', error);
    return null;
  }
}

/**
 * Gets shared history between two users
 */
export async function getSharedHistory(
  userAId: number,
  userBId: number,
  limit: number = 10
): Promise<GotchaEvent[]> {
  try {
    // TODO: Replace with actual Supabase call once schema is updated
    const response = await fetch(`/api/gotcha-events/shared?userA=${userAId}&userB=${userBId}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get shared history: ${response.statusText}`);
    }

    const events = await response.json();
    return events || [];
  } catch (error) {
    console.error('Error getting shared history:', error);
    return [];
  }
}

/**
 * Gets a user's recent Gotcha events
 */
export async function getUserRecentEvents(
  userId: number,
  limit: number = 20
): Promise<GotchaEvent[]> {
  try {
    // TODO: Replace with actual Supabase call once schema is updated
    const response = await fetch(`/api/gotcha-events/user/${userId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user events: ${response.statusText}`);
    }

    const events = await response.json();
    return events || [];
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
}

/**
 * Gets statistics for a user's Gotcha activity
 */
export async function getUserStats(userId: number): Promise<{
  totalEvents: number;
  completedEvents: number;
  totalPoints: number;
  favoriteCardTypes: { type: string; count: number }[];
  recentPartners: { userId: number; name: string; eventCount: number }[];
}> {
  try {
    // TODO: Replace with actual Supabase call once schema is updated
    const response = await fetch(`/api/gotcha-events/stats/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user stats: ${response.statusText}`);
    }

    const stats = await response.json();
    return stats || {
      totalEvents: 0,
      completedEvents: 0,
      totalPoints: 0,
      favoriteCardTypes: [],
      recentPartners: []
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalEvents: 0,
      completedEvents: 0,
      totalPoints: 0,
      favoriteCardTypes: [],
      recentPartners: []
    };
  }
}
