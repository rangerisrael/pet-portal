-- User Management SQL Setup for Supabase
-- Run these commands in your Supabase SQL Editor
-- Note: Avatar uploads use local file system API, no storage bucket needed

-- 1. Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'pet-owner',
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for profiles - users can read all profiles (for admin purposes)
CREATE POLICY "Authenticated users can view profiles" ON profiles
FOR SELECT TO authenticated
USING (true);

-- 4. Create policy for profiles - users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Create policy for profiles - users can update their own profile, admins can update any
CREATE POLICY "Users can update own profile or admins can update any" ON profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vet-owner', 'admin')
  )
);

-- 6. Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pet-owner'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();