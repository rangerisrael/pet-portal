# Get Real Data from Supabase

## Current Status
Your app is currently showing **mock data** because the database tables haven't been created yet.

## Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Find your project: `uthtoslhwrsnkcmlhvfy`
3. Click on your project

### Step 2: Run Database Migration
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the contents of: `supabase_migrations/complete_pet_portal_setup.sql`
4. Click **Run** button

### Step 3: Verify Setup
1. Go to **Table Editor** in Supabase
2. You should see two new tables:
   - `pets` (with 5 sample pets)
   - `user_profiles` (with 10 sample users)

### Step 4: Test Your App
1. Visit: http://localhost:3000/dashboard/vet-owner/pet-record
2. Open browser console (F12)
3. Look for these messages:
   - ✅ `Successfully loaded real data from database: X pets`
   - ❌ If you see errors, check console for specific instructions

## What You'll Get

### Real Pet Data:
- **Buddy** (Golden Retriever, 3 years old)
- **Luna** (Persian cat, 2 years old)
- **Whiskers** (Maine Coon, 1 year old)
- **Bella** (Labrador Mix, 5 years old)
- **Mittens** (Siamese cat, 3 years old)

### Real Owner Data:
- **Joaquin Mendez** (joaquin.mendez@example.com)
- **John Dela Cruz** (john.delacruz@example.com)
- **Dr. Ana Reyes** (ana.reyes@example.com)
- **Carlos Mendez** (carlos.mendez@example.com)
- **Dr. Lisa Garcia** (lisa.garcia@example.com)
- And 5 more...

## Troubleshooting

### If you see "❌ Pets table does not exist":
- You need to run the migration SQL file
- Check if you have proper permissions in Supabase

### If you see "❌ Database error":
- Check your internet connection
- Verify Supabase project is active
- Check browser console for specific error

### If data still shows as mock:
- Refresh the page after running migration
- Check browser console for connection status
- Verify the SQL migration completed successfully

## Alternative: Manual Table Creation

If the migration file doesn't work, you can create tables manually:

1. **Create pets table:**
```sql
CREATE TABLE pets (
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
```

2. **Insert sample data:**
```sql
INSERT INTO pets (name, species, breed, age_years, gender, weight_kg, color, owner_id) VALUES
('Buddy', 'dog', 'Golden Retriever', 3, 'male', 25.5, 'Golden', 'dd0986eb-40a1-429c-86c2-74c814887781'),
('Luna', 'cat', 'Persian', 2, 'female', 4.2, 'White', '550e8400-e29b-41d4-a716-446655440004');
```

## Need Help?
- Check browser console (F12) for detailed error messages
- The app will automatically show you what's wrong and how to fix it
- All database operations have fallback to demo data, so your app won't break