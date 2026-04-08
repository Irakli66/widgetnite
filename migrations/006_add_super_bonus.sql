-- Add is_super column to bonus_hunt_slots table
ALTER TABLE bonus_hunt_slots
ADD COLUMN is_super BOOLEAN DEFAULT FALSE;

-- Create index for super bonuses
CREATE INDEX IF NOT EXISTS idx_bonus_hunt_slots_is_super ON bonus_hunt_slots(hunt_id, is_super);
