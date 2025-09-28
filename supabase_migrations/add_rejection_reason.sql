-- Add rejection_reason column to appointments table
-- This will store the reason when a vet rejects an appointment

ALTER TABLE appointments
ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- Add a comment to the column
COMMENT ON COLUMN appointments.rejection_reason IS 'Reason provided by vet when rejecting an appointment';

-- Optionally, you can add an index if you plan to query by rejection reason
-- CREATE INDEX idx_appointments_rejection_reason ON appointments(rejection_reason);

-- Update RLS policies to allow vet-owners to update rejection_reason
-- (This assumes you have existing RLS policies)