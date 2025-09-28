-- EXACT DATA FOR YOUR PET PORTAL DATABASE
-- Copy and paste this entire SQL into your Supabase SQL Editor and run it

-- ==========================================
-- 1. CREATE TABLES
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

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'pet-owner',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. INSERT REAL PET OWNERS
-- ==========================================

INSERT INTO user_profiles (id, email, full_name, first_name, last_name, role, phone) VALUES
('dd0986eb-40a1-429c-86c2-74c814887781', 'joaquin.mendez@gmail.com', 'Joaquin Mendez', 'Joaquin', 'Mendez', 'pet-owner', '+1-555-123-4567'),
('550e8400-e29b-41d4-a716-446655440004', 'john.delacruz@gmail.com', 'John Dela Cruz', 'John', 'Dela Cruz', 'pet-owner', '+1-555-234-5678'),
('550e8400-e29b-41d4-a716-446655440005', 'ana.reyes@gmail.com', 'Dr. Ana Reyes', 'Ana', 'Reyes', 'pet-owner', '+1-555-345-6789'),
('550e8400-e29b-41d4-a716-446655440006', 'carlos.mendez@gmail.com', 'Carlos Mendez', 'Carlos', 'Mendez', 'pet-owner', '+1-555-456-7890'),
('550e8400-e29b-41d4-a716-446655440007', 'lisa.garcia@gmail.com', 'Dr. Lisa Garcia', 'Lisa', 'Garcia', 'pet-owner', '+1-555-567-8901'),
('550e8400-e29b-41d4-a716-446655440008', 'mike.torres@gmail.com', 'Michael Torres', 'Michael', 'Torres', 'pet-owner', '+1-555-678-9012'),
('550e8400-e29b-41d4-a716-446655440009', 'sarah.kim@gmail.com', 'Dr. Sarah Kim', 'Sarah', 'Kim', 'pet-owner', '+1-555-789-0123'),
('550e8400-e29b-41d4-a716-446655440010', 'emma.chen@gmail.com', 'Emma Chen', 'Emma', 'Chen', 'pet-owner', '+1-555-890-1234'),
('550e8400-e29b-41d4-a716-446655440011', 'david.wong@gmail.com', 'David Wong', 'David', 'Wong', 'pet-owner', '+1-555-901-2345'),
('550e8400-e29b-41d4-a716-446655440012', 'maria.santos@gmail.com', 'Maria Santos', 'Maria', 'Santos', 'pet-owner', '+1-555-012-3456')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- ==========================================
-- 3. INSERT REAL PETS DATA
-- ==========================================

INSERT INTO pets (name, species, breed, age_years, age_months, gender, weight_kg, color, medical_notes, emergency_contact_name, emergency_contact_phone, owner_id, status) VALUES

-- Joaquin's pets
('Buddy', 'dog', 'Golden Retriever', 3, 6, 'male', 25.5, 'Golden', 'Regular checkups, no known allergies. Very friendly with children and other dogs.', 'Joaquin Mendez', '+1-555-123-4567', 'dd0986eb-40a1-429c-86c2-74c814887781', 'active'),

-- John's pets
('Luna', 'cat', 'Persian', 2, 3, 'female', 4.2, 'White', 'Indoor cat, fully vaccinated. Prefers quiet environments.', 'John Dela Cruz', '+1-555-234-5678', '550e8400-e29b-41d4-a716-446655440004', 'active'),

-- Ana's pets
('Whiskers', 'cat', 'Maine Coon', 1, 8, 'male', 6.8, 'Gray Tabby', 'Young and very playful. Excellent health record.', 'Dr. Ana Reyes', '+1-555-345-6789', '550e8400-e29b-41d4-a716-446655440005', 'active'),

-- Carlos's pets
('Bella', 'dog', 'Labrador Mix', 5, 2, 'female', 22.3, 'Black', 'Senior dog with mild hip dysplasia. On joint supplements.', 'Carlos Mendez', '+1-555-456-7890', '550e8400-e29b-41d4-a716-446655440006', 'active'),

-- Lisa's pets
('Mittens', 'cat', 'Siamese', 3, 0, 'female', 4.5, 'Cream and Brown', 'Indoor cat, regular dental cleanings. Very vocal personality.', 'Dr. Lisa Garcia', '+1-555-567-8901', '550e8400-e29b-41d4-a716-446655440007', 'active'),

-- Mike's pets
('Max', 'dog', 'German Shepherd', 4, 1, 'male', 32.1, 'Black and Tan', 'Active working dog. Excellent training and socialization.', 'Michael Torres', '+1-555-678-9012', '550e8400-e29b-41d4-a716-446655440008', 'active'),

-- Sarah's pets
('Coco', 'rabbit', 'Holland Lop', 2, 6, 'female', 1.8, 'Brown and White', 'House rabbit, litter trained. Loves fresh vegetables.', 'Dr. Sarah Kim', '+1-555-789-0123', '550e8400-e29b-41d4-a716-446655440009', 'active'),

-- Emma's pets
('Charlie', 'dog', 'Beagle', 6, 0, 'male', 13.2, 'Tricolor', 'Senior beagle, some hearing loss but very healthy otherwise.', 'Emma Chen', '+1-555-890-1234', '550e8400-e29b-41d4-a716-446655440010', 'active'),

-- David's pets
('Nala', 'cat', 'Ragdoll', 1, 4, 'female', 3.9, 'Seal Point', 'Young and gentle cat. Loves being held and petted.', 'David Wong', '+1-555-901-2345', '550e8400-e29b-41d4-a716-446655440011', 'active'),

-- Maria's pets
('Rocco', 'dog', 'French Bulldog', 2, 8, 'male', 11.3, 'Brindle', 'Brachycephalic breed, monitored for breathing issues. Very social.', 'Maria Santos', '+1-555-012-3456', '550e8400-e29b-41d4-a716-446655440012', 'active');

-- ==========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ==========================================
-- 5. VERIFY DATA
-- ==========================================

-- Show summary
SELECT 'PETS CREATED' as table_name, count(*) as total_records FROM pets
UNION ALL
SELECT 'OWNERS CREATED' as table_name, count(*) as total_records FROM user_profiles;

-- Show pets with owners
SELECT
  p.name as pet_name,
  p.species,
  p.breed,
  up.full_name as owner_name,
  up.email as owner_email
FROM pets p
JOIN user_profiles up ON p.owner_id = up.id
ORDER BY p.name;