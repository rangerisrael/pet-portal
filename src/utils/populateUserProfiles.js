import { supabase } from '@/lib/supabase';

/**
 * Utility function to populate user_profiles table with existing registered users
 * This should be run once to migrate existing users to the user_profiles table
 */
export const populateUserProfiles = async () => {
  try {
    console.log("🔄 Starting user profiles population...");

    // Get the current user to ensure we have access
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated session found");
    }

    // Try to get all existing authenticated users from your system
    // You might need to adjust this based on how you want to populate the data

    // Method 1: Insert the current logged-in user first
    const currentUser = session.user;

    const currentUserProfile = {
      id: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.user_metadata?.full_name ||
                `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() ||
                currentUser.email.split('@')[0],
      first_name: currentUser.user_metadata?.first_name || '',
      last_name: currentUser.user_metadata?.last_name || '',
      role: currentUser.user_metadata?.role || 'pet-owner'
    };

    console.log("📝 Inserting current user profile:", currentUserProfile);

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert([currentUserProfile], {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error("❌ Error inserting current user:", insertError);
    } else {
      console.log("✅ Current user profile created/updated");
    }

    // Method 2: Add any additional sample users that might not exist yet
    const sampleUsers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'john.delacruz@example.com',
        full_name: 'John Dela Cruz',
        first_name: 'John',
        last_name: 'Dela Cruz',
        role: 'pet-owner'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'ana.reyes@example.com',
        full_name: 'Dr. Ana Reyes',
        first_name: 'Ana',
        last_name: 'Reyes',
        role: 'pet-owner'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'carlos.mendez@example.com',
        full_name: 'Carlos Mendez',
        first_name: 'Carlos',
        last_name: 'Mendez',
        role: 'pet-owner'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        email: 'lisa.garcia@example.com',
        full_name: 'Dr. Lisa Garcia',
        first_name: 'Lisa',
        last_name: 'Garcia',
        role: 'pet-owner'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        email: 'mike.torres@example.com',
        full_name: 'Michael Torres',
        first_name: 'Michael',
        last_name: 'Torres',
        role: 'pet-owner'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        email: 'sarah.kim@example.com',
        full_name: 'Dr. Sarah Kim',
        first_name: 'Sarah',
        last_name: 'Kim',
        role: 'pet-owner'
      }
    ];

    console.log("📝 Inserting sample user profiles...");

    const { data: sampleData, error: sampleError } = await supabase
      .from('user_profiles')
      .upsert(sampleUsers, {
        onConflict: 'id',
        ignoreDuplicates: true
      });

    if (sampleError) {
      console.error("⚠️ Error inserting sample users:", sampleError);
      console.log("This is normal if the users don't exist in auth.users");
    } else {
      console.log("✅ Sample user profiles created/updated");
    }

    // Verify the data
    const { data: allProfiles, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error("❌ Error fetching profiles:", selectError);
    } else {
      console.log("📊 User profiles in database:", allProfiles.length);
      console.log("👥 Available users:", allProfiles.map(u => ({
        name: u.full_name,
        email: u.email,
        role: u.role
      })));
    }

    return { success: true, message: "User profiles populated successfully" };

  } catch (error) {
    console.error("❌ Error populating user profiles:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Function to add a single user to user_profiles
 */
export const addUserProfile = async (userInfo) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([userInfo], {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;

    console.log("✅ User profile added:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error adding user profile:", error);
    return { success: false, error: error.message };
  }
};