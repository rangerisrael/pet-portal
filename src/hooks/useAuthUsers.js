import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-toastify';

// Mock users for fallback (excluding vet-owners)
const mockUsers = [
  {
    id: "dd0986eb-40a1-429c-86c2-74c814887781",
    email: "john.delacruz@example.com",
    user_metadata: {
      full_name: "John Dela Cruz",
      first_name: "John",
      last_name: "Dela Cruz",
      role: "pet-owner"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "ana.reyes@example.com",
    user_metadata: {
      full_name: "Dr. Ana Reyes",
      first_name: "Ana",
      last_name: "Reyes",
      role: "pet-owner"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "carlos.mendez@example.com",
    user_metadata: {
      full_name: "Carlos Mendez",
      first_name: "Carlos",
      last_name: "Mendez",
      role: "pet-owner"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    email: "lisa.garcia@example.com",
    user_metadata: {
      full_name: "Dr. Lisa Garcia",
      first_name: "Lisa",
      last_name: "Garcia",
      role: "pet-owner"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    email: "mike.torres@example.com",
    user_metadata: {
      full_name: "Michael Torres",
      first_name: "Michael",
      last_name: "Torres",
      role: "pet-owner"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    email: "sarah.kim@example.com",
    user_metadata: {
      full_name: "Dr. Sarah Kim",
      first_name: "Sarah",
      last_name: "Kim",
      role: "pet-owner"
    }
  }
];

export const useAuthUsers = (veterinaryStaff = []) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading registered users from Supabase Auth...");

      if (!supabase) {
        console.log('❌ Supabase not available, using mock data');
        const formattedMockUsers = mockUsers.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          role: user.user_metadata?.role || "pet-owner",
          created_at: new Date().toISOString()
        }));
        setUsers(formattedMockUsers);
        return;
      }

      // Try to get all authenticated users via API endpoint
      try {
        console.log("📡 Fetching users from /api/users endpoint...");

        const response = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          console.log(`✅ Loaded ${data.data.length} users from API:`, data.data);

          // Format users for compatibility - filter out vet-owners and staff members
          const formattedUsers = data.data
            .filter(user => user.role !== 'vet-owner' && !user.is_staff) // Exclude vet-owners and existing staff
            .map(user => ({
              id: user.id,
              email: user.email,
              full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              role: user.role || 'pet-owner',
              phone: user.phone || '',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
              // Keep original API data
              api_user: user
            }));

          setUsers(formattedUsers);
          return;
        } else {
          throw new Error(data.error || 'API returned no users');
        }

      } catch (apiError) {
        console.log("⚠️ API call failed:", apiError.message);
        console.log("🔄 Falling back to mock data...");
        throw apiError;
      }

    } catch (err) {
      setError("Using demo data - " + err.message);
      console.log("❌ Failed to load auth users:", err.message);
      console.log("📝 Using mock data as fallback");

      // Use mock data with proper formatting (already filtered to exclude vet-owners)
      const formattedMockUsers = mockUsers.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        role: user.user_metadata?.role || "pet-owner",
        created_at: new Date().toISOString()
      }));

      setUsers(formattedMockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Get user by ID
  const getUserById = (id) => {
    return users.find(user => user.id === id);
  };

  // Get user by email
  const getUserByEmail = (email) => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  };

  // Search users by name or email
  const searchUsers = (searchTerm) => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.full_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.first_name.toLowerCase().includes(term) ||
      user.last_name.toLowerCase().includes(term)
    );
  };

  // Get users eligible for staff assignment (exclude vet-owners and already assigned staff)
  const getEligibleStaffUsers = (excludeStaffId = null) => {
    // Get list of already assigned user IDs
    const assignedUserIds = veterinaryStaff
      .filter(staff => staff.assigned_id && (!excludeStaffId || staff.id !== excludeStaffId))
      .map(staff => staff.assigned_id);

    return users.filter(user =>
      user.role !== "vet-owner" &&
      !assignedUserIds.includes(user.id)
    );
  };

  // Check if user is eligible for staff assignment
  const isUserEligibleForStaff = (userId, excludeStaffId = null) => {
    const user = getUserById(userId);
    if (!user || user.role === "vet-owner") {
      return false;
    }

    // Check if user is already assigned as staff (excluding current edit case)
    const isAlreadyAssigned = veterinaryStaff.some(staff =>
      staff.assigned_id === userId &&
      (!excludeStaffId || staff.id !== excludeStaffId)
    );

    return !isAlreadyAssigned;
  };

  // Create a new pet owner
  const createPetOwner = async (ownerData) => {
    try {
      // For mock data, add to local state
      const newOwner = {
        id: 'user-' + Date.now(),
        email: ownerData.email,
        full_name: `${ownerData.first_name} ${ownerData.last_name}`.trim(),
        first_name: ownerData.first_name,
        last_name: ownerData.last_name,
        phone: ownerData.phone || '',
        role: ownerData.role || 'pet-owner',
        created_at: new Date().toISOString()
      };

      // Try to create directly in user_profiles table first
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            id: newOwner.id, // In production, this should be a proper UUID from auth.users
            email: ownerData.email,
            full_name: `${ownerData.first_name} ${ownerData.last_name}`.trim(),
            first_name: ownerData.first_name,
            last_name: ownerData.last_name,
            phone: ownerData.phone || '',
            role: ownerData.role || 'pet-owner'
          }])
          .select();

        if (data && !error) {
          await loadUsers(); // Refresh the list
          toast.success("Pet owner created successfully!");
          return data[0];
        }

        if (error) {
          console.log("Direct database creation failed:", error.message);
          throw new Error("Database creation failed");
        }
      } catch (dbError) {
        console.log("Database creation failed, trying API:", dbError.message);
      }

      // Try to create via API second
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ownerData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            await loadUsers(); // Refresh the list
            toast.success("Pet owner created successfully!");
            return data.data;
          }
        }
        throw new Error("API creation failed");
      } catch (apiError) {
        console.log("API creation failed, using mock mode:", apiError.message);
      }

      // Fallback to mock data
      setUsers(prev => [newOwner, ...prev]);
      toast.success("Pet owner created successfully! (Demo mode)");
      return newOwner;

    } catch (error) {
      console.error("Error creating pet owner:", error);
      toast.error("Error creating pet owner: " + error.message);
      throw error;
    }
  };

  // Update a pet owner
  const updatePetOwner = async (ownerId, ownerData) => {
    try {
      const updatedData = {
        first_name: ownerData.first_name,
        last_name: ownerData.last_name,
        phone: ownerData.phone,
        role: ownerData.role,
        full_name: `${ownerData.first_name} ${ownerData.last_name}`.trim()
      };

      // Try to update directly in user_profiles table first
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updatedData)
          .eq('id', ownerId)
          .select();

        if (data && !error) {
          await loadUsers(); // Refresh the list
          toast.success("Pet owner updated successfully!");
          return data[0];
        }

        if (error) {
          console.log("Direct database update failed:", error.message);
          throw new Error("Database update failed");
        }
      } catch (dbError) {
        console.log("Database update failed, trying API:", dbError.message);
      }

      // Try to update via API second
      try {
        const response = await fetch(`/api/users/${ownerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            await loadUsers(); // Refresh the list
            toast.success("Pet owner updated successfully!");
            return data.data;
          }
        }
        throw new Error("API update failed");
      } catch (apiError) {
        console.log("API update failed, using mock mode:", apiError.message);
      }

      // Fallback to mock data update
      setUsers(prev => prev.map(user =>
        user.id === ownerId
          ? { ...user, ...updatedData, updated_at: new Date().toISOString() }
          : user
      ));
      toast.success("Pet owner updated successfully! (Demo mode)");

    } catch (error) {
      console.error("Error updating pet owner:", error);
      toast.error("Error updating pet owner: " + error.message);
      throw error;
    }
  };

  // Delete a pet owner
  const deletePetOwner = async (ownerId) => {
    try {
      // Check if owner has pets first
      if (supabase) {
        try {
          const { data: pets } = await supabase
            .from("pets")
            .select("id")
            .eq("owner_id", ownerId);

          if (pets && pets.length > 0) {
            toast.error(
              "Cannot delete pet owner with registered pets. Please remove or reassign pets first."
            );
            return;
          }
        } catch (error) {
          console.log("Could not check for pets, proceeding with deletion");
        }
      }

      // Try to delete directly from user_profiles table first
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', ownerId)
          .select();

        if (!error) {
          await loadUsers(); // Refresh the list
          toast.success("Pet owner deleted successfully!");
          return;
        }

        if (error) {
          console.log("Direct database deletion failed:", error.message);
          throw new Error("Database deletion failed");
        }
      } catch (dbError) {
        console.log("Database deletion failed, trying API:", dbError.message);
      }

      // Try to delete via API second
      try {
        const response = await fetch(`/api/users/${ownerId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            await loadUsers(); // Refresh the list
            toast.success("Pet owner deleted successfully!");
            return;
          }
        }
        throw new Error("API deletion failed");
      } catch (apiError) {
        console.log("API deletion failed, using mock mode:", apiError.message);
      }

      // Fallback to mock data deletion
      setUsers(prev => prev.filter(user => user.id !== ownerId));
      toast.success("Pet owner deleted successfully! (Demo mode)");

    } catch (error) {
      console.error("Error deleting pet owner:", error);
      toast.error("Error deleting pet owner: " + error.message);
      throw error;
    }
  };

  return {
    users,
    loading,
    error,
    getUserById,
    getUserByEmail,
    searchUsers,
    getEligibleStaffUsers,
    isUserEligibleForStaff,
    loadUsers,
    createPetOwner,
    updatePetOwner,
    deletePetOwner
  };
};

export default useAuthUsers;