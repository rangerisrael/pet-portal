-- APPOINTMENTS SYSTEM TABLES FOR PET PORTAL
-- Run this SQL in your Supabase SQL Editor to create the appointments system

-- ==========================================
-- 1. APPOINTMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    branch_id INTEGER,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50) DEFAULT 'annual_checkup',
    priority VARCHAR(20) DEFAULT 'routine',
    status VARCHAR(20) DEFAULT 'scheduled',
    reason_for_visit TEXT NOT NULL,
    symptoms TEXT,
    notes TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    duration_minutes INTEGER DEFAULT 30,
    color_code VARCHAR(7) DEFAULT '#EA580C',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,

    -- Foreign key constraints
    CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_owner FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_appointments_branch FOREIGN KEY (branch_id) REFERENCES vet_owner_branches(branch_id) ON DELETE SET NULL
);

-- ==========================================
-- 2. APPOINTMENT RESCHEDULE HISTORY TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS appointment_reschedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    old_date DATE NOT NULL,
    old_time TIME NOT NULL,
    new_date DATE NOT NULL,
    new_time TIME NOT NULL,
    reason TEXT,
    rescheduled_by UUID NOT NULL,
    rescheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_reschedules_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_reschedules_user FOREIGN KEY (rescheduled_by) REFERENCES auth.users(id)
);

-- ==========================================
-- 3. APPOINTMENT_DETAILS VIEW (FOR EASY QUERYING)
-- ==========================================

CREATE OR REPLACE VIEW appointment_details AS
SELECT
    a.id,
    a.pet_id,
    a.owner_id,
    a.branch_id,
    a.appointment_date,
    a.appointment_time,
    a.appointment_type,
    a.priority,
    a.status,
    a.reason_for_visit,
    a.symptoms,
    a.notes,
    a.estimated_cost,
    a.actual_cost,
    a.duration_minutes,
    a.color_code,
    a.created_by,
    a.created_at,
    a.updated_at,
    a.cancelled_at,
    a.cancellation_reason,

    -- Pet information
    p.name as pet_name,
    p.species as pet_species,
    p.breed as pet_breed,
    p.image_url as pet_image_url,

    -- Owner information
    p.emergency_contact_name as owner_name,
    p.emergency_contact_phone as owner_phone,

    -- Branch information
    b.branch_code,
    b.branch_name,
    b.branch_type,

    -- Calculate appointment status
    CASE
        WHEN a.cancelled_at IS NOT NULL THEN 'cancelled'
        WHEN a.appointment_date < CURRENT_DATE THEN 'completed'
        WHEN a.appointment_date = CURRENT_DATE AND a.appointment_time < CURRENT_TIME THEN 'completed'
        ELSE a.status
    END as computed_status,

    -- Check if appointment can be rescheduled (24 hours before)
    CASE
        WHEN a.cancelled_at IS NOT NULL THEN false
        WHEN (a.appointment_date - CURRENT_DATE) > 1 THEN true
        WHEN (a.appointment_date - CURRENT_DATE) = 1 AND a.appointment_time > CURRENT_TIME THEN true
        ELSE false
    END as can_reschedule

FROM appointments a
LEFT JOIN pets p ON a.pet_id = p.id
LEFT JOIN vet_owner_branches b ON a.branch_id = b.branch_id
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- ==========================================
-- 4. INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_branch_id ON appointments(branch_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_reschedules_appointment_id ON appointment_reschedules(appointment_id);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reschedules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own appointments
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (owner_id = auth.uid());

-- Policy: Users can create appointments for their own pets
CREATE POLICY "Users can create own appointments" ON appointments
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policy: Users can update their own appointments
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (owner_id = auth.uid());

-- Policy: Users can delete their own appointments
CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (owner_id = auth.uid());

-- Policy: Users can view their own reschedule history
CREATE POLICY "Users can view own reschedules" ON appointment_reschedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.id = appointment_reschedules.appointment_id
            AND appointments.owner_id = auth.uid()
        )
    );

-- Policy: Users can create reschedule records for their own appointments
CREATE POLICY "Users can create own reschedules" ON appointment_reschedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.id = appointment_reschedules.appointment_id
            AND appointments.owner_id = auth.uid()
        )
    );

-- ==========================================
-- 6. UPDATED_AT TRIGGER
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for appointments table
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. SAMPLE DATA (OPTIONAL)
-- ==========================================

-- Insert some sample appointment types for reference
INSERT INTO appointments (
    pet_id,
    owner_id,
    appointment_date,
    appointment_time,
    appointment_type,
    priority,
    reason_for_visit,
    estimated_cost,
    duration_minutes,
    created_by
) VALUES
-- Note: Replace these UUIDs with actual pet_id and owner_id from your pets table
-- ('your-pet-uuid-here', 'your-owner-uuid-here', '2024-01-15', '10:00', 'annual_checkup', 'routine', 'Annual health checkup', 75.00, 60, 'your-owner-uuid-here')
-- Add more sample data as needed

-- This is just a template - you'll need to insert real data with actual UUIDs
ON CONFLICT DO NOTHING;

-- ==========================================
-- 8. VERIFICATION QUERIES
-- ==========================================

-- Check tables were created
SELECT 'APPOINTMENTS TABLE' as table_name, COUNT(*) as record_count FROM appointments
UNION ALL
SELECT 'RESCHEDULES TABLE' as table_name, COUNT(*) as record_count FROM appointment_reschedules;

-- Check the view works
SELECT 'APPOINTMENT_DETAILS VIEW' as view_name, COUNT(*) as record_count FROM appointment_details;

-- Show table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;