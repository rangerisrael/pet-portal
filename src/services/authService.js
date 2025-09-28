import { supabase } from "@/lib/supabase";
import axios from "axios";
import { isEmpty, isNull, isUndefined } from "lodash";

// Debug Supabase configuration
console.log("🔧 Auth Service - Supabase client:", supabase);
console.log(
  "🔧 Auth Service - Supabase URL:",
  process.env.NEXT_PUBLIC_PET_PORTAL_URL
);

// const axiosApi = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json; charset=utf-8",
//     "X-Content-Type-Options": "nosniff",
//   },
// });
// Authentication service functions for React Query
export const authService = {
  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Get user profile from database
  async getUserProfile(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // Ignore "not found" errors
      throw error;
    }

    return data;
  },

  // Sign in with email and password
  async signInWithEmail({ email, password }) {
    console.log("🔐 Starting sign in process...");
    console.log("Email:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase sign in error:", error);
        throw error;
      }

      console.log("✅ Sign in successful");
      return {
        user: data.user,
        session: data.session,
        profile: data.user.user_metadata,
      };
    } catch (error) {
      console.error("❌ Sign in failed:", error);

      // Provide more specific error messages
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Network connection failed. Please check your internet connection and try again."
        );
      } else if (error.message === "Invalid login credentials") {
        throw new Error(
          "Invalid email or password. Please check your credentials."
        );
      } else if (error.message === "Email not confirmed") {
        throw new Error("Please verify your email address before signing in.");
      }

      throw error;
    }
  },

  // Sign up with email and password
  async signUpWithEmail({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    getProfile,
    clinicName,
    address,
  }) {
    let profilePhotoUrl = "";

    // Upload profile image first if provided
    if (!isNull(getProfile) && getProfile instanceof File) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("profile", getProfile);

        const uploadResponse = await axios.post("/api/upload", formData);

        if (uploadResponse.data && uploadResponse.data.url) {
          profilePhotoUrl = uploadResponse.data.url;
        }
      } catch (uploadError) {
        console.error("Profile upload failed:", uploadError);
        // Log the detailed error for debugging
        if (uploadError.response) {
          console.error("Upload error response:", uploadError.response.data);
        }
        // You can choose to throw here if profile upload is critical
        // throw new Error('Profile upload failed: ' + (uploadError.response?.data?.error || uploadError.message));
      }
    }

    // Create user account with uploaded profile photo URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: role,
          address: address,
          profilePhoto: profilePhotoUrl,
          ...(!isUndefined(clinicName) && { clinicName: clinicName }),
        },
      },
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
      needsConfirmation: !data.session,
      profilePhotoUrl,
    };
  },

  // Sign out
  async signOut() {
    console.log("🚪 Starting logout process...");
    try {
      // Clear manual login flag if exists
      if (typeof window !== "undefined") {
        localStorage.removeItem("manualLoginInProgress");
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Supabase logout error:", error);
        throw error;
      }

      console.log("✅ Logout successful");
      return true;
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile({ userId, profileData }) {
    if (!userId) throw new Error("User ID is required");

    const { data, error } = await supabase
      .from("users")
      .update(profileData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reset password
  async resetPassword({ email }) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { message: "Password reset email sent successfully" };
  },

  // Update password
  async updatePassword({ password }) {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw error;
    return data;
  },

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  },

  // Check if user is veterinary staff and get their branch info
  async checkVeterinaryStaffStatus(userEmail, userId) {
    if (!userEmail && !userId) return null;

    try {
      let query = supabase
        .from("veterinary_staff")
        .select(
          `
          *,
          vet_owner_branches!inner(
            branch_id,
            branch_name,
            branch_code,
            branch_type
          )
        `
        )
        .eq("invitation_accepted", true);

      // Try to match by email first, then by assign_id (user ID)
      if (userEmail) {
        query = query.eq("staff_email", userEmail);
      } else if (userId) {
        query = query.eq("assign_id", userId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found error - try matching by assign_id if we have both email and userId
          if (userEmail && userId) {
            console.log("🔄 Email not found, trying assign_id lookup...");
            const { data: dataById, error: errorById } = await supabase
              .from("veterinary_staff")
              .select(
                `
                *,
                vet_owner_branches!inner(
                  branch_id,
                  branch_name,
                  branch_code,
                  branch_type
                )
              `
              )
              .eq("assign_id", userId)
              .eq("invitation_accepted", true)
              .single();

            if (errorById) {
              if (errorById.code === "PGRST116") {
                console.log("🚫 User not found in veterinary_staff table");
                return null; // User is not a veterinary staff member
              } else {
                throw errorById; // Other database error
              }
            }

            console.log("✅ Found user by assign_id");
            return dataById;
          } else {
            console.log("🚫 User not found in veterinary_staff table");
            return null; // User is not a veterinary staff member
          }
        } else {
          // Other database error
          throw error;
        }
      }

      console.log("✅ Found user by email");
      return data;
    } catch (error) {
      // If table doesn't exist or other errors, return null (not a vet staff)
      console.log("Veterinary staff check failed:", error.message);
      return null;
    }
  },

  // Get redirect route based on user's veterinary staff status
  async getLoginRedirectRoute(userEmail, userId, userRole) {
    console.log("🔍 Determining redirect route for:", { userEmail, userId });

    try {
      const staffInfo = await this.checkVeterinaryStaffStatus(
        userEmail,
        userId
      );
      console.log("👤 Staff info result:", staffInfo);

      if (staffInfo && staffInfo.vet_owner_branches) {
        // User is veterinary staff, redirect to designation_branch based on vet_owner_branches
        const branchType = staffInfo.vet_owner_branches.branch_type;
        console.log("🏥 Branch type:", branchType);

        let route;
        if (branchType === "main-branch") {
          route = "/dashboard/main-branch";
        } else if (branchType === "sub-branch") {
          route = "/dashboard/sub-branch";
        } else if (branchType === "vet-owner") {
          route = "/dashboard/vet-owner";
        } else {
          // Default to main-branch if branch type is unknown
          console.log("⚠️ Unknown branch type, defaulting to main-branch");
          route = "/dashboard/main-branch";
        }

        console.log("✅ Veterinary staff route:", route);
        return route;
      } else {
        // User is not veterinary staff, redirect to pet-owner dashboard
        console.log(
          "👨‍💼 Non-veterinary user, redirecting to pet-owner dashboard"
        );
        const route = `/dashboard/${userRole}` ?? "/dashboard/pet-owner";
        console.log("✅ Pet owner route:", route);
        return route;
      }
    } catch (error) {
      console.error("❌ Error determining redirect route:", error);
      // Default to user-role if there's an error
      return "/dashboard/pet-owner";
    }
  },
};

export default authService;
