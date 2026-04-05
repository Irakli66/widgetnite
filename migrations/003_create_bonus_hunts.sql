-- Create bonus_hunts table
CREATE TABLE IF NOT EXISTS bonus_hunts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_balance DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bonus_hunt_slots table
CREATE TABLE IF NOT EXISTS bonus_hunt_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES bonus_hunts(id) ON DELETE CASCADE,
  slot_name VARCHAR(255) NOT NULL,
  bet_size DECIMAL(10, 2) NOT NULL,
  payout DECIMAL(10, 2),
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bonus_hunts_user_id ON bonus_hunts(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_hunt_slots_hunt_id ON bonus_hunt_slots(hunt_id);
CREATE INDEX IF NOT EXISTS idx_bonus_hunt_slots_position ON bonus_hunt_slots(hunt_id, position);
