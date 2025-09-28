# Pet Portal Database Setup

## Database Migration Instructions

Your Supabase project is configured and ready. Follow these steps to set up your database:

### 1. Supabase Configuration ✅
Your Supabase connection is already configured in `.env`:
- **URL**: `https://uthtoslhwrsnkcmlhvfy.supabase.co`
- **Anon Key**: Configured ✅
- **Service Role Key**: Configured ✅

### 2. Run Database Migration

You have two options to set up your database:

#### Option A: Complete Setup (Recommended)
Execute the complete migration file that includes both pets and user_profiles tables:

```sql
-- Run this in your Supabase SQL Editor:
-- supabase_migrations/complete_pet_portal_setup.sql
```

#### Option B: Individual Migrations
If you prefer to run migrations separately:

1. First run: `supabase_migrations/user_profiles_table.sql`
2. Then run: `supabase_migrations/pets_table_simple.sql`

### 3. Verify Setup

After running the migration, verify everything is working:

1. **Check tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('user_profiles', 'pets');
   ```

2. **Check sample data**:
   ```sql
   SELECT count(*) as user_count FROM user_profiles;
   SELECT count(*) as pet_count FROM pets;
   ```

3. **Test relationship**:
   ```sql
   SELECT
     p.name as pet_name,
     p.species,
     up.full_name as owner_name,
     up.email as owner_email
   FROM pets p
   JOIN user_profiles up ON p.owner_id = up.id
   LIMIT 5;
   ```

### 4. Access Your Application

Once the database is set up, visit:
**http://localhost:3000/dashboard/vet-owner/pet-record**

## Features Available

### Pet Owners Management
- ✅ **View all pet owners** with usernames
- ✅ **Add new pet owners** with form validation
- ✅ **Edit existing owners** (email is read-only)
- ✅ **Delete owners** with safety checks
- ✅ **Orange theme** matching your design
- ✅ **Real-time database updates**

### Database Features
- ✅ **Foreign key relationships** between pets and owners
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Automatic triggers** for updated_at timestamps
- ✅ **Sample data** for testing
- ✅ **Fallback to demo mode** if database is unavailable

### Safety Features
- ✅ **Prevents deletion** of owners who have pets
- ✅ **Confirmation dialogs** for destructive actions
- ✅ **Form validation** with error messages
- ✅ **Toast notifications** for user feedback

## Troubleshooting

### If the database connection fails:
1. Check your `.env` file has the correct Supabase credentials
2. Ensure your Supabase project is active
3. The application will fall back to demo mode automatically

### If migrations fail:
1. Check if you have the correct permissions in Supabase
2. Make sure you're running the SQL in the Supabase SQL Editor
3. Check for any existing table conflicts

### If CRUD operations don't work:
1. Verify the tables were created successfully
2. Check the browser console for any JavaScript errors
3. The app will automatically fall back to mock data if database operations fail

## Next Steps

After setup, you can:
1. Test all CRUD operations on pet owners
2. Add more sample data if needed
3. Customize the forms or validation as required
4. Connect the "View Pets" button to show pets for each owner