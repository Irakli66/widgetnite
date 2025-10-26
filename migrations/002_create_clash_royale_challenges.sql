-- Create clash_royale_challenges table
CREATE TABLE IF NOT EXISTS clash_royale_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  win_goal INTEGER NOT NULL,
  max_losses INTEGER NOT NULL,
  current_wins INTEGER DEFAULT 0,
  current_losses INTEGER DEFAULT 0,
  best_wins INTEGER DEFAULT 0,
  best_losses INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_clash_royale_challenges_user_id ON clash_royale_challenges(user_id);

-- Create index on is_active for filtering active challenges
CREATE INDEX IF NOT EXISTS idx_clash_royale_challenges_is_active ON clash_royale_challenges(is_active);


