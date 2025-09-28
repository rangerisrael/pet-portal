import { supabase } from "@/lib/supabase";

/**
 * Profile Service - Handles user profile updates for Supabase Auth
 */
export const profileService = {
  /**
   * Update user profile information
   * @param {Object} profileData - The profile data to update
   * @param {string} profileData.firstName - User's first name
   * @param {string} profileData.lastName - User's last name
   * @param {string} profileData.phone - User's phone number
   * @param {string} profileData.profilePhoto - URL to profile photo
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(profileData) {
    try {
      // Update user metadata in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          profilePhoto: profileData.profilePhoto,
          updated_at: new Date().toISOString(),
        }
      });

      if (authError) throw authError;

      // Get current user to get ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No authenticated user found');

      // Try to update profiles table if it exists (optional)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: profileData.phone,
            profile_photo: profileData.profilePhoto,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        // Log warning if profiles table update fails, but don't throw error
        if (profileError) {
          console.warn('Profiles table update failed (this is OK if table does not exist):', profileError);
        }
      } catch (profileTableError) {
        // Profiles table might not exist, which is fine
        console.warn('Profiles table operation failed:', profileTableError);
      }

      return authData;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  /**
   * Update user password
   * @param {string} newPassword - The new password
   * @returns {Promise<Object>} Result of password update
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },

  /**
   * Upload profile photo to Supabase Storage
   * @param {File} file - The image file to upload
   * @param {string} userId - The user ID
   * @returns {Promise<string>} URL of uploaded image
   */
  async uploadProfilePhoto(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile data
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentProfile() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error('No authenticated user found');

      return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        profilePhoto: user.user_metadata?.profilePhoto || '',
        role: user.user_metadata?.role || 'pet-owner',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
};

export default profileService;