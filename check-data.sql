-- Quick check to see what data exists in your database
-- Run this in Supabase SQL Editor to verify your data

-- 1. Check if pets table exists and has data
SELECT 'PETS TABLE' as table_name, COUNT(*) as record_count
FROM pets;

-- 2. Check if user_profiles table exists and has data
SELECT 'USER_PROFILES TABLE' as table_name, COUNT(*) as record_count
FROM user_profiles;

-- 3. Show first 5 pets with basic info
SELECT
  name,
  species,
  breed,
  owner_id,
  created_at
FROM pets
ORDER BY created_at DESC
LIMIT 5;

-- 4. Show first 5 users
SELECT
  full_name,
  email,
  role,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check foreign key relationship
SELECT
  p.name as pet_name,
  p.species,
  up.full_name as owner_name,
  up.email as owner_email
FROM pets p
LEFT JOIN user_profiles up ON p.owner_id = up.id
LIMIT 5;

-- 6. Check for orphaned pets (pets without owners)
SELECT
  p.name,
  p.owner_id,
  'ORPHANED - NO OWNER FOUND' as status
FROM pets p
LEFT JOIN user_profiles up ON p.owner_id = up.id
WHERE up.id IS NULL;

-- 7. Show table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;