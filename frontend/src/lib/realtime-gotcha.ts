import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Create a separate client for real-time subscriptions using channels
const supabaseRealtime = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type for the raw event data from database
interface RawGotchaEvent {
  id: string;
  user_a_id: number;
  user_b_id: number;
  card_id: string;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  completed_at: string | null;
  completion_notes: string | null;
}

export interface RealTimeGotchaEvent {
  id: string;
  user_a_id: number;
  user_b_id: number;
  card_id: string;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  completed_at: string | null;
  completion_notes: string | null;
  // Include card data for immediate display
  card?: {
    id: string;
    title: string;
    description: string;
    type: string;
    rarity: string;
    icon_emoji: string;
    background_color: string;
    text_color: string;
    tags: string[];
  };
  // Include user data for context
  user_a?: {
    id: number;
    name: string;
    avatar: string;
  };
  user_b?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export type GotchaEventCallback = (event: RealTimeGotchaEvent) => void;

// Type for catch animation payload
export interface CatchAnimationPayload {
  initiatorId: number;
  targetId: number;
  targetUser: { name: string; avatar: string };
  timestamp: string;
}

/**
 * Subscribe to real-time gotcha events for a specific user
 * This will trigger when someone catches this user OR when this user catches someone
 */
export function subscribeToGotchaEvents(
  userId: number,
  onEventReceived: GotchaEventCallback
) {
  console.log(`🔔 Subscribing to gotcha events for user ${userId}`);

  const channel = supabaseRealtime
    .channel(`gotcha_events_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gotcha_events',
        filter: `user_a_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('🎯 Received gotcha event (as initiator):', payload);
        await handleGotchaEvent(payload.new as RawGotchaEvent, onEventReceived);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gotcha_events',
        filter: `user_b_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('🎯 Received gotcha event (as target):', payload);
        await handleGotchaEvent(payload.new as RawGotchaEvent, onEventReceived);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'gotcha_events',
        filter: `user_a_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('✅ Gotcha event updated (as initiator):', payload);
        await handleGotchaEvent(payload.new as RawGotchaEvent, onEventReceived);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'gotcha_events',
        filter: `user_b_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('✅ Gotcha event updated (as target):', payload);
        await handleGotchaEvent(payload.new as RawGotchaEvent, onEventReceived);
      }
    )
    .subscribe((status) => {
      console.log(`📡 Subscription status for user ${userId}:`, status);
    });

  return channel;
}

/**
 * Handle incoming gotcha events by enriching them with card and user data
 */
async function handleGotchaEvent(
  eventData: RawGotchaEvent,
  callback: GotchaEventCallback
) {
  try {
    // Fetch the card data
    const { data: cardData, error: cardError } = await supabaseRealtime
      .from('gotcha_cards')
      .select('id, title, description, type, rarity, icon_emoji, background_color, text_color, tags')
      .eq('id', eventData.card_id)
      .single();

    if (cardError) {
      console.error('Failed to fetch card data:', cardError);
    }

    // Fetch user data for both users
    const { data: userData, error: userError } = await supabaseRealtime
      .from('users')
      .select('id, name, avatar')
      .in('id', [eventData.user_a_id, eventData.user_b_id]);

    if (userError) {
      console.error('Failed to fetch user data:', userError);
    }

    const userA = userData?.find(u => u.id === eventData.user_a_id);
    const userB = userData?.find(u => u.id === eventData.user_b_id);

    // Create enriched event data
    const enrichedEvent: RealTimeGotchaEvent = {
      ...eventData,
      card: cardData || undefined,
      user_a: userA || undefined,
      user_b: userB || undefined,
    };

    callback(enrichedEvent);
  } catch (error) {
    console.error('Error handling gotcha event:', error);
    // Still call callback with basic data
    callback(eventData as RealTimeGotchaEvent);
  }
}

/**
 * Unsubscribe from gotcha events
 */
export function unsubscribeFromGotchaEvents(channel: RealtimeChannel) {
  if (channel) {
    console.log('🔕 Unsubscribing from gotcha events');
    supabaseRealtime.removeChannel(channel);
  }
}

/**
 * Broadcast a catch animation trigger to show on both users' screens
 */
export async function broadcastCatchAnimation(
  initiatorId: number,
  targetId: number,
  targetUser: { name: string; avatar: string }
) {
  const channel = supabaseRealtime.channel(`catch_animation_${Date.now()}`);
  
  await channel.send({
    type: 'broadcast',
    event: 'catch_started',
    payload: {
      initiatorId,
      targetId,
      targetUser,
      timestamp: new Date().toISOString(),
    },
  });

  return channel;
}

/**
 * Subscribe to catch animations for a specific user
 */
export function subscribeToCatchAnimations(
  userId: number,
  onCatchAnimation: (data: CatchAnimationPayload) => void
) {
  const channel = supabaseRealtime
    .channel(`catch_animations_${userId}`)
    .on('broadcast', { event: 'catch_started' }, ({ payload }) => {
      // Only show animation if this user is involved
      if (payload.initiatorId === userId || payload.targetId === userId) {
        onCatchAnimation(payload);
      }
    })
    .subscribe();

  return channel;
}
