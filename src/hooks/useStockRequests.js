import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock stock requests data - shown immediately
const initialMockRequests = [
  {
    id: "req-001",
    request_number: "REQ-20250123-0001",
    inventory_items: {
      item_name: "Amoxicillin 250mg",
      item_type: "medication",
      unit_of_measure: "tablets"
    },
    requested_quantity: 50,
    approved_quantity: 0,
    status: "pending",
    urgency_level: "normal",
    reason: "Running low on stock",
    requesting_branch: {
      branch_name: "Sub Branch A",
      branch_type: "sub_branch"
    },
    target_branch: {
      branch_name: "Main Branch",
      branch_type: "main_branch"
    },
    requested_at: new Date().toISOString(),
    reviewed_at: null,
    notes: null,
    requested_by: "550e8400-e29b-41d4-a716-446655440003",
    requester_name: "Dr. Sarah Johnson",
    requester_email: "sarah.johnson@petportal.com"
  },
  {
    id: "req-002",
    request_number: "REQ-20250123-0002",
    inventory_items: {
      item_name: "Rabies Vaccine",
      item_type: "vaccine",
      unit_of_measure: "vials"
    },
    requested_quantity: 20,
    approved_quantity: 15,
    status: "approved",
    urgency_level: "high",
    reason: "Emergency restocking needed",
    requesting_branch: {
      branch_name: "Sub Branch B",
      branch_type: "sub_branch"
    },
    target_branch: {
      branch_name: "Main Branch",
      branch_type: "main_branch"
    },
    requested_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: "Approved with reduced quantity due to current stock levels",
    requested_by: "550e8400-e29b-41d4-a716-446655440004",
    requester_name: "Dr. Mike Chen",
    requester_email: "mike.chen@petportal.com"
  }
];

