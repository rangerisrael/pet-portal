import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Package,
  Stethoscope,
  Syringe,
  TrendingDown,
  XCircle,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Pill,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import useInventory from "@/hooks/useInventory";
import useBranches from "@/hooks/useBranches";
import useStockRequests from "@/hooks/useStockRequests";

// Import smaller components
import InventoryTabs from "./InventoryTabs";
import InventoryStats from "./InventoryStats";

// Lazy load modal components for better performance
const StockRequestResultModal = lazy(() =>
  import("@/components/dashboard/modal/StockRequestResultModal")
);
const StockRequestRejectionModal = lazy(() =>
  import("@/components/dashboard/modal/StockRequestRejectionModal")
);

const InventoryContent = ({ user, userRole, branchName, branchID }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBranch, setSelectedBranch] = useState(
    userRole.includes("vet-owner") ? "all" : branchID || "all"
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStockRequestForm, setShowStockRequestForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [itemToUpdateStock, setItemToUpdateStock] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);

  // Stock request result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState(null);
  const [resultModalType, setResultModalType] = useState("info");

  // Stock request view modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewModalRequest, setViewModalRequest] = useState(null);

  // Stock request rejection modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);

  // Get branches for the user
  const { branches, loading: branchesLoading } = useBranches(user);

  console.log("🏢 Branches loading state:", branchesLoading);
  console.log("🏢 Branches data:", branches);

  // Get stock requests data and methods
  const {
    stockRequests,
    filteredRequests,
    loading: requestsLoading,
    error: requestsError,
    filters,
    searchTerm,
    filterOptions,
    createStockRequest,
    approveStockRequest,
    rejectStockRequest,
    cancelStockRequest,
    fulfillStockRequest,
    updateFilter,
    clearFilters,
    setSearchTerm,
    stats: requestStats,
  } = useStockRequests(user);

  // Get inventory data and CRUD methods
  const {
    inventoryItems = [],
    filteredItems = [],
    loading = false,
    error = null,
    filters: inventoryFilters = {},
    searchTerm: inventorySearchTerm = "",
    filterOptions: inventoryFilterOptions = {},
    stats = {
      totalItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      medicinesCount: 0,
      vaccinesCount: 0,
      suppliesCount: 0,
    },
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    updateFilter: updateInventoryFilter,
    clearFilters: clearInventoryFilters,
    setSearchTerm: setInventorySearchTerm,
    loadInventoryData,
  } = useInventory() || {};

  // Transform inventory data to match component expectations
  const getInventoryWithBranches = () => {
    console.log("🔍 getInventoryWithBranches called");
    console.log("📊 inventoryItems:", inventoryItems);
    console.log("📊 inventoryItems.length:", inventoryItems.length);
    console.log("🏢 branches:", branches);
    console.log("👤 userRole:", userRole);
    console.log("🆔 branchID:", branchID);

    // Check if we have real inventory data (not loading and has items)
    if (!loading && inventoryItems && inventoryItems.length > 0) {
      console.log(
        "✅ Using real inventory data",
        inventoryItems.length,
        "items"
      );
      return inventoryItems.map((item) => {
        // Find the correct branch for this inventory item
        const itemBranch =
          branches.find((b) => b.branch_id === item.branch_id) || branches[0];

        return {
          id: item.id,
          name: item.item_name || item.name,
          item_name: item.item_name || item.name,
          item_code: item.item_code || `ITM-${item.id}`,
          item_type: item.item_type,
          description: item.description,
          unit_of_measure: item.unit_of_measure || "units",
          unit_cost: item.unit_cost || 0,
          selling_price: item.selling_price || 0,
          current_stock: item.current_stock || 0,
          minimum_stock:
            item.minimum_stock_level || item.minimum_threshold || 0,
          minimum_threshold:
            item.minimum_stock_level || item.minimum_threshold || 0,
          reorder_point:
            item.reorder_point ||
            item.minimum_stock_level ||
            item.minimum_threshold ||
            0,
          category: item.item_type || "Uncategorized",
          supplier: item.supplier || "Default Supplier",
          brand: item.brand || "",
          status:
            item.status ||
            (item.current_stock <= (item.minimum_threshold || 0)
              ? "low_stock"
              : "active"),
          has_expiration: item.has_expiration || false,
          last_updated: item.last_updated || new Date().toISOString(),
          branch_id: item.branch_id || itemBranch?.branch_id,
          inventory_items: {
            item_name: item.item_name || item.name,
            item_type: item.item_type,
            description: item.description,
          },
          vet_owner_branches: {
            branch_name: itemBranch?.branch_name || "Main Branch",
            branch_id: item.branch_id || itemBranch?.branch_id,
            branch_type: item.branch_type || itemBranch?.branch_type || "main",
          },
        };
      });
    }

    console.log("⚠️ Using fallback mock data - real data not available");
    console.log("📊 Debug info:", {
      loading,
      inventoryItemsLength: inventoryItems?.length,
      branchesLength: branches?.length,
      hasInventoryItems: !!inventoryItems,
    });

    // Ensure we have branches before creating mock data
    if (!branches || branches.length === 0) {
      console.log("❌ No branches available, returning empty inventory");
      return [];
    }

    // Create mock data distributed across available branches
    const mockData = [];

    // Filter branches based on user role and assigned branch
    let targetBranches = branches;

    // For sub-branch or main-branch users, only create items for their assigned branch
    if (
      (userRole.includes("sub-branch") || userRole.includes("main-branch")) &&
      branchID
    ) {
      const assignedBranch = branches.find(
        (b) => b.branch_id === parseInt(branchID)
      );
      if (assignedBranch) {
        targetBranches = [assignedBranch];
        console.log(
          `🎯 Creating mock data only for assigned branch: ${assignedBranch.branch_name} (ID: ${assignedBranch.branch_id})`
        );
      }
    }

    // For each target branch, create some sample inventory items
    targetBranches.forEach((branch, index) => {
      console.log(`🏪 Creating inventory for branch ${index + 1}:`, {
        id: branch.branch_id,
        name: branch.branch_name,
        type: branch.branch_type,
      });

      // Create 2-3 items per branch
      const itemsForBranch = [
        {
          id: `inv-${branch.branch_id}-001`,
          name: `Rabies Vaccine - ${branch.branch_name}`,
          item_name: `Rabies Vaccine - ${branch.branch_name}`,
          item_code: `VAC-${branch.branch_id}-001`,
          item_type: "vaccine",
          description: "Annual rabies vaccination",
          unit_of_measure: "vials",
          unit_cost: 8.5,
          selling_price: 25.0,
          current_stock: 25 + index * 5,
          minimum_stock: 10,
          minimum_threshold: 10,
          reorder_point: 15,
          category: "Vaccines",
          supplier: "VetMed Supply Co.",
          brand: "VetVaccines",
          status: 25 + index * 5 <= 10 ? "low_stock" : "active",
          has_expiration: true,
          last_updated: new Date().toISOString(),
          branch_id: branch.branch_id,
          inventory_items: {
            item_name: `Rabies Vaccine - ${branch.branch_name}`,
            item_type: "vaccine",
            description: "Annual rabies vaccination",
          },
          vet_owner_branches: {
            branch_name: branch.branch_name,
            branch_id: branch.branch_id,
            branch_type: branch.branch_type,
          },
        },
        {
          id: `inv-${branch.branch_id}-002`,
          name: `Amoxicillin 250mg - ${branch.branch_name}`,
          item_name: `Amoxicillin 250mg - ${branch.branch_name}`,
          item_code: `MED-${branch.branch_id}-001`,
          item_type: "medicine",
          description: "Antibiotic for bacterial infections",
          unit_of_measure: "tablets",
          unit_cost: 0.5,
          selling_price: 1.25,
          current_stock: Math.max(15 - index * 3, 0),
          minimum_stock: 10,
          minimum_threshold: 10,
          reorder_point: 15,
          category: "Medicines",
          supplier: "PharmVet Inc.",
          brand: "MedPills",
          status: 15 - index * 3 <= 10 ? "low_stock" : "active",
          has_expiration: true,
          last_updated: new Date().toISOString(),
          branch_id: branch.branch_id,
          inventory_items: {
            item_name: `Amoxicillin 250mg - ${branch.branch_name}`,
            item_type: "medicine",
            description: "Antibiotic for bacterial infections",
          },
          vet_owner_branches: {
            branch_name: branch.branch_name,
            branch_id: branch.branch_id,
            branch_type: branch.branch_type,
          },
        },
        {
          id: `inv-${branch.branch_id}-003`,
          name: `Surgical Gloves - ${branch.branch_name}`,
          item_name: `Surgical Gloves - ${branch.branch_name}`,
          item_code: `SUP-${branch.branch_id}-001`,
          item_type: "supply",
          description: "Sterile surgical gloves",
          unit_of_measure: "pairs",
          unit_cost: 0.25,
          selling_price: 0.75,
          current_stock: 100 + index * 20,
          minimum_stock: 50,
          minimum_threshold: 50,
          reorder_point: 75,
          category: "Surgical Supplies",
          supplier: "Medical Supply Co.",
          brand: "SafeGloves",
          status: 100 + index * 20 <= 50 ? "low_stock" : "active",
          has_expiration: false,
          last_updated: new Date().toISOString(),
          branch_id: branch.branch_id,
          inventory_items: {
            item_name: `Surgical Gloves - ${branch.branch_name}`,
            item_type: "supply",
            description: "Sterile surgical gloves",
          },
          vet_owner_branches: {
            branch_name: branch.branch_name,
            branch_id: branch.branch_id,
            branch_type: branch.branch_type,
          },
        },
      ];

      mockData.push(...itemsForBranch);
    });

    console.log(
      "📦 Generated mock data for branches:",
      branches.length,
      "items:",
      mockData.length
    );
    console.log("📦 Mock data details:", mockData);
    return mockData;
  };

  // Use real stock requests data (with comprehensive filtering)
  const requests = filteredRequests;

  const mockAlerts = [
    {
      id: "alert-001",
      alert_type: "low_stock",
      alert_level: "warning",
      message: "Amoxicillin 250mg is running low (5 remaining, minimum 15)",
      inventory_items: {
        item_name: "Amoxicillin 250mg",
      },
      is_acknowledged: false,
      created_at: new Date().toISOString(),
    },
  ];

  // Use transformed data that matches component expectations
  let inventory = getInventoryWithBranches();

  // TEMPORARY FIX: If inventory is empty, use direct hook data with proper mapping
  if (!inventory || inventory.length === 0) {
    console.log("🔧 Using direct hook data as fallback");
    inventory = (inventoryItems || []).map((item) => ({
      id: item.id,
      inventory_items: {
        item_name: item.item_name || item.name,
        item_type: item.item_type,
        description: item.description,
      },
      current_stock: item.current_stock || 0,
      minimum_threshold:
        item.minimum_threshold || item.minimum_stock_level || 0,
      branch_id: item.branch_id,
      vet_owner_branches: item.vet_owner_branches || {
        branch_name: "Unknown Branch",
      },
    }));
  }

  // Debug: Force display some test data if inventory is empty
  console.log(
    "📊 Final inventory for display:",
    inventory?.length || 0,
    "items"
  );
  if (inventory && inventory.length > 0) {
    console.log("📦 Sample inventory item:", inventory[0]);
  }
  const alerts = mockAlerts;

  // Get the branch for display
  const currentBranch =
    selectedBranch === "all"
      ? null
      : branches.find((b) => b.branch_id === parseInt(selectedBranch));

  // Filter data based on selected branch
  const getFilteredData = () => {
    console.log("=== FILTERING DEBUG ===");
    console.log(
      "Selected branch:",
      selectedBranch,
      "Type:",
      typeof selectedBranch
    );
    console.log("Branch ID prop:", branchID, "Type:", typeof branchID);
    console.log("User role:", userRole);
    console.log("All inventory items:", inventory);

    // For branch users (main-branch or sub-branch), always filter by their assigned branchID only
    if (userRole.includes("main-branch") || userRole.includes("sub-branch")) {
      let assignedBranchId = parseInt(branchID);
      console.log(
        "🔍 Branch user filtering - User Role:",
        userRole,
        "Raw branchID:",
        branchID,
        "Assigned branch ID:",
        assignedBranchId,
        "Type:",
        typeof assignedBranchId
      );

      // Check for invalid branch ID and try to find a fallback
      if (!branchID || isNaN(assignedBranchId)) {
        console.warn(
          "⚠️ Invalid or missing branch ID for branch user:",
          branchID
        );

        // Try to find a suitable branch as fallback for sub-branch users
        if (userRole.includes("sub-branch") && branches.length > 0) {
          const subBranch =
            branches.find((b) => b.branch_type === "sub-branch") || branches[0];
          if (subBranch) {
            assignedBranchId = subBranch.branch_id;
            console.log(
              "🔧 Using fallback branch for sub-branch user:",
              subBranch
            );
          }
        }

        // If still no valid branch ID, return empty results
        if (!assignedBranchId || isNaN(assignedBranchId)) {
          console.warn(
            "🚫 User is not properly assigned to a branch and no fallback available"
          );
          return {
            inventory: [],
            requests: [],
            alerts: [],
          };
        }
      }

      const filteredInventory = inventory.filter((item) => {
        const itemBranchId = parseInt(item.branch_id);
        console.log(
          "📦 Item:",
          item.inventory_items?.item_name,
          "Item Branch ID:",
          itemBranchId,
          "Type:",
          typeof itemBranchId,
          "Assigned Branch ID:",
          assignedBranchId,
          "Match:",
          itemBranchId === assignedBranchId
        );
        return itemBranchId === assignedBranchId;
      });

      console.log("✅ Branch user filtered inventory:", filteredInventory);
      console.log(
        `📊 Branch ${assignedBranchId} has ${filteredInventory.length} inventory items (should be 3 if using mock data)`
      );

      // Log which branch this user is assigned to
      const assignedBranch = branches.find(
        (b) => b.branch_id === assignedBranchId
      );
      console.log(`🏢 User assigned to branch:`, assignedBranch);
      console.log(
        `📋 Showing inventory items specific to: ${assignedBranch?.branch_name} (ID: ${assignedBranchId})`
      );

      return {
        inventory: filteredInventory,
        requests: requests.filter(
          (req) =>
            parseInt(req.requesting_branch_id) === assignedBranchId ||
            parseInt(req.target_branch_id) === assignedBranchId
        ),
        alerts: alerts.filter(
          (alert) => parseInt(alert.branch_id) === assignedBranchId
        ),
      };
    }

    // For vet-owners, use the selected branch filter
    if (selectedBranch === "all" || !selectedBranch) {
      return {
        inventory: inventory,
        requests: requests,
        alerts: alerts,
      };
    }

    // Convert selectedBranch to number for comparison
    const selectedBranchId = parseInt(selectedBranch);

    // Handle case where parseInt returns NaN
    if (isNaN(selectedBranchId)) {
      return {
        inventory: inventory,
        requests: requests,
        alerts: alerts,
      };
    }

    const filteredInventory = inventory.filter((item) => {
      console.log(
        "Filtering item:",
        item,
        "Selected branch:",
        selectedBranchId
      );
      console.log(
        "Item branch_id:",
        item.branch_id,
        "Type:",
        typeof item.branch_id
      );
      console.log("Item vet_owner_branches:", item.vet_owner_branches);
      return (
        item.branch_id === selectedBranchId ||
        item.vet_owner_branches?.branch_id === selectedBranchId
      );
    });

    console.log("Filtered inventory:", filteredInventory);

    return {
      inventory: filteredInventory,
      requests: requests.filter(
        (req) =>
          req.requesting_branch_id === selectedBranchId ||
          req.target_branch_id === selectedBranchId
      ),
      alerts: alerts.filter((alert) => alert.branch_id === selectedBranchId),
    };
  };

  const {
    inventory: filteredInventory,
    requests: branchFilteredRequests,
    alerts: filteredAlerts,
  } = getFilteredData();

  // Calculate stats for current view
  const currentStats = {
    totalItems: filteredInventory.length,
    lowStock: filteredInventory.filter(
      (item) => item.current_stock <= item.minimum_threshold
    ).length,
    outOfStock: filteredInventory.filter((item) => item.current_stock === 0)
      .length,
    pendingRequests: branchFilteredRequests.filter(
      (req) => req.status === "pending"
    ).length,
    activeAlerts: filteredAlerts.filter((alert) => !alert.is_acknowledged)
      .length,
  };

  // Helper function to show result modal
  const showResultInModal = (
    type,
    message,
    request = null,
    error = null,
    nextSteps = null
  ) => {
    setResultModalData({
      message,
      request,
      error,
      nextSteps,
    });
    setResultModalType(type);
    setShowResultModal(true);
  };

  // Stock Request Operations
  const handleCreateStockRequest = async (formData) => {
    try {
      const result = await createStockRequest(formData);
      if (result.success) {
        showResultInModal(
          "success",
          "Stock request created successfully!",
          result.request,
          null,
          [
            "Your request has been submitted for approval",
            "You will be notified when it is reviewed",
            "Track the status in the Requests tab",
          ]
        );
        setShowStockRequestForm(false);
      }
    } catch (error) {
      showResultInModal(
        "error",
        "Failed to create stock request",
        null,
        error.message
      );
    }
  };

  const handleApproveRequest = async (requestId, approvedQuantity) => {
    try {
      const notes = prompt("Add notes for approval (optional):");
      const result = await approveStockRequest(
        requestId,
        approvedQuantity,
        notes || ""
      );
      if (result.success) {
        const approvedRequest = stockRequests.find((r) => r.id === requestId);
        showResultInModal(
          "success",
          "Stock request approved successfully!",
          result.request || approvedRequest,
          null,
          [
            "The request has been approved",
            "Stock will be prepared for transfer",
            "You can fulfill the request from the Requests tab",
          ]
        );
      }
    } catch (error) {
      showResultInModal(
        "error",
        "Failed to approve stock request",
        null,
        error.message
      );
    }
  };

  const handleApprovalSubmit = async (formData) => {
    try {
      console.log("✅ Approval submitted:", formData);

      if (!requestToApprove || !requestToApprove.id) {
        showResultInModal(
          "error",
          "No request selected for approval",
          null,
          "Please select a valid request to approve"
        );
        return;
      }

      const result = await approveStockRequest(
        requestToApprove.id,
        formData.approvedQuantity,
        formData.notes || ""
      );

      if (result.success) {
        showResultInModal(
          "success",
          "Stock request approved successfully!",
          result.request,
          null,
          [
            "The request has been approved",
            "Stock will be prepared for transfer",
            "You can fulfill the request from the Requests tab",
          ]
        );
        setShowApprovalModal(false);
        setRequestToApprove(null);
      }
    } catch (error) {
      console.error("✅ Approval error:", error);
      showResultInModal(
        "error",
        "Failed to approve stock request",
        requestToApprove,
        error.message
      );
      // Keep the modal open so user can try again or cancel
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      // If reason is not provided, show the rejection modal
      if (!reason) {
        const request = stockRequests.find((r) => r.id === requestId);
        if (request) {
          setRequestToReject(request);
          setShowRejectionModal(true);
        }
        return;
      }

      // If reason is provided, proceed with rejection
      const result = await rejectStockRequest(requestId, reason);
      if (result.success) {
        const rejectedRequest = stockRequests.find((r) => r.id === requestId);
        showResultInModal(
          "warning",
          "Stock request has been rejected",
          rejectedRequest,
          null,
          [
            "The requesting branch has been notified",
            "They may submit a new request if needed",
          ]
        );
      }
    } catch (error) {
      showResultInModal(
        "error",
        "Failed to reject stock request",
        null,
        error.message
      );
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      if (confirm("Are you sure you want to cancel this request?")) {
        const result = await cancelStockRequest(requestId);
        if (result.success) {
          const cancelledRequest = stockRequests.find(
            (r) => r.id === requestId
          );
          showResultInModal(
            "info",
            "Stock request has been cancelled",
            cancelledRequest,
            null,
            [
              "The request has been removed from the queue",
              "You can create a new request if still needed",
            ]
          );
        }
      }
    } catch (error) {
      showResultInModal(
        "error",
        "Failed to cancel stock request",
        null,
        error.message
      );
    }
  };

  const handleFulfillRequest = async (requestId) => {
    try {
      if (
        confirm(
          "Mark this request as fulfilled? This will update inventory levels."
        )
      ) {
        const result = await fulfillStockRequest(requestId);
        if (result.success) {
          const fulfilledRequest = stockRequests.find(
            (r) => r.id === requestId
          );
          showResultInModal(
            "success",
            "Stock request fulfilled successfully!",
            fulfilledRequest,
            null,
            [
              "Stock has been transferred to the requesting branch",
              "Inventory levels have been updated",
              "The requesting branch has been notified",
            ]
          );
        }
      }
    } catch (error) {
      showResultInModal(
        "error",
        "Failed to fulfill stock request",
        null,
        error.message
      );
    }
  };

  const refreshData = () => {
    toast.info("Data refreshed! (Demo mode)");
  };

  const acknowledgeAlert = (alertId) => {
    toast.info("Alert acknowledged! (Demo mode)");
  };

  // CRUD Operations
  const handleCreateItem = async (formData) => {
    try {
      // For sub-branch users, always use their assigned branch
      const effectiveBranchId = !userRole.includes("vet-owner")
        ? parseInt(branchID)
        : selectedBranch !== "all"
        ? parseInt(selectedBranch)
        : null;

      // Pass selected branch information to the create function
      const itemDataWithBranch = {
        ...formData,
        selectedBranchId: effectiveBranchId,
      };

      console.log("Creating item with data:", {
        userRole,
        branchID,
        selectedBranch,
        effectiveBranchId,
        selectedBranchId: itemDataWithBranch.selectedBranchId,
        branches: branches,
        formData: formData,
      });

      const result = await addInventoryItem(itemDataWithBranch);
      if (result.success) {
        toast.success("Inventory item created successfully!");
        setShowCreateForm(false);
        await loadInventoryData(); // Refresh data
      }
    } catch (error) {
      toast.error("Error creating item: " + error.message);
    }
  };

  const handleUpdateItem = async (formData) => {
    try {
      const result = await updateInventoryItem(selectedItem.id, formData);
      if (result.success) {
        toast.success("Inventory item updated successfully!");
        setShowEditForm(false);
        setSelectedItem(null);
        await loadInventoryData(); // Refresh data
      }
    } catch (error) {
      toast.error("Error updating item: " + error.message);
    }
  };

  const handleDeleteItem = async () => {
    try {
      console.log("🗑️ Delete button clicked for item:", itemToDelete);

      if (!itemToDelete || !itemToDelete.id) {
        toast.error("No item selected for deletion");
        return;
      }

      const result = await deleteInventoryItem(itemToDelete.id);
      console.log("🗑️ Delete result:", result);

      if (result.success) {
        toast.success("Inventory item deleted successfully!");
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        // Don't call loadInventoryData again since the hook already handles it
      }
    } catch (error) {
      console.error("🗑️ Delete error:", error);
      toast.error("Error deleting item: " + error.message);
      // Keep the modal open so user can try again or cancel
    }
  };

  const handleStockUpdate = async (itemId, newStock, reason) => {
    try {
      const result = await updateStock(itemId, newStock, reason, "adjustment");
      if (result.success) {
        toast.success("Stock updated successfully!");
        await loadInventoryData(); // Refresh data
      }
    } catch (error) {
      toast.error("Error updating stock: " + error.message);
    }
  };

  const handleStockUpdateSubmit = async (formData) => {
    try {
      console.log("📦 Stock update submitted:", formData);

      if (!itemToUpdateStock || !itemToUpdateStock.id) {
        toast.error("No item selected for stock update");
        return;
      }

      const result = await updateStock(
        itemToUpdateStock.id,
        formData.newStock,
        formData.reason,
        formData.transactionType || "adjustment"
      );

      if (result.success) {
        toast.success("Stock updated successfully!");
        setShowStockUpdateModal(false);
        setItemToUpdateStock(null);
        // Don't call loadInventoryData again since the hook already handles it
      }
    } catch (error) {
      console.error("📦 Stock update error:", error);
      toast.error("Error updating stock: " + error.message);
      // Keep the modal open so user can try again or cancel
    }
  };

  // if (loading || branchesLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-3 text-gray-600">
  //           Loading {loading ? "inventory" : "branch"} data...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  console.log(
    "🎯 Final filteredInventory:",
    filteredInventory,
    "Length:",
    filteredInventory.length
  );
  console.log("📊 Loading state:", loading);
  console.log("❌ Error state:", error);

  // Debug loading and data states
  if (loading) {
    console.log("⏳ Component is in loading state");
  }

  if (error) {
    console.log("❌ Component has error:", error);
  }

  if (!filteredInventory || filteredInventory.length === 0) {
    console.log("📭 No filtered inventory data available");
    console.log("🏢 Available branches:", branches);
    console.log("👤 User role:", userRole);
    console.log("🆔 Branch ID:", branchID);
    console.log("📌 Selected branch:", selectedBranch);
    console.log("🔍 Current inventory before filtering:", inventory);

    // Check if this is a branch user with no branch assignment
    if (userRole.includes("main-branch") || userRole.includes("sub-branch")) {
      if (!branchID) {
        console.log("🚫 Branch user has no branch assignment");
      } else {
        const userBranch = branches.find(
          (b) => b.branch_id === parseInt(branchID)
        );
        console.log("🎯 User's branch details:", userBranch);
        console.log(
          "🔧 Possible issue: Branch user has no inventory items for branch",
          branchID
        );
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage stock levels, track inventory, and handle stock requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Branch Selector */}
          {userRole.includes("vet-owner") ? (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name} ({branch.branch_type})
                </option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              {branchName || `Branch ${branchID}`}
            </div>
          )}

          <button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          {userRole.includes("vet-owner") && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />

              <span>Add Item</span>
            </button>
          )}

          {(selectedBranch !== "all" || !userRole.includes("vet-owner")) && (
            <button
              onClick={() => setShowStockRequestForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Request Stock</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Database Status Notice */}
      {/* {error ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-800 font-medium">Database Connection</p>
              <p className="text-yellow-700 text-sm">
                {error.includes("Database tables not yet created")
                  ? "Run the inventory SQL schema in your Supabase dashboard to enable full functionality."
                  : error
                }
              </p>
            </div>
          </div>
        </div>
      ) : inventoryItems.length > 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <div>
              <p className="text-green-800 font-medium">Database Connected</p>
              <p className="text-green-700 text-sm">
                Successfully connected to Supabase. Showing live inventory data.
              </p>
            </div>
          </div>
        </div>
      ) : null} */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.totalItems}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {currentStats.lowStock}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {currentStats.outOfStock}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Requests
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {currentStats.pendingRequests}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentStats.activeAlerts}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: Package },
            { id: "inventory", name: "Stock Items", icon: Package },
            { id: "requests", name: "Stock Requests", icon: ShoppingCart },
            { id: "alerts", name: "Alerts", icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            inventory={filteredInventory}
            requests={branchFilteredRequests}
            alerts={filteredAlerts}
            currentBranch={currentBranch}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            inventory={inventory}
            loading={loading}
            selectedBranch={selectedBranch}
            filters={inventoryFilters}
            searchTerm={inventorySearchTerm}
            filterOptions={inventoryFilterOptions}
            updateFilter={updateInventoryFilter}
            clearFilters={clearInventoryFilters}
            setSearchTerm={setInventorySearchTerm}
            onRequestStock={() => setShowStockRequestForm(true)}
            onEditItem={(item) => {
              setSelectedItem(item);
              setShowEditForm(true);
            }}
            onDeleteItem={(item) => {
              setItemToDelete(item);
              setShowDeleteConfirm(true);
            }}
            onUpdateStock={handleStockUpdate}
            onUpdateStockModal={(item) => {
              setItemToUpdateStock(item);
              setShowStockUpdateModal(true);
            }}
          />
        )}

        {activeTab === "requests" && (
          <StockRequestsTab
            requests={stockRequests}
            loading={requestsLoading}
            userRole={userRole}
            onApprove={handleApproveRequest}
            onApproveModal={(request) => {
              setRequestToApprove(request);
              setShowApprovalModal(true);
            }}
            onReject={handleRejectRequest}
            onCancel={handleCancelRequest}
            onFulfill={handleFulfillRequest}
            onView={(request) => {
              setViewModalRequest(request);
              setShowViewModal(true);
            }}
            user={user}
            filters={filters}
            searchTerm={searchTerm}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsTab alerts={filteredAlerts} onAcknowledge={acknowledgeAlert} />
        )}
      </div>

      {/* Stock Request Form Modal */}
      {showStockRequestForm && (
        <StockRequestForm
          inventory={inventory}
          onSubmit={handleCreateStockRequest}
          onCancel={() => setShowStockRequestForm(false)}
        />
      )}

      {/* Create/Edit Inventory Item Form */}
      {(showCreateForm || showEditForm) && (
        <InventoryItemForm
          item={showEditForm ? selectedItem : null}
          onSubmit={showEditForm ? handleUpdateItem : handleCreateItem}
          onCancel={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          item={itemToDelete}
          onConfirm={handleDeleteItem}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }}
        />
      )}

      {/* Stock Update Modal */}
      {showStockUpdateModal && (
        <StockUpdateModal
          item={itemToUpdateStock}
          onSubmit={handleStockUpdateSubmit}
          onCancel={() => {
            setShowStockUpdateModal(false);
            setItemToUpdateStock(null);
          }}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          request={requestToApprove}
          onSubmit={handleApprovalSubmit}
          onCancel={() => {
            setShowApprovalModal(false);
            setRequestToApprove(null);
          }}
        />
      )}

      {/* Stock Request Result Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <StockRequestResultModal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            setResultModalData(null);
          }}
          result={resultModalData}
          type={resultModalType}
        />
      </Suspense>

      {/* Stock Request View Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <StockRequestResultModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewModalRequest(null);
          }}
          result={{
            message: "Stock Request Details",
            request: viewModalRequest,
          }}
          type="info"
        />
      </Suspense>

      {/* Stock Request Rejection Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <StockRequestRejectionModal
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setRequestToReject(null);
          }}
          onSubmit={handleRejectRequest}
          request={requestToReject}
        />
      </Suspense>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ inventory, requests, alerts, currentBranch }) => {
  const lowStockItems = inventory.filter(
    (item) => item.current_stock <= item.minimum_threshold
  );
  const recentRequests = requests.slice(0, 5);
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Low Stock Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Low Stock Items
          </h3>
          <TrendingDown className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-3">
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No low stock items</p>
          ) : (
            lowStockItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.inventory_items?.item_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current: {item.current_stock} | Min:{" "}
                    {item.minimum_threshold}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {item.current_stock === 0 ? "Out of Stock" : "Low Stock"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Stock Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Requests
          </h3>
          <ShoppingCart className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-3">
          {recentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent requests</p>
          ) : (
            recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {request.inventory_items?.item_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Qty: {request.requested_quantity} |{" "}
                    {request.requesting_branch?.branch_name}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({
  inventory,
  loading,
  selectedBranch,
  filters,
  searchTerm,
  filterOptions,
  updateFilter,
  clearFilters,
  setSearchTerm,
  onRequestStock,
  onEditItem,
  onDeleteItem,
  onUpdateStock,
  onUpdateStockModal,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters only when showFilters is true
  const getFilteredInventory = () => {
    if (!showFilters) {
      return inventory; // Return all items when filters are hidden
    }

    let filtered = [...inventory];

    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.item_name?.toLowerCase().includes(search) ||
          item.item_code?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search)
      );
    }

    // Apply other filters
    if (filters.itemType?.length > 0) {
      filtered = filtered.filter((item) =>
        filters.itemType.includes(item.item_type)
      );
    }

    if (filters.category?.length > 0) {
      filtered = filtered.filter((item) =>
        filters.category.includes(item.category)
      );
    }

    if (filters.status?.length > 0) {
      filtered = filtered.filter((item) =>
        filters.status.includes(item.status)
      );
    }

    if (filters.stockLevel) {
      switch (filters.stockLevel) {
        case "low_stock":
          filtered = filtered.filter(
            (item) =>
              item.current_stock <=
              (item.reorder_point || item.minimum_threshold || 0)
          );
          break;
        case "out_of_stock":
          filtered = filtered.filter((item) => item.current_stock === 0);
          break;
        case "in_stock":
          filtered = filtered.filter(
            (item) =>
              item.current_stock >
              (item.reorder_point || item.minimum_threshold || 0)
          );
          break;
      }
    }

    if (filters.brand) {
      filtered = filtered.filter((item) => item.brand === filters.brand);
    }

    return filtered;
  };

  const displayInventory = getFilteredInventory();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Stock Items ({loading ? "..." : displayInventory.length})
          </h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
            {showFilters && (
              <button
                onClick={clearFilters}
                disabled={loading}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Filters
              </button>
            )}
            {selectedBranch !== "all" && (
              <button
                onClick={onRequestStock}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Request Stock</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by item name, code, description..."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Item Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Type
              </label>
              <select
                value={filters.itemType?.[0] || ""}
                onChange={(e) =>
                  updateFilter(
                    "itemType",
                    e.target.value ? [e.target.value] : []
                  )
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Types</option>
                {filterOptions.itemTypes?.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Level
              </label>
              <select
                value={filters.stockLevel || ""}
                onChange={(e) => updateFilter("stockLevel", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Stock Levels</option>
                {filterOptions.stockLevels?.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category?.[0] || ""}
                onChange={(e) =>
                  updateFilter(
                    "category",
                    e.target.value ? [e.target.value] : []
                  )
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Categories</option>
                {filterOptions.categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={filters.brand || ""}
                onChange={(e) => updateFilter("brand", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Brands</option>
                {filterOptions.brands?.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status?.[0] || ""}
                onChange={(e) =>
                  updateFilter("status", e.target.value ? [e.target.value] : [])
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Status</option>
                {filterOptions.statuses?.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              <strong>Showing:</strong>{" "}
              {loading ? "..." : displayInventory.length} items
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading inventory items...</p>
                  </div>
                </td>
              </tr>
            ) : displayInventory.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No inventory items found
                </td>
              </tr>
            ) : (
              displayInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {getItemIcon(item.inventory_items?.item_type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.inventory_items?.item_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.inventory_items?.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.inventory_items?.item_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.current_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.minimum_threshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StockStatusBadge
                      currentStock={item.current_stock}
                      minThreshold={item.minimum_threshold}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.vet_owner_branches?.branch_name} (
                    {item.vet_owner_branches?.branch_type})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditItem(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateStockModal(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Update Stock"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stock Requests Tab Component
const StockRequestsTab = ({
  requests,
  loading,
  userRole,
  onApprove,
  onApproveModal,
  onReject,
  onCancel,
  onFulfill,
  onView,
  user,
  filters,
  searchTerm,
  filterOptions,
  updateFilter,
  clearFilters,
  setSearchTerm,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters only when showFilters is true
  const getFilteredRequests = () => {
    if (!showFilters) {
      return requests; // Return all requests when filters are hidden
    }

    let filtered = [...requests];

    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id?.toLowerCase().includes(search) ||
          request.inventory_items?.item_name?.toLowerCase().includes(search) ||
          request.requesting_branch?.branch_name
            ?.toLowerCase()
            .includes(search) ||
          request.target_branch?.branch_name?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (filters.status?.length > 0) {
      filtered = filtered.filter((request) =>
        filters.status.includes(request.status)
      );
    }

    // Apply branch filter
    if (filters.branch?.length > 0) {
      filtered = filtered.filter(
        (request) =>
          filters.branch.includes(request.requesting_branch_id) ||
          filters.branch.includes(request.target_branch_id)
      );
    }

    // Apply priority filter
    if (filters.priority?.length > 0) {
      filtered = filtered.filter((request) =>
        filters.priority.includes(request.priority)
      );
    }

    return filtered;
  };

  const displayRequests = getFilteredRequests();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Stock Requests ({loading ? "..." : displayRequests.length})
          </h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
            {showFilters && (
              <button
                onClick={clearFilters}
                disabled={loading}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by request #, item, requester..."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Status</option>
                {filterOptions.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.urgency}
                onChange={(e) => updateFilter("urgency", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Priorities</option>
                {filterOptions.urgencies.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Requester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requester
              </label>
              <select
                value={filters.requester}
                onChange={(e) => updateFilter("requester", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Requesters</option>
                {filterOptions.requesters.map((requester) => (
                  <option
                    key={requester.id + Math.random()}
                    value={requester.id}
                  >
                    {requester.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                value={filters.branch}
                onChange={(e) => updateFilter("branch", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Branches</option>
                {filterOptions.branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <strong>Showing:</strong>{" "}
                {loading ? "..." : displayRequests.length} requests
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested/Approved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From/To Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading stock requests...</p>
                  </div>
                </td>
              </tr>
            ) : displayRequests.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No stock requests found
                </td>
              </tr>
            ) : (
              displayRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.request_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.inventory_items?.item_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.inventory_items?.item_type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Requested: {request.requested_quantity}</div>
                      {request.approved_quantity > 0 && (
                        <div className="text-green-600">
                          Approved: {request.approved_quantity}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>From: {request.requesting_branch?.branch_name}</div>
                      <div className="text-gray-500">
                        To: {request.target_branch?.branch_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {request.requester_name ||
                          request.requested_by_name ||
                          (request.requested_by
                            ? `User ${request.requested_by.slice(0, 8)}...`
                            : "System Request")}
                      </div>
                      {request.requester_email && (
                        <div className="text-xs text-gray-500">
                          {request.requester_email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UrgencyBadge urgency={request.urgency_level} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>
                        {new Date(request.requested_at).toLocaleDateString()}
                      </div>
                      {request.reviewed_at && (
                        <div className="text-xs">
                          Reviewed:{" "}
                          {new Date(request.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Approve/Reject for pending requests (vet-owner only) */}
                      {request.status === "pending" &&
                        userRole === "vet-owner" && (
                          <>
                            <button
                              onClick={() => onApproveModal(request)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve Request"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(request.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Reject Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                      {/* Cancel for pending requests (requester only) */}
                      {request.status === "pending" &&
                        request.requested_by === user?.id && (
                          <button
                            onClick={() => onCancel(request.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="Cancel Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                      {/* Fulfill for approved requests (vet-owner only) */}
                      {request.status === "approved" &&
                        userRole === "vet-owner" && (
                          <button
                            onClick={() => onFulfill(request.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Mark as Fulfilled"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}

                      {/* View details */}
                      <button
                        onClick={() => onView(request)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ alerts, onAcknowledge }) => {
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No active alerts</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${
                    alert.alert_level === "critical"
                      ? "bg-red-100"
                      : alert.alert_level === "warning"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.alert_level === "critical"
                        ? "text-red-600"
                        : alert.alert_level === "warning"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {alert.alert_type === "low_stock"
                      ? "Low Stock Alert"
                      : alert.alert_type === "out_of_stock"
                      ? "Out of Stock Alert"
                      : alert.alert_type === "expiring_soon"
                      ? "Expiring Soon Alert"
                      : "Expired Item Alert"}
                  </h4>
                  <p className="text-gray-600">{alert.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {!alert.is_acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Stock Request Form Component
const StockRequestForm = ({ inventory, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    inventory_item_id: "",
    requested_quantity: "",
    reason: "",
    urgency_level: "normal",
  });

  // Debug: Check what inventory data we're receiving
  console.log("StockRequestForm inventory data:", inventory);

  const selectedItem = inventory.find(
    (item) => item.id === formData.inventory_item_id
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.inventory_item_id || !formData.requested_quantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (parseInt(formData.requested_quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Stock Request
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item *
            </label>
            <select
              value={formData.inventory_item_id}
              onChange={(e) =>
                setFormData({ ...formData, inventory_item_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select an item</option>
              {inventory && inventory.length > 0 ? (
                displayInventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.inventory_items?.item_name || item.item_name} -
                    Current: {item.current_stock || 0}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No inventory items available
                </option>
              )}
            </select>
          </div>

          {selectedItem && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p>
                <strong>Current Stock:</strong> {selectedItem.current_stock}{" "}
                {selectedItem.inventory_items?.unit_of_measure ||
                  selectedItem.unit_of_measure}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {selectedItem.inventory_items?.item_type ||
                  selectedItem.item_type}
              </p>
              {selectedItem.minimum_threshold && (
                <p>
                  <strong>Minimum Level:</strong>{" "}
                  {selectedItem.minimum_threshold}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.requested_quantity}
              onChange={(e) =>
                setFormData({ ...formData, requested_quantity: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                selectedItem
                  ? `Units: ${
                      selectedItem.inventory_items?.unit_of_measure ||
                      selectedItem.unit_of_measure
                    }`
                  : "Enter quantity"
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level
            </label>
            <select
              value={formData.urgency_level}
              onChange={(e) =>
                setFormData({ ...formData, urgency_level: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low - Can wait a week</option>
              <option value="normal">Normal - Needed within 3 days</option>
              <option value="high">High - Needed within 24 hours</option>
              <option value="urgent">Urgent - Needed immediately</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Request
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why this stock is needed (e.g., running low, unexpected demand, upcoming procedures...)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "yellow", text: "Pending" },
    approved: { color: "green", text: "Approved" },
    rejected: { color: "red", text: "Rejected" },
    fulfilled: { color: "blue", text: "Fulfilled" },
    cancelled: { color: "gray", text: "Cancelled" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
    >
      {config.text}
    </span>
  );
};

const UrgencyBadge = ({ urgency }) => {
  const urgencyConfig = {
    low: { color: "gray", text: "Low" },
    normal: { color: "blue", text: "Normal" },
    high: { color: "orange", text: "High" },
    urgent: { color: "red", text: "Urgent" },
  };

  const config = urgencyConfig[urgency] || urgencyConfig.normal;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
    >
      {config.text}
    </span>
  );
};

const StockStatusBadge = ({ currentStock, minThreshold }) => {
  if (currentStock === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Out of Stock
      </span>
    );
  } else if (currentStock <= minThreshold) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Low Stock
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        In Stock
      </span>
    );
  }
};

const getItemIcon = (itemType) => {
  switch (itemType) {
    case "vaccine":
      return <Syringe className="w-6 h-6 text-blue-600" />;
    case "medication":
      return <Pill className="w-6 h-6 text-green-600" />;
    case "equipment":
      return <Stethoscope className="w-6 h-6 text-purple-600" />;
    default:
      return <Package className="w-6 h-6 text-gray-600" />;
  }
};

// Inventory Item Form Component
const InventoryItemForm = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    item_name: item?.item_name || item?.inventory_items?.item_name || "",
    item_type:
      item?.item_type || item?.inventory_items?.item_type || "medication",
    description: item?.description || item?.inventory_items?.description || "",
    unit_of_measure: item?.unit_of_measure || "pieces",
    minimum_stock_level:
      item?.minimum_stock_level || item?.minimum_threshold || 10,
    unit_cost: item?.unit_cost || 0,
    initial_stock: item?.current_stock || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item_name.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? "Edit Inventory Item" : "Add New Inventory Item"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.item_type}
              onChange={(e) =>
                setFormData({ ...formData, item_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="medication">Medication</option>
              <option value="vaccine">Vaccine</option>
              <option value="supplies">Supplies</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) =>
                  setFormData({ ...formData, unit_of_measure: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pieces">Pieces</option>
                <option value="vials">Vials</option>
                <option value="tablets">Tablets</option>
                <option value="bottles">Bottles</option>
                <option value="boxes">Boxes</option>
                <option value="rolls">Rolls</option>
                <option value="ml">ML</option>
                <option value="mg">MG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimum_stock_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_stock_level: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_cost: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!item && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.initial_stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initial_stock: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {item ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ item, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Delete Inventory Item
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this item?
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">
              {item?.item_name ||
                item?.inventory_items?.item_name ||
                item?.name ||
                "Unknown Item"}
            </p>
            <p className="text-sm text-gray-600">
              Type:{" "}
              {item?.item_type || item?.inventory_items?.item_type || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              Current Stock: {item?.current_stock || 0}
            </p>
            {item?.id && (
              <p className="text-xs text-gray-500 mt-1">ID: {item.id}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Delete Item
          </button>
        </div>
      </div>
    </div>
  );
};

// Stock Update Modal Component
const StockUpdateModal = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    newStock: item?.current_stock || 0,
    transactionType: "adjustment",
    reason: "",
    changeAmount: 0,
    operationType: "set", // 'set', 'add', 'subtract'
  });

  const [calculatedStock, setCalculatedStock] = useState(
    item?.current_stock || 0
  );

  // Update calculated stock when operation changes
  useEffect(() => {
    const currentStock = item?.current_stock || 0;
    const changeAmount = parseInt(formData.changeAmount) || 0;

    switch (formData.operationType) {
      case "add":
        setCalculatedStock(currentStock + changeAmount);
        setFormData((prev) => ({
          ...prev,
          newStock: currentStock + changeAmount,
        }));
        break;
      case "subtract":
        const newStock = Math.max(0, currentStock - changeAmount); // Prevent negative stock
        setCalculatedStock(newStock);
        setFormData((prev) => ({ ...prev, newStock: newStock }));
        break;
      case "set":
      default:
        setCalculatedStock(parseInt(formData.newStock) || 0);
        break;
    }
  }, [
    formData.operationType,
    formData.changeAmount,
    formData.newStock,
    item?.current_stock,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for the stock update");
      return;
    }

    if (calculatedStock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    onSubmit({
      newStock: calculatedStock,
      reason: formData.reason,
      transactionType: formData.transactionType,
      operationType: formData.operationType,
      changeAmount: formData.changeAmount,
    });
  };

  const getTransactionTypeIcon = () => {
    switch (formData.transactionType) {
      case "purchase":
        return "📦";
      case "used":
        return "📤";
      case "expired":
        return "⏰";
      case "damaged":
        return "⚠️";
      case "adjustment":
        return "⚖️";
      default:
        return "📊";
    }
  };

  const getStockDifference = () => {
    const current = item?.current_stock || 0;
    const difference = calculatedStock - current;
    if (difference > 0) {
      return {
        text: `+${difference}`,
        color: "text-green-600",
        sign: "positive",
      };
    } else if (difference < 0) {
      return { text: `${difference}`, color: "text-red-600", sign: "negative" };
    } else {
      return { text: "0", color: "text-gray-600", sign: "neutral" };
    }
  };

  const stockDiff = getStockDifference();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Stock -{" "}
            {item?.item_name || item?.inventory_items?.item_name || item?.name}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Item Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Current Stock</p>
              <p className="font-semibold text-gray-900">
                {item?.current_stock || 0} {item?.unit_of_measure || "units"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Item Type</p>
              <p className="font-semibold text-gray-900">
                {item?.item_type || item?.inventory_items?.item_type || "N/A"}
              </p>
            </div>
            {item?.minimum_threshold && (
              <div>
                <p className="text-gray-600">Min Threshold</p>
                <p className="font-semibold text-gray-900">
                  {item.minimum_threshold}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Branch</p>
              <p className="font-semibold text-gray-900">
                {item?.vet_owner_branches?.branch_name || "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    operationType: "set",
                    changeAmount: 0,
                  }))
                }
                className={`px-3 py-2 text-sm rounded-lg border ${
                  formData.operationType === "set"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Set to
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    operationType: "add",
                    changeAmount: 0,
                  }))
                }
                className={`px-3 py-2 text-sm rounded-lg border ${
                  formData.operationType === "add"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    operationType: "subtract",
                    changeAmount: 0,
                  }))
                }
                className={`px-3 py-2 text-sm rounded-lg border ${
                  formData.operationType === "subtract"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Subtract
              </button>
            </div>
          </div>

          {/* Stock Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.operationType === "set"
                ? "New Stock Amount"
                : `Amount to ${
                    formData.operationType === "add" ? "Add" : "Subtract"
                  }`}
            </label>
            {formData.operationType === "set" ? (
              <input
                type="number"
                min="0"
                value={formData.newStock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newStock: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new stock amount"
                required
              />
            ) : (
              <input
                type="number"
                min="1"
                value={formData.changeAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    changeAmount: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter amount to ${formData.operationType}`}
                required
              />
            )}
          </div>

          {/* Stock Preview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Stock Preview
                </p>
                <p className="text-xs text-blue-700">
                  {item?.current_stock || 0} → {calculatedStock}{" "}
                  {item?.unit_of_measure || "units"}
                </p>
              </div>
              <div className={`text-right ${stockDiff.color}`}>
                <p className="font-semibold">{stockDiff.text}</p>
                <p className="text-xs">
                  {stockDiff.sign === "positive"
                    ? "Increase"
                    : stockDiff.sign === "negative"
                    ? "Decrease"
                    : "No change"}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={formData.transactionType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transactionType: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="adjustment">
                {getTransactionTypeIcon()} Manual Adjustment
              </option>
              <option value="purchase">📦 Purchase/Restock</option>
              <option value="used">📤 Used in Treatment</option>
              <option value="expired">⏰ Expired Items</option>
              <option value="damaged">⚠️ Damaged/Lost Items</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Update *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you're updating the stock (e.g., received new shipment, used for treatments, expired items removed, etc.)"
              required
            />
          </div>

          {/* Warnings */}
          {calculatedStock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">
                  This will set the stock to zero (out of stock).
                </p>
              </div>
            </div>
          )}

          {item?.minimum_threshold &&
            calculatedStock <= item.minimum_threshold &&
            calculatedStock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                  <p className="text-sm text-orange-800">
                    Stock will be below minimum threshold (
                    {item.minimum_threshold}).
                  </p>
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Approval Modal Component
const ApprovalModal = ({ request, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    approvedQuantity: request?.requested_quantity || 0,
    notes: "",
    priority: "normal",
    partialApproval: false,
  });

  // Check if this is a partial approval
  const isPartialApproval =
    formData.approvedQuantity < (request?.requested_quantity || 0);
  const approvalPercentage = request?.requested_quantity
    ? Math.round((formData.approvedQuantity / request.requested_quantity) * 100)
    : 100;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.approvedQuantity <= 0) {
      toast.error("Approved quantity must be greater than 0");
      return;
    }

    if (formData.approvedQuantity > (request?.requested_quantity || 0)) {
      toast.error("Approved quantity cannot exceed requested quantity");
      return;
    }

    if (isPartialApproval && !formData.notes.trim()) {
      toast.error("Please provide notes explaining the partial approval");
      return;
    }

    onSubmit({
      approvedQuantity: formData.approvedQuantity,
      notes: formData.notes,
      priority: formData.priority,
      isPartialApproval,
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "normal":
        return "text-blue-600 bg-blue-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Approve Stock Request
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Request Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">
                  {request?.inventory_items?.item_name || "Unknown Item"}
                </p>
                <p className="text-gray-600">
                  Request #{request?.request_number || request?.id}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                  request?.urgency_level
                )}`}
              >
                {request?.urgency_level || "Normal"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Requested Quantity</p>
                <p className="font-semibold text-gray-900">
                  {request?.requested_quantity}{" "}
                  {request?.inventory_items?.unit_of_measure || "units"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Requesting Branch</p>
                <p className="font-semibold text-gray-900">
                  {request?.requesting_branch?.branch_name || "Unknown Branch"}
                </p>
              </div>
            </div>

            {request?.reason && (
              <div>
                <p className="text-gray-600">Reason</p>
                <p className="text-gray-900">{request.reason}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Approved Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approved Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={request?.requested_quantity || 999999}
              value={formData.approvedQuantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  approvedQuantity: Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    request?.requested_quantity || 999999
                  ),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
              <span>
                Max: {request?.requested_quantity}{" "}
                {request?.inventory_items?.unit_of_measure || "units"}
              </span>
              <span
                className={`font-medium ${
                  isPartialApproval ? "text-orange-600" : "text-green-600"
                }`}
              >
                {approvalPercentage}% of request
              </span>
            </div>
          </div>

          {/* Approval Status */}
          {isPartialApproval && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Partial Approval
                  </p>
                  <p className="text-xs text-orange-700">
                    You're approving {formData.approvedQuantity} of{" "}
                    {request?.requested_quantity} requested units
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="low">🟢 Low - Process when convenient</option>
              <option value="normal">🔵 Normal - Standard processing</option>
              <option value="high">🟡 High - Priority processing</option>
              <option value="urgent">
                🔴 Urgent - Immediate attention required
              </option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Notes{" "}
              {isPartialApproval && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder={
                isPartialApproval
                  ? "Please explain why you're partially approving this request (e.g., limited stock available, budget constraints, etc.)"
                  : "Add any notes about this approval (optional)"
              }
              required={isPartialApproval}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isPartialApproval
                ? "Required: Explanation needed for partial approvals"
                : "Optional: Any additional information about this approval"}
            </p>
          </div>

          {/* Approval Summary */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Approval Summary
                </p>
                <p className="text-xs text-green-700">
                  {formData.approvedQuantity} of {request?.requested_quantity}{" "}
                  units
                  {isPartialApproval ? " (Partial)" : " (Full)"}
                </p>
              </div>
              <div className="text-right">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryContent;
