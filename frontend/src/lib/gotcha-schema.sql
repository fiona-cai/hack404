-- Gotcha Cards Schema
-- Run this SQL in your Supabase SQL editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gotcha_cards table
CREATE TABLE IF NOT EXISTS gotcha_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('compliment', 'question', 'challenge', 'fun_fact', 'icebreaker', 'dare', 'memory', 'prediction')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  icon_emoji TEXT NOT NULL DEFAULT '✨',
  background_color TEXT NOT NULL DEFAULT '#4e54c8',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  is_dynamic BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  weight INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gotcha_events table
CREATE TABLE IF NOT EXISTS gotcha_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES gotcha_cards(id) ON DELETE CASCADE,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gotcha_cards_type ON gotcha_cards(type);
CREATE INDEX IF NOT EXISTS idx_gotcha_cards_rarity ON gotcha_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_gotcha_cards_is_dynamic ON gotcha_cards(is_dynamic);
CREATE INDEX IF NOT EXISTS idx_gotcha_cards_weight ON gotcha_cards(weight);
CREATE INDEX IF NOT EXISTS idx_gotcha_events_user_a ON gotcha_events(user_a_id);
CREATE INDEX IF NOT EXISTS idx_gotcha_events_user_b ON gotcha_events(user_b_id);
CREATE INDEX IF NOT EXISTS idx_gotcha_events_card ON gotcha_events(card_id);
CREATE INDEX IF NOT EXISTS idx_gotcha_events_created ON gotcha_events(created_at);

-- Enable Row Level Security
ALTER TABLE gotcha_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gotcha_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gotcha_cards (readable by all authenticated users)
CREATE POLICY "Allow read access to gotcha_cards" ON gotcha_cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for gotcha_cards" ON gotcha_cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for gotcha_events (users can read events they're involved in)
CREATE POLICY "Users can read their own gotcha events" ON gotcha_events
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_a_id::text FROM gotcha_events WHERE id = gotcha_events.id
      UNION
      SELECT user_b_id::text FROM gotcha_events WHERE id = gotcha_events.id
    )
  );

CREATE POLICY "Allow insert for gotcha_events" ON gotcha_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own gotcha events" ON gotcha_events
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT user_a_id::text FROM gotcha_events WHERE id = gotcha_events.id
      UNION
      SELECT user_b_id::text FROM gotcha_events WHERE id = gotcha_events.id
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_gotcha_cards_updated_at BEFORE UPDATE ON gotcha_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for gotcha_cards
INSERT INTO gotcha_cards (title, description, type, rarity, icon_emoji, background_color, text_color, tags, weight) VALUES

-- Common cards (high weight, frequent)
('Compliment Exchange', 'Give each other a genuine compliment about something you noticed today.', 'compliment', 'common', '😊', '#4e54c8', '#ffffff', ARRAY['friendly', 'positive'], 100),
('Quick Question', 'Ask: "What''s something that made you smile recently?"', 'question', 'common', '❓', '#06d6a0', '#ffffff', ARRAY['conversation', 'light'], 100),
('High Five Challenge', 'Give each other the most creative high five you can think of!', 'challenge', 'common', '🙌', '#f72585', '#ffffff', ARRAY['fun', 'physical'], 100),
('Fun Fact Share', 'Share an interesting fact you learned this week.', 'fun_fact', 'common', '🧠', '#7209b7', '#ffffff', ARRAY['educational', 'sharing'], 100),
('Name Game', 'Try to guess each other''s favorite color. Winner gets to pick the next topic!', 'icebreaker', 'common', '🎨', '#f77f00', '#ffffff', ARRAY['guessing', 'preferences'], 100),

-- Uncommon cards (medium weight)
('Photo Challenge', 'Take a creative selfie together using only items around you as props.', 'challenge', 'uncommon', '📸', '#2d6a4f', '#ffffff', ARRAY['creative', 'photo'], 70),
('Story Time', 'Each person tells a 30-second story about their most unusual talent.', 'question', 'uncommon', '📚', '#6f1d1b', '#ffffff', ARRAY['storytelling', 'talent'], 70),
('Memory Moment', 'Describe your earliest childhood memory to each other.', 'memory', 'uncommon', '🌟', '#3a86ff', '#ffffff', ARRAY['personal', 'childhood'], 70),
('Future Prediction', 'Predict one thing about each other''s day tomorrow. Check back to see if you''re right!', 'prediction', 'uncommon', '🔮', '#8338ec', '#ffffff', ARRAY['future', 'psychic'], 70),

-- Rare cards (lower weight)
('Talent Show', 'Each person has 1 minute to demonstrate their weirdest skill or talent.', 'dare', 'rare', '🎭', '#e71d36', '#ffffff', ARRAY['performance', 'skills'], 40),
('Life Philosophy', 'Share your personal life motto or philosophy in exactly 10 words.', 'question', 'rare', '💭', '#011627', '#ffffff', ARRAY['deep', 'philosophy'], 40),
('Adventure Planning', 'Plan an imaginary adventure you''d take together if money was no object.', 'challenge', 'rare', '🗺️', '#fb8500', '#ffffff', ARRAY['imagination', 'travel'], 40),

-- Epic cards (very low weight)
('Deepest Fear', 'Share something you''re afraid of but working to overcome.', 'question', 'epic', '💪', '#2d3748', '#ffffff', ARRAY['vulnerability', 'growth'], 20),
('Time Capsule', 'Write a message to your future selves to open in exactly one year.', 'memory', 'epic', '⏰', '#553c9a', '#ffffff', ARRAY['future', 'commitment'], 20),

-- Legendary cards (extremely rare)
('Life Changing Moment', 'Share the moment that changed your life''s direction the most.', 'memory', 'legendary', '🌅', '#ffd60a', '#000000', ARRAY['profound', 'life-changing'], 5),
('Secret Dream', 'Reveal a dream or goal you''ve never told anyone about.', 'question', 'legendary', '💫', '#003566', '#ffffff', ARRAY['dreams', 'secrets'], 5);

-- Add some additional fun cards
INSERT INTO gotcha_cards (title, description, type, rarity, icon_emoji, background_color, text_color, tags, weight) VALUES
('Dance Battle', 'Have a 15-second dance-off to music only you can hear in your head.', 'dare', 'uncommon', '💃', '#f72585', '#ffffff', ARRAY['dance', 'silly'], 70),
('Accent Challenge', 'Say "Hello, how are you?" in your best foreign accent impression.', 'dare', 'common', '🎭', '#7209b7', '#ffffff', ARRAY['accent', 'voice'], 100),
('Gratitude Share', 'Tell each other one thing you''re genuinely grateful for today.', 'compliment', 'common', '🙏', '#06d6a0', '#ffffff', ARRAY['gratitude', 'positive'], 100),
('Quick Draw', 'Each person draws the other person in 30 seconds using finger in the air.', 'challenge', 'uncommon', '✏️', '#f77f00', '#ffffff', ARRAY['art', 'quick'], 70),
('Superhero Names', 'Create superhero names for each other based on your first impression.', 'icebreaker', 'common', '🦸', '#3a86ff', '#ffffff', ARRAY['superhero', 'creative'], 100);
