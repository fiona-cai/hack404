// Types for the Gotcha Card system

export interface GotchaCard {
  id: string;
  type: 'compliment' | 'question' | 'challenge' | 'fun_fact' | 'icebreaker' | 'dare' | 'memory' | 'prediction';
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon_emoji: string;
  background_color: string;
  text_color: string;
  is_dynamic: boolean;
  tags: string[];
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface GotchaEvent {
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

export interface User {
  id: number;
  name: string;
  avatar: string;
  interests: string[];
  phone_number?: string;
  birthday?: string;
  created_at: string;
}

export interface CardGenerationContext {
  userA: Pick<User, 'id' | 'name' | 'interests'>;
  userB: Pick<User, 'id' | 'name' | 'interests'>;
  location?: {
    lat: number;
    lng: number;
    description?: string;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  sharedHistory?: GotchaEvent[];
  preferredTypes?: GotchaCard['type'][];
}
