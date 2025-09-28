// Database Connection Test Script
// Run this with: node test-database.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_PET_PORTAL_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_PET_PORTAL_ANON;

console.log('🔧 Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('\n📊 Testing Database Tables...\n');

  try {
    // Test 1: Check if pets table exists
    console.log('1. Testing pets table...');
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .limit(5);

    if (petsError) {
      console.log('❌ Pets table error:', petsError.message);
      if (petsError.code === '42P01') {
        console.log('💡 Pets table does not exist - need to run migration');
      }
    } else {
      console.log('✅ Pets table exists');
      console.log(`📈 Found ${pets.length} pets:`, pets.map(p => ({ name: p.name, species: p.species })));
    }

    // Test 2: Check if user_profiles table exists
    console.log('\n2. Testing user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log('❌ User profiles table error:', profilesError.message);
      if (profilesError.code === '42P01') {
        console.log('💡 User profiles table does not exist - need to run migration');
      }
    } else {
      console.log('✅ User profiles table exists');
      console.log(`📈 Found ${profiles.length} users:`, profiles.map(p => ({ name: p.full_name, email: p.email })));
    }

    // Test 3: Check table schemas
    console.log('\n3. Checking table schemas...');
    const { data: tables, error: schemaError } = await supabase
      .rpc('get_table_info');

    if (!schemaError && tables) {
      console.log('✅ Database schema accessible');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

async function setupDatabase() {
  console.log('\n🚀 Setting up database...\n');

  console.log('📋 To set up your database:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
  console.log(`2. Navigate to your project: ${supabaseUrl}`);
  console.log('3. Go to SQL Editor');
  console.log('4. Run the migration file: supabase_migrations/complete_pet_portal_setup.sql');
  console.log('5. This will create both pets and user_profiles tables with sample data');

  console.log('\n📝 Or you can copy and paste this SQL directly:\n');

  // Read the migration file content
  try {
    const fs = await import('fs');
    const migrationContent = fs.readFileSync('./supabase_migrations/complete_pet_portal_setup.sql', 'utf8');
    console.log('--- SQL MIGRATION ---');
    console.log(migrationContent);
    console.log('--- END MIGRATION ---');
  } catch (err) {
    console.log('📁 Migration file location: ./supabase_migrations/complete_pet_portal_setup.sql');
  }
}

// Run tests
testDatabase().then(() => {
  console.log('\n' + '='.repeat(50));
  setupDatabase();
});