-- Simple Pet Records Table for Vet Owner Dashboard
-- This is a minimal standalone version that works without dependencies

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age_years INTEGER,
    age_months INTEGER,
    gender VARCHAR(10) DEFAULT 'unknown',
    weight_kg DECIMAL(6,2),
    color VARCHAR(200),
    image_url TEXT,
    medical_notes TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    owner_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);

-- Create update function
CREATE OR REPLACE FUNCTION update_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_pets_updated_at_trigger ON pets;
CREATE TRIGGER update_pets_updated_at_trigger
    BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_pets_updated_at();