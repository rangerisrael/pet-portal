-- Complete Pet Portal Database Setup
-- This includes both pets table and user_profiles table with proper relationships

-- ==========================================
-- 1. USER PROFILES TABLE
-- ==========================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'pet-owner' CHECK (role IN ('pet-owner', 'vet-owner', 'admin', 'staff')),
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Enable RLS (Row Level Security) for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles for staff assignment" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Vet owners and admins can manage all profiles" ON user_profiles;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles for staff assignment" ON user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow vet-owners and admins to manage all profiles
CREATE POLICY "Vet owners and admins can manage all profiles" ON user_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('vet-owner', 'admin')
    )
  );

-- ==========================================
-- 2. PETS TABLE (from pets_table_simple.sql)
-- ==========================================

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

-- Create indexes for pets
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);

-- Add foreign key constraint linking pets to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pets_owner_id_fkey'
    AND table_name = 'pets'
  ) THEN
    ALTER TABLE pets
    ADD CONSTRAINT pets_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- ==========================================
-- 3. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pet-owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', OLD.raw_user_meta_data->>'full_name'),
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', OLD.raw_user_meta_data->>'first_name'),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', OLD.raw_user_meta_data->>'last_name'),
    role = COALESCE(NEW.raw_user_meta_data->>'role', OLD.raw_user_meta_data->>'role'),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update profile when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create updated_at trigger for user_profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create update function for pets
CREATE OR REPLACE FUNCTION update_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pets
DROP TRIGGER IF EXISTS update_pets_updated_at_trigger ON pets;
CREATE TRIGGER update_pets_updated_at_trigger
    BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_pets_updated_at();

-- ==========================================
-- 4. SAMPLE DATA
-- ==========================================

-- Insert sample pet owner data
INSERT INTO user_profiles (id, email, full_name, first_name, last_name, role, phone)
VALUES
  ('dd0986eb-40a1-429c-86c2-74c814887781', 'joaquin.mendez@example.com', 'Joaquin Mendez', 'Joaquin', 'Mendez', 'pet-owner', '(555) 123-4567'),
  ('550e8400-e29b-41d4-a716-446655440004', 'john.delacruz@example.com', 'John Dela Cruz', 'John', 'Dela Cruz', 'pet-owner', '(555) 234-5678'),
  ('550e8400-e29b-41d4-a716-446655440005', 'ana.reyes@example.com', 'Dr. Ana Reyes', 'Ana', 'Reyes', 'pet-owner', '(555) 345-6789'),
  ('550e8400-e29b-41d4-a716-446655440006', 'carlos.mendez@example.com', 'Carlos Mendez', 'Carlos', 'Mendez', 'pet-owner', '(555) 456-7890'),
  ('550e8400-e29b-41d4-a716-446655440007', 'lisa.garcia@example.com', 'Dr. Lisa Garcia', 'Lisa', 'Garcia', 'pet-owner', '(555) 567-8901'),
  ('550e8400-e29b-41d4-a716-446655440008', 'mike.torres@example.com', 'Michael Torres', 'Michael', 'Torres', 'pet-owner', '(555) 678-9012'),
  ('550e8400-e29b-41d4-a716-446655440009', 'sarah.kim@example.com', 'Dr. Sarah Kim', 'Sarah', 'Kim', 'pet-owner', '(555) 789-0123'),
  ('550e8400-e29b-41d4-a716-446655440010', 'emma.chen@example.com', 'Emma Chen', 'Emma', 'Chen', 'pet-owner', '(555) 890-1234'),
  ('550e8400-e29b-41d4-a716-446655440011', 'david.wong@example.com', 'David Wong', 'David', 'Wong', 'pet-owner', '(555) 901-2345'),
  ('550e8400-e29b-41d4-a716-446655440012', 'maria.santos@example.com', 'Maria Santos', 'Maria', 'Santos', 'pet-owner', '(555) 012-3456')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Insert sample pets data
INSERT INTO pets (id, name, species, breed, age_years, age_months, gender, weight_kg, color, medical_notes, emergency_contact_name, emergency_contact_phone, owner_id, status)
VALUES
  ('pet-1', 'Buddy', 'dog', 'Golden Retriever', 3, 6, 'male', 25.5, 'Golden', 'Regular checkups, no known allergies', 'Joaquin Mendez', '(555) 123-4567', 'dd0986eb-40a1-429c-86c2-74c814887781', 'active'),
  ('pet-2', 'Luna', 'cat', 'Persian', 2, 3, 'female', 4.2, 'White', 'Indoor cat, vaccinated', 'John Dela Cruz', '(555) 234-5678', '550e8400-e29b-41d4-a716-446655440004', 'active'),
  ('pet-3', 'Whiskers', 'cat', 'Maine Coon', 1, 8, 'male', 6.8, 'Gray Tabby', 'Young cat, very playful', 'Ana Reyes', '(555) 345-6789', '550e8400-e29b-41d4-a716-446655440005', 'active'),
  ('pet-4', 'Bella', 'dog', 'Labrador Mix', 5, 2, 'female', 22.3, 'Black', 'Senior dog, hip issues monitoring', 'Carlos Mendez', '(555) 456-7890', '550e8400-e29b-41d4-a716-446655440006', 'active'),
  ('pet-5', 'Mittens', 'cat', 'Siamese', 3, 0, 'female', 4.5, 'Cream and Brown', 'Indoor cat, regular dental cleanings', 'Lisa Garcia', '(555) 567-8901', '550e8400-e29b-41d4-a716-446655440007', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  species = EXCLUDED.species,
  breed = EXCLUDED.breed,
  age_years = EXCLUDED.age_years,
  age_months = EXCLUDED.age_months,
  gender = EXCLUDED.gender,
  weight_kg = EXCLUDED.weight_kg,
  color = EXCLUDED.color,
  medical_notes = EXCLUDED.medical_notes,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  owner_id = EXCLUDED.owner_id,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- ==========================================
-- 5. VERIFICATION QUERIES
-- ==========================================

-- Show table info
SELECT 'user_profiles table created' as status, count(*) as user_count FROM user_profiles;
SELECT 'pets table created' as status, count(*) as pet_count FROM pets;

-- Show foreign key relationship
SELECT
  p.name as pet_name,
  p.species,
  up.full_name as owner_name,
  up.email as owner_email
FROM pets p
JOIN user_profiles up ON p.owner_id = up.id
LIMIT 5;