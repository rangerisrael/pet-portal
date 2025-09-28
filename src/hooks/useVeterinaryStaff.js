import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock data for fallback
const mockVeterinaryStaff = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // UUID (primary key)
    staff_code: "VS001", // Display ID
    displayId: "VS001", // For component consistency
    staff_name: "Dr. Maria Santos",
    staff_email: "maria.santos@example.com",
    staff_type: "resident",
    vet_owner_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
    assigned_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
    designated_branch_id: "550e8400-e29b-41d4-a716-446655440001",
    branch_name: "Naga",
    invitation_accepted: true,
    created_at: "2024-01-20T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    staff_code: "VS002",
    displayId: "VS002",
    staff_name: "John Dela Cruz",
    staff_email: "john.delacruz@example.com",
    staff_type: "assistant",
    vet_owner_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
    assigned_id: "dd0986eb-40a1-429c-86c2-74c814887781",
    designated_branch_id: "550e8400-e29b-41d4-a716-446655440002",
    branch_name: "Pili",
    invitation_accepted: false,
    created_at: "2024-01-21T14:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    staff_code: "VS003",
    displayId: "VS003",
    staff_name: "Dr. Ana Reyes",
    staff_email: "ana.reyes@example.com",
    staff_type: "resident",
    vet_owner_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
    assigned_id: "dd0986eb-40a1-429c-86c2-74c814887781",
    designated_branch_id: "550e8400-e29b-41d4-a716-446655440003",
    branch_name: "Legazpi",
    invitation_accepted: true,
    created_at: "2024-01-22T09:45:00Z",
  },
];

export const useVeterinaryStaff = (user) => {
  const [veterinaryStaff, setVeterinaryStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load veterinary staff and branches data
  useEffect(() => {
    if (user) {
      loadVeterinaryStaff();
      loadBranches();
    }
  }, [user]);

  const loadBranches = async () => {
    try {
      console.log("🔄 Loading branches from API...");

      const response = await fetch('/api/branches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch branches');
      }

      if (result.success && result.data) {
        setBranches(result.data);
        console.log("✅ Loaded", result.data.length, "branches from API");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.log("Error loading branches:", err.message);
      // Use mock data branches
      setBranches([
        { branch_id: "550e8400-e29b-41d4-a716-446655440001", branch_name: "Naga", branch_code: "BR001" },
        { branch_id: "550e8400-e29b-41d4-a716-446655440002", branch_name: "Pili", branch_code: "BR002" },
        { branch_id: "550e8400-e29b-41d4-a716-446655440003", branch_name: "Legazpi", branch_code: "BR003" },
      ]);
    }
  };

  const loadVeterinaryStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading veterinary staff from API...");

      const response = await fetch('/api/veterinary-staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch veterinary staff');
      }

      if (result.success && result.data) {
        setVeterinaryStaff(result.data);
        setError(null);
        console.log("✅ Loaded", result.data.length, "veterinary staff from API");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("Using mock data - " + err.message);
      console.log("Using mock data due to:", err.message);
      setVeterinaryStaff(mockVeterinaryStaff);
    } finally {
      setLoading(false);
    }
  };

  // Generate next staff ID
  const generateNextStaffId = () => {
    if (veterinaryStaff.length === 0) return "VS001";

    const existingNumbers = veterinaryStaff
      .map(s => {
        const code = s.displayId || s.staff_code;
        const match = code?.match(/^VS(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = Math.max(...existingNumbers, 0);
    const nextNumber = maxNumber + 1;
    return `VS${nextNumber.toString().padStart(3, '0')}`;
  };

  // Create veterinary staff
  const createVeterinaryStaff = async (staffData) => {
    try {
      const response = await fetch('/api/veterinary-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_code: staffData.staff_id, // Map form staff_id to database staff_code
          staff_name: staffData.staff_name,
          staff_email: staffData.staff_email,
          staff_type: staffData.staff_type,
          vet_owner_id: staffData.vet_owner_id,
          assigned_id: staffData.assigned_id,
          designated_branch_id: staffData.designated_branch_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create veterinary staff');
      }

      // Update local state
      if (result.data) {
        setVeterinaryStaff((prev) => [result.data, ...prev]);
      }

      await loadVeterinaryStaff(); // Refresh the list
      return { success: true, data: result.data };
    } catch (error) {
      console.log("Error creating veterinary staff:", error);

      // Fallback for mock data
      const newStaff = {
        id: `550e8400-e29b-41d4-a716-${Date.now().toString().padStart(12, '0')}`,
        staff_code: staffData.staff_id,
        displayId: staffData.staff_id,
        staff_name: staffData.staff_name,
        staff_email: staffData.staff_email,
        staff_type: staffData.staff_type,
        vet_owner_id: staffData.vet_owner_id,
        assigned_id: staffData.assigned_id,
        designated_branch_id: staffData.designated_branch_id,
        branch_name: branches.find(b => b.branch_id === staffData.designated_branch_id)?.branch_name || "Unknown Branch",
        invitation_accepted: false,
        created_at: new Date().toISOString(),
      };

      setVeterinaryStaff((prev) => [newStaff, ...prev]);
      return { success: true, data: newStaff };
    }
  };

  // Update veterinary staff
  const updateVeterinaryStaff = async (id, updates) => {
    try {
      const response = await fetch(`/api/veterinary-staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_code: updates.staff_id || updates.staff_code,
          staff_name: updates.staff_name,
          staff_email: updates.staff_email,
          staff_type: updates.staff_type,
          designated_branch_id: updates.designated_branch_id,
          invitation_accepted: updates.invitation_accepted,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update veterinary staff');
      }

      // Update local state
      if (result.data) {
        setVeterinaryStaff((prev) =>
          prev.map((staff) => (staff.id === id ? result.data : staff))
        );
      }

      await loadVeterinaryStaff(); // Refresh the list
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error updating veterinary staff:", error);

      // Fallback for mock data
      setVeterinaryStaff((prev) =>
        prev.map((staff) =>
          staff.id === id
            ? {
                ...staff,
                ...updates,
                branch_name: branches.find(b => b.branch_id === updates.designated_branch_id)?.branch_name || staff.branch_name,
                updated_at: new Date().toISOString()
              }
            : staff
        )
      );
      return { success: true };
    }
  };

  // Delete veterinary staff
  const deleteVeterinaryStaff = async (id) => {
    try {
      const response = await fetch(`/api/veterinary-staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete veterinary staff');
      }

      // Update local state
      setVeterinaryStaff((prev) => prev.filter((staff) => staff.id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting veterinary staff:", error);

      // Fallback for mock data
      setVeterinaryStaff((prev) => prev.filter((staff) => staff.id !== id));
      return { success: true };
    }
  };

  // Get staff by UUID
  const getStaffById = (id) => {
    return veterinaryStaff.find((staff) => staff.id === id);
  };

  // Get staff by display code
  const getStaffByCode = (code) => {
    return veterinaryStaff.find((staff) => staff.displayId === code || staff.staff_code === code);
  };

  // Generate invitation link
  const generateInvitationLink = (staffId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${staffId}`;
  };

  return {
    veterinaryStaff,
    branches,
    loading,
    error,
    createVeterinaryStaff,
    updateVeterinaryStaff,
    deleteVeterinaryStaff,
    getStaffById,
    getStaffByCode,
    generateNextStaffId,
    generateInvitationLink,
    loadVeterinaryStaff,
  };
};

export default useVeterinaryStaff;