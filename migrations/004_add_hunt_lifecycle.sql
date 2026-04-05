-- Add hunt lifecycle columns to bonus_hunts table
ALTER TABLE bonus_hunts 
ADD COLUMN status VARCHAR(20) DEFAULT 'not_started',
ADD COLUMN current_slot_index INTEGER,
ADD COLUMN hunt_result VARCHAR(20);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_bonus_hunts_status ON bonus_hunts(status);
