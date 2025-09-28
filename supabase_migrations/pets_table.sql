-- Pet Records Table for Vet Owner Dashboard
-- This table stores pet records managed by veterinarians
-- Standalone version without external dependencies

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea_pig', 'ferret', 'reptile', 'fish', 'other')),
    breed VARCHAR(100),
    age_years INTEGER CHECK (age_years >= 0 AND age_years <= 50),
    age_months INTEGER CHECK (age_months >= 0 AND age_months <= 11),
    gender VARCHAR(10) NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
    weight_kg DECIMAL(6,2) CHECK (weight_kg > 0),
    color VARCHAR(200),
    image_url TEXT, -- URL to pet image stored in public/assets/pet-record

    -- Medical Information
    medical_notes TEXT,
    vaccinated BOOLEAN DEFAULT false,
    microchipped BOOLEAN DEFAULT false,
    spayed_neutered BOOLEAN DEFAULT false,
    special_needs BOOLEAN DEFAULT false,
    special_needs_description TEXT,

    -- Contact Information
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),

    -- Ownership and Management
    owner_id UUID NOT NULL, -- Links to auth.users (pet owner)
    vet_clinic_name VARCHAR(200), -- Store clinic name as text for now
    managed_by UUID, -- Links to auth.users (vet who manages this record)

    -- Status and Tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
    last_checkup DATE,
    next_checkup DATE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_vet_clinic_name ON pets(vet_clinic_name);
CREATE INDEX IF NOT EXISTS idx_pets_managed_by ON pets(managed_by);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at);

-- Enable Row Level Security
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Pet owners can view and manage their own pets
CREATE POLICY "Pet owners can view their own pets" ON pets
FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Pet owners can insert their own pets" ON pets
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pet owners can update their own pets" ON pets
FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Pet owners can delete their own pets" ON pets
FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Vets can view and manage pets at their clinic
CREATE POLICY "Vets can view pets at their clinic" ON pets
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vet-owner'
  )
);

CREATE POLICY "Vets can update pets they manage" ON pets
FOR UPDATE TO authenticated
USING (
  managed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vet-owner'
  )
);

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_pets_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at timestamp
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_pets_updated_at_column();

-- Note: Sample data is commented out to avoid conflicts.
-- In real usage, pets will be created through the application interface
-- with actual user IDs from the auth.users table.

-- Sample data structure for reference:
-- INSERT INTO pets (
--     name, species, breed, age_years, age_months, gender, weight_kg, color,
--     medical_notes, emergency_contact_name, emergency_contact_phone,
--     owner_id, status
-- ) VALUES
-- (
--     'Buddy', 'dog', 'Golden Retriever', 3, 6, 'male', 25.5, 'Golden',
--     'Regular checkups, no known allergies', 'John Smith', '(555) 123-4567',
--     'USER_UUID_HERE', 'active'
-- );