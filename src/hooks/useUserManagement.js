import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock users data for fallback
const mockUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@petportal.com",
    first_name: "John",
    last_name: "Admin",
    role: "vet-owner",
    status: "active",
    avatar_url: null,
    phone: "+1234567890",
    address: "123 Main St, City",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:15:00Z",
    last_sign_in_at: "2024-01-25T09:00:00Z",
    email_verified: true,
    profile_complete: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "veterinary@petportal.com",
    first_name: "Sarah",
    last_name: "Johnson",
    role: "veterinary",
    status: "active",
    avatar_url: null,
    phone: "+1234567891",
    address: "456 Vet St, City",
    created_at: "2024-01-16T11:30:00Z",
    updated_at: "2024-01-22T15:45:00Z",
    last_sign_in_at: "2024-01-25T08:30:00Z",
    email_verified: true,
    profile_complete: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "staff@petportal.com",
    first_name: "Mike",
    last_name: "Staff",
    role: "sub-branch",
    status: "active",
    avatar_url: null,
    phone: "+1234567892",
    address: "789 Staff Ave, City",
    created_at: "2024-01-17T12:00:00Z",
    updated_at: "2024-01-23T10:20:00Z",
    last_sign_in_at: "2024-01-24T16:45:00Z",
    email_verified: true,
    profile_complete: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "client@petportal.com",
    first_name: "Emma",
    last_name: "Wilson",
    role: "pet-owner",
    status: "active",
    avatar_url: null,
    phone: "+1234567893",
    address: "321 Pet Ln, City",
    created_at: "2024-01-18T09:15:00Z",
    updated_at: "2024-01-24T11:30:00Z",
    last_sign_in_at: "2024-01-25T07:15:00Z",
    email_verified: true,
    profile_complete: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "inactive@petportal.com",
    first_name: "Bob",
    last_name: "Inactive",
    role: "pet-owner",
    status: "inactive",
    avatar_url: null,
    phone: "+1234567894",
    address: "654 Inactive Rd, City",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-20T16:00:00Z",
    last_sign_in_at: "2024-01-20T16:00:00Z",
    email_verified: false,
    profile_complete: false
  }
];

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    emailVerified: null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load users data
  useEffect(() => {
    let timeoutId;

    const loadWithTimeout = async () => {
      // Set timeout for fallback
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached, using mock data");
        setError("Connection timeout - using mock data");
        setUsers(mockUsers);
        setLoading(false);
      }, 8000); // 8 second timeout

      try {
        await loadUsers();
      } finally {
        clearTimeout(timeoutId);
      }
    };

    loadWithTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading users from API...");

      // Use the API endpoint instead of direct Supabase calls
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log("📊 API response:", result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      if (result.success && result.data) {
        setUsers(result.data);
        setError(null);
        console.log("✅ Loaded", result.data.length, "users from API");
      } else {
        throw new Error("Invalid response format");
      }

    } catch (err) {
      setError("Using mock data - " + err.message);
      console.log("Using mock data due to:", err.message);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  const getFilteredUsers = () => {
    let filtered = [...users];

    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(search) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Email verified filter
    if (filters.emailVerified !== null) {
      filtered = filtered.filter(user => user.email_verified === filters.emailVerified);
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (!aValue) aValue = "";
      if (!bValue) bValue = "";

      // Handle dates
      if (sortBy.includes("_at")) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Create new user
  const createUser = async (userData) => {
    try {
      setLoading(true);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      await loadUsers();
      return { success: true, user: result.data };

    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (userId, updates) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      await loadUsers();
      return { success: true };

    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);

      // Get user data to check for avatar before deletion
      const userToDelete = users.find(u => u.id === userId);
      let avatarFilename = null;

      if (userToDelete?.avatar_url) {
        // Extract filename from URL
        const urlParts = userToDelete.avatar_url.split('/');
        avatarFilename = urlParts[urlParts.length - 1];
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Delete avatar file if it exists
      if (avatarFilename && avatarFilename.startsWith('profile-')) {
        try {
          await fetch(`/api/upload?filename=${encodeURIComponent(avatarFilename)}`, {
            method: 'DELETE',
          });
          console.log(`🗑️ Deleted user's avatar: ${avatarFilename}`);
        } catch (deleteError) {
          console.warn("Failed to delete user's avatar:", deleteError.message);
          // Don't throw error here since the main operation succeeded
        }
      }

      await loadUsers();
      return { success: true };

    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user status');
      }

      await loadUsers();
      return { success: true };

    } catch (error) {
      console.error("Error toggling user status:", error);
      throw new Error("Failed to update user status: " + error.message);
    }
  };

  // Upload avatar using existing upload API
  const uploadAvatar = async (userId, file) => {
    try {
      // Get current user to check for existing avatar
      const currentUser = users.find(u => u.id === userId);
      let oldFilename = null;

      if (currentUser?.avatar_url) {
        // Extract filename from URL (e.g., '/assets/profile/profile-123.jpg' -> 'profile-123.jpg')
        const urlParts = currentUser.avatar_url.split('/');
        oldFilename = urlParts[urlParts.length - 1];
      }

      const formData = new FormData();
      formData.append('profile', file);

      // Upload new file to local API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await response.json();
      const avatarUrl = uploadResult.url;

      // Update user profile with new avatar URL and full URL path
      await updateUser(userId, {
        avatar_url: avatarUrl,
        avatar_file: {
          filename: uploadResult.filename,
          url: avatarUrl
        }
      });

      // Delete old file if it exists
      if (oldFilename && oldFilename.startsWith('profile-')) {
        try {
          await fetch(`/api/upload?filename=${encodeURIComponent(oldFilename)}`, {
            method: 'DELETE',
          });
          console.log(`🗑️ Deleted old avatar: ${oldFilename}`);
        } catch (deleteError) {
          console.warn("Failed to delete old avatar:", deleteError.message);
          // Don't throw error here since the main operation succeeded
        }
      }

      return { success: true, avatarUrl };

    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw new Error("Failed to upload avatar: " + error.message);
    }
  };

  // Get statistics
  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const inactive = users.filter(u => u.status === "inactive").length;
    const verified = users.filter(u => u.email_verified).length;

    const roleStats = users.reduce((acc, user) => {
      // Use staff_type if available, otherwise use role
      const role = user.staff_type || user.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Staff specific stats
    const staffStats = users.reduce((acc, user) => {
      if (user.staff_type) {
        acc.total_staff = (acc.total_staff || 0) + 1;
        acc[user.staff_type] = (acc[user.staff_type] || 0) + 1;

        // Branch stats for staff
        if (user.branch_info?.branch_name) {
          const branchKey = `branch_${user.branch_info.branch_name.toLowerCase()}`;
          acc[branchKey] = (acc[branchKey] || 0) + 1;
        }

        // Invitation stats
        if (user.invitation_accepted === false) {
          acc.pending_invitations = (acc.pending_invitations || 0) + 1;
        }
      }
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      verified,
      unverified: total - verified,
      roles: roleStats,
      staff: staffStats
    };
  };

  return {
    // Data
    users,
    filteredUsers: getFilteredUsers(),

    // State
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    sortOrder,

    // Actions
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    uploadAvatar,
    loadUsers,

    // Filters
    setFilters,
    setSearchTerm,
    setSortBy,
    setSortOrder,

    // Utils
    stats: getStats()
  };
};

export default useUserManagement;