export const useStockRequests = (user) => {
  const [stockRequests, setStockRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Show loading state initially
  const [error, setError] = useState(null);

  // Filter and search state
  const [filters, setFilters] = useState({
    status: "",
    urgency: "",
    requester: "",
    branch: "",
    dateFrom: "",
    dateTo: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Load stock requests data on mount and when user changes
  useEffect(() => {
    loadStockRequests();
  }, []); // Load immediately on mount

  useEffect(() => {
    if (user) {
      loadStockRequests(); // Reload when user is available for real data
    }
  }, [user]);

  const loadStockRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if tables exist first
      const { data: testRequests, error: testError } = await supabase
        .from("stock_requests")
        .select("id")
        .limit(1);

      if (testError) {
        console.log("Stock requests table doesn't exist yet, using mock data");
        // Load mock data since database is not available
        setStockRequests(initialMockRequests);
        setLoading(false);
        return;
      }

      // Load stock requests with related data and user information
      const { data: requests, error: requestsError } = await supabase
        .from("stock_requests")
        .select(`
          *,
          inventory_items (
            item_name,
            item_type,
            unit_of_measure
          ),
          requesting_branch:vet_owner_branches!requesting_branch_id (
            branch_id,
            branch_name,
            branch_type
          ),
          target_branch:vet_owner_branches!target_branch_id (
            branch_id,
            branch_name,
            branch_type
          )
        `)
        .order("requested_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user information for all requests in parallel
      let requestsWithUsers = [];
      if (requests) {
        // Get unique user IDs
        const userIds = [...new Set(requests.map(r => r.requested_by).filter(Boolean))];

        // Fetch all user data in parallel
        const userPromises = userIds.map(userId =>
          supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", userId)
            .single()
        );

        const userResults = await Promise.allSettled(userPromises);

        // Create user lookup map
        const userMap = {};
        userResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && !result.value.error && result.value.data) {
            const userId = userIds[index];
            const profile = result.value.data;
            userMap[userId] = {
              requester_name: `${profile.first_name} ${profile.last_name}`.trim(),
              requester_email: profile.email
            };
          }
        });

        // Apply user info to requests
        requestsWithUsers = requests.map(request => ({
          ...request,
          ...(userMap[request.requested_by] || {})
        }));
      }

      // Transform data to match component expectations
      const transformedRequests = requestsWithUsers?.map((request) => ({
        ...request,
        inventory_items: {
          item_name: request.inventory_items?.item_name,
          item_type: request.inventory_items?.item_type,
          unit_of_measure: request.inventory_items?.unit_of_measure
        },
        requesting_branch: {
          branch_name: request.requesting_branch?.branch_name,
          branch_type: request.requesting_branch?.branch_type
        },
        target_branch: {
          branch_name: request.target_branch?.branch_name,
          branch_type: request.target_branch?.branch_type
        }
      })) || [];

      setStockRequests(transformedRequests);

    } catch (err) {
      setError("Using mock data - " + err.message);
      console.log("Using mock data due to:", err.message);
      // Mock data is already set in initial state, just ensure it's still there
      if (stockRequests.length === 0) {
        setStockRequests(initialMockRequests);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a new stock request
  const createStockRequest = async (requestData) => {
    try {
      // Check if tables exist
      const { data: testRequests, error: testError } = await supabase
        .from("stock_requests")
        .select("id")
        .limit(1);

      if (testError) {
        throw new Error("Database tables not available. Using mock data.");
      }

      // Try to get user's branches
      let requestingBranchId = null;
      let targetBranchId = null;

      // Try to find user's assigned branch through veterinary staff table first
      const { data: staffBranches, error: staffError } = await supabase
        .from("veterinary_staff")
        .select("designated_branch_id")
        .eq("assigned_id", user?.id)
        .limit(1);

      if (staffBranches && staffBranches.length > 0) {
        requestingBranchId = staffBranches[0].designated_branch_id;
      } else {
        // If no staff assignment found, get any available branch as fallback
        const { data: anyBranches, error: anyBranchError } = await supabase
          .from("vet_owner_branches")
          .select("branch_id")
          .limit(1);

        if (anyBranches && anyBranches.length > 0) {
          requestingBranchId = anyBranches[0].branch_id;
          console.warn("No user staff assignment found, using fallback branch");
        } else {
          throw new Error("No branches found in the system. Please create a branch first.");
        }
      }

      // Get main branch as target, or use the requesting branch if no main branch exists
      const { data: targetBranches, error: targetError } = await supabase
        .from("vet_owner_branches")
        .select("branch_id")
        .eq("branch_type", "main-branch")
        .limit(1);

      targetBranchId = targetBranches?.[0]?.branch_id || requestingBranchId;

      // Generate request number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = Math.floor(today.getTime() / 1000).toString().slice(-4);
      const requestNumber = `REQ-${dateStr}-${timeStr}`;

      // Create the stock request
      const { data: newRequest, error: insertError } = await supabase
        .from("stock_requests")
        .insert([
          {
            request_number: requestNumber,
            requesting_branch_id: requestingBranchId,
            target_branch_id: targetBranchId,
            inventory_item_id: requestData.inventory_item_id,
            requested_quantity: requestData.requested_quantity,
            reason: requestData.reason,
            urgency_level: requestData.urgency_level || "normal",
            status: "pending",
            requested_by: user?.id,
            requested_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh data
      await loadStockRequests();

      return { success: true, request: newRequest };
    } catch (error) {
      console.error("Error creating stock request:", error);
      throw new Error("Failed to create stock request: " + error.message);
    }
  };

  // Approve a stock request
  const approveStockRequest = async (requestId, approvedQuantity, notes = "") => {
    try {
      const { data: updatedRequest, error: updateError } = await supabase
        .from("stock_requests")
        .update({
          status: "approved",
          approved_quantity: approvedQuantity,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh data
      await loadStockRequests();

      return { success: true, request: updatedRequest };
    } catch (error) {
      console.error("Error approving stock request:", error);
      throw new Error("Failed to approve stock request: " + error.message);
    }
  };

  // Reject a stock request
  const rejectStockRequest = async (requestId, reason) => {
    try {
      const { data: updatedRequest, error: updateError } = await supabase
        .from("stock_requests")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh data
      await loadStockRequests();

      return { success: true, request: updatedRequest };
    } catch (error) {
      console.error("Error rejecting stock request:", error);
      throw new Error("Failed to reject stock request: " + error.message);
    }
  };

  // Cancel a stock request (only by requester)
  const cancelStockRequest = async (requestId) => {
    try {
      const { data: updatedRequest, error: updateError } = await supabase
        .from("stock_requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("requested_by", user?.id) // Only requester can cancel
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh data
      await loadStockRequests();

      return { success: true, request: updatedRequest };
    } catch (error) {
      console.error("Error cancelling stock request:", error);
      throw new Error("Failed to cancel stock request: " + error.message);
    }
  };

  // Fulfill a stock request (move stock between branches)
  const fulfillStockRequest = async (requestId) => {
    try {
      // Get the request details
      const request = stockRequests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");

      if (request.status !== "approved") {
        throw new Error("Only approved requests can be fulfilled");
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("stock_requests")
        .update({
          status: "fulfilled",
          fulfilled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Here you would also need to:
      // 1. Reduce stock from target branch
      // 2. Increase stock in requesting branch
      // 3. Create stock transaction records
      // This would require integration with the inventory management system

      // Refresh data
      await loadStockRequests();

      return { success: true };
    } catch (error) {
      console.error("Error fulfilling stock request:", error);
      throw new Error("Failed to fulfill stock request: " + error.message);
    }
  };

  // Get filtered and searched requests
  const getFilteredRequests = () => {
    let filtered = [...stockRequests];

    // Text search across multiple fields
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.request_number?.toLowerCase().includes(search) ||
        request.inventory_items?.item_name?.toLowerCase().includes(search) ||
        request.requester_name?.toLowerCase().includes(search) ||
        request.requester_email?.toLowerCase().includes(search) ||
        request.reason?.toLowerCase().includes(search) ||
        request.requesting_branch?.branch_name?.toLowerCase().includes(search) ||
        request.target_branch?.branch_name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Urgency filter
    if (filters.urgency && filters.urgency !== "all") {
      filtered = filtered.filter(request => request.urgency_level === filters.urgency);
    }

    // Requester filter
    if (filters.requester && filters.requester !== "all") {
      filtered = filtered.filter(request => request.requested_by === filters.requester);
    }

    // Branch filter (requesting or target branch)
    if (filters.branch && filters.branch !== "all") {
      filtered = filtered.filter(request =>
        request.requesting_branch?.branch_name === filters.branch ||
        request.target_branch?.branch_name === filters.branch
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requested_at);
        return requestDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requested_at);
        return requestDate <= toDate;
      });
    }

    return filtered;
  };

  // Update individual filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      urgency: "",
      requester: "",
      branch: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
  };

  // Get unique values for filter options
  const getFilterOptions = () => {
    const statuses = [...new Set(stockRequests.map(r => r.status))].sort();
    const urgencies = [...new Set(stockRequests.map(r => r.urgency_level))].sort();
    const requesters = [...new Set(stockRequests
      .filter(r => r.requester_name)
      .map(r => ({ id: r.requested_by, name: r.requester_name }))
    )];
    const branches = [...new Set([
      ...stockRequests.map(r => r.requesting_branch?.branch_name),
      ...stockRequests.map(r => r.target_branch?.branch_name)
    ].filter(Boolean))].sort();

    return {
      statuses,
      urgencies,
      requesters,
      branches
    };
  };

  // Get statistics
  const getStats = () => {
    const total = stockRequests.length;
    const pending = stockRequests.filter(r => r.status === "pending").length;
    const approved = stockRequests.filter(r => r.status === "approved").length;
    const rejected = stockRequests.filter(r => r.status === "rejected").length;
    const fulfilled = stockRequests.filter(r => r.status === "fulfilled").length;

    return {
      total,
      pending,
      approved,
      rejected,
      fulfilled
    };
  };

  return {
    // Data
    stockRequests,
    filteredRequests: getFilteredRequests(),

    // State
    loading,
    error,
    filters,
    searchTerm,

    // Actions
    createStockRequest,
    approveStockRequest,
    rejectStockRequest,
    cancelStockRequest,
    fulfillStockRequest,
    loadStockRequests,
    updateFilter,
    clearFilters,
    setSearchTerm,

    // Utils
    getFilteredRequests,
    getFilterOptions,
    getStats,
    stats: getStats(),
    filterOptions: getFilterOptions()
  };
};

export default useStockRequests;