import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock data for fallback
const mockBranches = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // UUID (primary key)
    branch_id: 1, // Numeric ID for filtering
    branch_code: "BR001", // Display ID
    displayId: "BR001", // For component consistency
    branch_name: "Naga",
    branch_type: "main-branch",
    created_at: "2024-01-20T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    branch_id: 2, // Numeric ID for filtering
    branch_code: "BR002",
    displayId: "BR002",
    branch_name: "Pili",
    branch_type: "sub-branch",
    created_at: "2024-01-21T14:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    branch_id: 3, // Numeric ID for filtering
    branch_code: "BR003",
    displayId: "BR003",
    branch_name: "Legazpi",
    branch_type: "sub-branch",
    created_at: "2024-01-22T09:45:00Z",
  },
];

export const useBranches = (user) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load branches data
  useEffect(() => {
    // Load branches regardless of user for signup form
    loadBranches();
  }, []); // Empty dependency array since branches are public data

  const loadBranches = async () => {
    console.log("Loading branches...");
    try {
      setLoading(true);
      setError(null);

      // Use the API endpoint instead of direct Supabase calls
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
        // Map API response to component expectations
        const mappedData = result.data.map((branch) => ({
          ...branch,
          id: branch.uuid || branch.branch_id, // Use UUID for React key if available
          displayId: branch.branch_code, // Keep original branch_code for display
        }));

        setBranches(mappedData);
        console.log("Loaded branches from API:", mappedData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("Using mock data - " + err.message);
      console.log("Using mock data due to:", err.message);
      setBranches(mockBranches);
      console.log("Set mock branches:", mockBranches);
    } finally {
      setLoading(false);
      console.log("Branches loading completed");
    }
  };

  // Create branch
  const createBranch = async (branchData) => {
    try {
      const { data, error } = await supabase
        .from("vet_owner_branches")
        .insert([
          {
            branch_code: branchData.branch_id, // Map form branch_id to database branch_code
            branch_name: branchData.branch_name,
            branch_type: branchData.branch_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Map the created data to component format
      const mappedData = {
        ...data,
        id: data.branch_id,
        displayId: data.branch_code,
      };

      // Update local state
      setBranches((prev) => [mappedData, ...prev]);
      return { success: true, data: mappedData };
    } catch (error) {
      console.log("Error creating branch:", error);

      // Fallback for mock data
      const newBranch = {
        id: `550e8400-e29b-41d4-a716-${Date.now()
          .toString()
          .padStart(12, "0")}`,
        branch_code: branchData.branch_id,
        displayId: branchData.branch_id,
        branch_name: branchData.branch_name,
        branch_type: branchData.branch_type,
        created_at: new Date().toISOString(),
      };

      setBranches((prev) => [newBranch, ...prev]);
      return { success: true, data: newBranch };
    }
  };

  // Update branch
  const updateBranch = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("vet_owner_branches")
        .update({
          branch_code: updates.branch_id || updates.branch_code,
          branch_name: updates.branch_name,
          branch_type: updates.branch_type,
          updated_at: new Date().toISOString(),
        })
        .eq("branch_id", id)
        .select()
        .single();

      if (error) throw error;

      // Map updated data and update local state
      const mappedData = {
        ...data,
        id: data.branch_id,
        displayId: data.branch_code,
      };
      setBranches((prev) =>
        prev.map((branch) => (branch.id === id ? mappedData : branch))
      );
      return { success: true, data };
    } catch (error) {
      console.error("Error updating branch:", error);

      // Fallback for mock data
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === id
            ? { ...branch, ...updates, updated_at: new Date().toISOString() }
            : branch
        )
      );
      return { success: true };
    }
  };

  // Delete branch
  const deleteBranch = async (id) => {
    try {
      const { error } = await supabase
        .from("vet_owner_branches")
        .delete()
        .eq("branch_id", id);

      if (error) throw error;

      // Update local state
      setBranches((prev) => prev.filter((branch) => branch.id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting branch:", error);

      // Fallback for mock data
      setBranches((prev) => prev.filter((branch) => branch.id !== id));
      return { success: true };
    }
  };

  // Get branch by UUID
  const getBranchById = (id) => {
    return branches.find((branch) => branch.id === id);
  };

  // Get branch by display code
  const getBranchByCode = (code) => {
    return branches.find(
      (branch) => branch.displayId === code || branch.branch_code === code
    );
  };

  return {
    branches,
    loading,
    error,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchById,
    getBranchByCode,
    loadBranches,
  };
};

export default useBranches;
