-- Create slot_games table
CREATE TABLE IF NOT EXISTS slot_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  times_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, normalized_name)
);

-- Add foreign key to bonus_hunt_slots
ALTER TABLE bonus_hunt_slots 
ADD COLUMN slot_game_id UUID REFERENCES slot_games(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slot_games_user_id ON slot_games(user_id);
CREATE INDEX IF NOT EXISTS idx_slot_games_normalized_name ON slot_games(user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_bonus_hunt_slots_slot_game_id ON bonus_hunt_slots(slot_game_id);
