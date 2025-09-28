-- Create user_profiles table to store authenticated user information
-- This table will be populated when users register and can be queried for staff assignment

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'pet-owner' CHECK (role IN ('pet-owner', 'vet-owner', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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
CREATE OR REPLACE TRIGGER on_auth_user_created
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
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Insert sample data for existing users (modify as needed)
-- This is just an example - you should insert real user data
INSERT INTO user_profiles (id, email, full_name, first_name, last_name, role)
VALUES
  ('dd0986eb-40a1-429c-86c2-74c814887781', 'kifofa1514@anysilo.com', 'Joaquin Mendez', 'Joaquin', 'Mendez', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440004', 'john.delacruz@example.com', 'John Dela Cruz', 'John', 'Dela Cruz', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440005', 'ana.reyes@example.com', 'Dr. Ana Reyes', 'Ana', 'Reyes', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440006', 'carlos.mendez@example.com', 'Carlos Mendez', 'Carlos', 'Mendez', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440007', 'lisa.garcia@example.com', 'Dr. Lisa Garcia', 'Lisa', 'Garcia', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440008', 'mike.torres@example.com', 'Michael Torres', 'Michael', 'Torres', 'pet-owner'),
  ('550e8400-e29b-41d4-a716-446655440009', 'sarah.kim@example.com', 'Dr. Sarah Kim', 'Sarah', 'Kim', 'pet-owner')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();