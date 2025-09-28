import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock inventory data - will be replaced with Supabase calls
const mockInventoryItems = [
  {
    id: "inv-001",
    name: "Amoxicillin 250mg Tablets",
    item_code: "MED-001",
    description: "Broad-spectrum antibiotic for bacterial infections",
    item_type: "medicine",
    subtype: "antibiotic",
    brand: "VetPharm",
    active_ingredient: "Amoxicillin",
    concentration: "250mg",
    dosage_form: "tablet",
    unit_of_measure: "tablets",
    unit_cost: 0.5,
    selling_price: 1.25,
    current_stock: 475,
    reserved_stock: 25,
    available_stock: 450,
    minimum_stock: 50,
    maximum_stock: 1000,
    reorder_point: 100,
    reorder_quantity: 200,
    category: "Medicines",
    supplier: "VetMed Supply Co.",
    has_expiration: true,
    shelf_life_months: 24,
    storage_requirements: "Room temperature, dry place",
    last_updated: "2024-01-20T10:30:00Z",
    status: "active",
    branch_id: 2, // Pili branch ID
    minimum_threshold: 50,
  },
  {
    id: "inv-002",
    name: "DHPP Vaccine",
    item_code: "VAC-001",
    description:
      "Distemper, Hepatitis, Parvovirus, Parainfluenza vaccine for dogs",
    item_type: "vaccine",
    subtype: "combination",
    brand: "Merck",
    concentration: "1 dose/vial",
    dosage_form: "injection",
    unit_of_measure: "vials",
    unit_cost: 8.5,
    selling_price: 25.0,
    current_stock: 85,
    reserved_stock: 10,
    available_stock: 75,
    minimum_stock: 20,
    reorder_point: 30,
    reorder_quantity: 50,
    category: "Vaccines",
    supplier: "VetMed Supply Co.",
    has_expiration: true,
    shelf_life_months: 12,
    storage_requirements: "Refrigerated (2-8°C)",
    last_updated: "2024-01-18T14:15:00Z",
    status: "active",
    branch_id: 2, // Pili branch ID
    minimum_threshold: 20,
  },
  {
    id: "inv-003",
    name: "Surgical Gloves - Size M",
    item_code: "SUP-001",
    description: "Sterile latex surgical gloves, medium size",
    item_type: "supply",
    subtype: "protective",
    brand: "MedLine",
    unit_of_measure: "pairs",
    unit_cost: 0.25,
    selling_price: 0.75,
    current_stock: 850,
    reserved_stock: 50,
    available_stock: 800,
    minimum_stock: 100,
    reorder_point: 200,
    reorder_quantity: 500,
    category: "Surgical Supplies",
    supplier: "Medical Supply Express",
    has_expiration: false,
    storage_requirements: "Room temperature, dry place",
    last_updated: "2024-01-19T09:45:00Z",
    status: "active",
    branch_id: 2, // Pili branch ID
    minimum_threshold: 100,
  },
  {
    id: "inv-004",
    name: "Metacam 1.5mg/ml Oral Suspension",
    item_code: "MED-002",
    description: "Anti-inflammatory pain relief for dogs and cats",
    item_type: "medicine",
    subtype: "anti-inflammatory",
    brand: "Boehringer",
    active_ingredient: "Meloxicam",
    concentration: "1.5mg/ml",
    dosage_form: "liquid",
    unit_of_measure: "ml",
    unit_cost: 0.15,
    selling_price: 0.4,
    current_stock: 1800,
    reserved_stock: 200,
    available_stock: 1600,
    minimum_stock: 200,
    reorder_point: 500,
    reorder_quantity: 1000,
    category: "Medicines",
    supplier: "Animal Health Partners",
    has_expiration: true,
    shelf_life_months: 18,
    storage_requirements: "Room temperature",
    last_updated: "2024-01-17T16:20:00Z",
    status: "active",
    branch_id: 2,
    minimum_threshold: 200,
  },
  {
    id: "inv-005",
    name: "Suture Material 3-0",
    item_code: "SUP-002",
    description: "Non-absorbable suture material",
    item_type: "supply",
    subtype: "suture",
    brand: "Ethicon",
    concentration: "3-0",
    unit_of_measure: "units",
    unit_cost: 1.5,
    selling_price: 4.0,
    current_stock: 45,
    reserved_stock: 5,
    available_stock: 40,
    minimum_stock: 20,
    reorder_point: 50,
    reorder_quantity: 100,
    category: "Surgical Supplies",
    supplier: "Quality Vet Products",
    has_expiration: false,
    storage_requirements: "Room temperature, dry place",
    last_updated: "2024-01-21T11:00:00Z",
    status: "low_stock",
    branch_id: 2, // Pili branch ID
    minimum_threshold: 20,
  },
  {
    id: "inv-006",
    name: "Rabies Vaccine",
    item_code: "VAC-002",
    description: "Rabies vaccination for dogs and cats",
    item_type: "vaccine",
    subtype: "rabies",
    brand: "Fort Dodge",
    concentration: "1 dose/vial",
    dosage_form: "injection",
    unit_of_measure: "vials",
    unit_cost: 6.75,
    selling_price: 20.0,
    current_stock: 120,
    reserved_stock: 20,
    available_stock: 100,
    minimum_stock: 25,
    reorder_point: 40,
    reorder_quantity: 75,
    category: "Vaccines",
    supplier: "Animal Health Partners",
    has_expiration: true,
    shelf_life_months: 24,
    storage_requirements: "Refrigerated (2-8°C)",
    last_updated: "2024-01-16T13:30:00Z",
    status: "active",
    branch_id: 2,
    minimum_threshold: 25,
  },
];

const mockSuppliers = [
  {
    id: "sup-001",
    company_name: "VetMed Supply Co.",
    contact_person: "John Smith",
    email: "orders@vetmedsupply.com",
    phone: "(555) 123-4567",
    city: "San Francisco",
    state: "CA",
    payment_terms: "Net 30",
    rating: 5,
    active: true,
  },
  {
    id: "sup-002",
    company_name: "Animal Health Partners",
    contact_person: "Sarah Johnson",
    email: "sales@animalhealthpartners.com",
    phone: "(555) 987-6543",
    city: "Los Angeles",
    state: "CA",
    payment_terms: "Net 45",
    rating: 4,
    active: true,
  },
];

const mockTransactions = [
  {
    id: "trans-001",
    item_id: "inv-001",
    item_name: "Amoxicillin 250mg Tablets",
    transaction_type: "used",
    quantity: -25,
    unit_cost: 0.5,
    reference_type: "usage",
    reason: "Used in treatments",
    stock_before: 500,
    stock_after: 475,
    transaction_date: "2024-01-21T09:15:00Z",
    performed_by: "Dr. Smith",
  },
  {
    id: "trans-002",
    item_id: "inv-002",
    item_name: "DHPP Vaccine",
    transaction_type: "used",
    quantity: -15,
    unit_cost: 8.5,
    reference_type: "appointment",
    reason: "Vaccinations administered",
    stock_before: 100,
    stock_after: 85,
    transaction_date: "2024-01-20T14:30:00Z",
    performed_by: "Dr. Johnson",
  },
];

const mockAlerts = [
  {
    id: "alert-001",
    item_id: "inv-005",
    item_name: "Suture Material 3-0",
    alert_type: "low_stock",
    severity: "medium",
    title: "Low Stock Alert: Suture Material 3-0",
    message: "Current stock (45) is below reorder point (50)",
    current_value: 45,
    threshold_value: 50,
    status: "active",
    created_at: "2024-01-21T11:00:00Z",
  },
];

export const useInventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    itemType: [],
    category: [],
    supplier: [],
    status: [],
    stockLevel: "", // all, low_stock, out_of_stock, in_stock
    hasExpiration: null,
    requiresReorder: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, stock_level, last_updated, item_code

  // Load initial data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if tables exist first by trying simple queries
      const { data: testItems, error: testError } = await supabase
        .from("inventory_items")
        .select("id")
        .limit(1);

      if (testError) {
        console.log("Tables don't exist yet, using mock data");
        throw new Error("Database tables not yet created");
      }

      // Load inventory items with branch inventory data
      const { data: items, error: itemsError } = await supabase
        .from("inventory_items")
        .select(
          `
          *,
          branch_inventory (
            current_stock,
            reserved_stock,
            minimum_threshold,
            branch_id
          )
        `
        )
        .eq("is_active", true)
        .order("item_name");

      if (itemsError) throw itemsError;

      // Get all branches to map branch names
      const { data: branches, error: branchesError } = await supabase
        .from("vet_owner_branches")
        .select("branch_id, branch_name");

      const branchMap = {};
      if (branches) {
        branches.forEach((branch) => {
          branchMap[branch.branch_id] = branch.branch_name;
        });
      }

      // Transform data to match component expectations - create unique items with aggregated or per-branch data
      const transformedItems = [];
      items?.forEach((item) => {
        if (item.branch_inventory && item.branch_inventory.length > 0) {
          // For each branch, create a separate entry with unique ID to avoid stacking
          item.branch_inventory.forEach((branchInventory, index) => {
            transformedItems.push({
              ...item,
              id: `${item.id}-branch-${branchInventory.branch_id}`, // Create unique ID per branch
              name: item.item_name, // Map item_name to name for compatibility
              category: item.item_type || "Uncategorized",
              supplier: "Default Supplier", // Use default until relationships are set up
              current_stock: branchInventory.current_stock || 0,
              reserved_stock: branchInventory.reserved_stock || 0,
              available_stock:
                (branchInventory.current_stock || 0) -
                (branchInventory.reserved_stock || 0),
              minimum_threshold:
                branchInventory.minimum_threshold ||
                item.minimum_stock_level ||
                0,
              branch_id: branchInventory.branch_id,
              original_item_id: item.id, // Keep reference to original item
              vet_owner_branches: {
                branch_name:
                  branchMap[branchInventory.branch_id] || "Unknown Branch",
              },
              status:
                (branchInventory.current_stock || 0) === 0
                  ? "out_of_stock"
                  : (branchInventory.current_stock || 0) <=
                    (branchInventory.minimum_threshold ||
                      item.minimum_stock_level ||
                      0)
                  ? "low_stock"
                  : "active",
            });
          });
        } else {
          // Item has no branch inventory, show as 0 stock
          transformedItems.push({
            ...item,
            name: item.item_name,
            category: item.item_type || "Uncategorized",
            supplier: "Default Supplier",
            current_stock: 0,
            reserved_stock: 0,
            available_stock: 0,
            minimum_threshold: item.minimum_stock_level || 0,
            branch_id: null,
            original_item_id: item.id, // Keep reference to original item
            vet_owner_branches: { branch_name: "No Branch Assigned" },
            status: "out_of_stock",
          });
        }
      });


      // Set the transformed items
      setInventoryItems(transformedItems);

      // Load all secondary data in parallel
      const [suppliersResult, transactionsResult, alertsResult] = await Promise.allSettled([
        supabase
          .from("suppliers")
          .select("*")
          .eq("is_active", true)
          .order("company_name"),
        supabase
          .from("inventory_transactions")
          .select("*")
          .order("transaction_date", { ascending: false })
          .limit(50),
        supabase
          .from("inventory_alerts")
          .select("*")
          .eq("is_acknowledged", false)
          .order("created_at", { ascending: false })
      ]);

      // Process suppliers
      let suppliersData = [];
      if (suppliersResult.status === 'fulfilled' && !suppliersResult.value.error) {
        suppliersData = suppliersResult.value.data || [];
      }

      // Process transactions
      let transactionsData = [];
      if (transactionsResult.status === 'fulfilled' && !transactionsResult.value.error) {
        transactionsData = transactionsResult.value.data?.map((trans) => ({
          ...trans,
          item_name: items.find((item) => item.id === trans.item_id)?.name || "Unknown Item",
        })) || [];
      }

      // Process alerts
      let alertsData = [];
      if (alertsResult.status === 'fulfilled' && !alertsResult.value.error) {
        alertsData = alertsResult.value.data?.map((alert) => ({
          ...alert,
          item_name: items.find((item) => item.id === alert.item_id)?.name || "Unknown Item",
        })) || [];
      }

      setSuppliers(suppliersData);
      setTransactions(transactionsData);
      setAlerts(alertsData);
    } catch (err) {
      setError("Using mock data - " + err.message);
      console.log("Using mock data due to:", err.message);

      // Fallback to mock data in case of error - add branch info and map fields
      const mockItemsWithBranches = mockInventoryItems.map(item => ({
        ...item,
        item_name: item.name, // Map name to item_name for consistency
        vet_owner_branches: {
          branch_name: item.branch_id === 1 ? "Naga Main" :
                      item.branch_id === 2 ? "Pili" :
                      item.branch_id === 3 ? "Legazpi" : "Unknown Branch"
        }
      }));

      setInventoryItems(mockItemsWithBranches);
      setSuppliers(mockSuppliers);
      setTransactions(mockTransactions);
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = [...inventoryItems];

    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.item_code.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search) ||
          item.active_ingredient?.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filters.itemType.length > 0) {
      filtered = filtered.filter((item) =>
        filters.itemType.includes(item.item_type)
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter((item) =>
        filters.category.includes(item.category)
      );
    }

    if (filters.supplier.length > 0) {
      filtered = filtered.filter((item) =>
        filters.supplier.includes(item.supplier)
      );
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((item) =>
        filters.status.includes(item.status)
      );
    }

    if (filters.stockLevel) {
      switch (filters.stockLevel) {
        case "low_stock":
          filtered = filtered.filter(
            (item) => item.current_stock <= item.reorder_point
          );
          break;
        case "out_of_stock":
          filtered = filtered.filter((item) => item.current_stock === 0);
          break;
        case "in_stock":
          filtered = filtered.filter(
            (item) => item.current_stock > item.reorder_point
          );
          break;
      }
    }

    if (filters.hasExpiration !== null) {
      filtered = filtered.filter(
        (item) => item.has_expiration === filters.hasExpiration
      );
    }

    if (filters.requiresReorder) {
      filtered = filtered.filter(
        (item) => item.current_stock <= item.reorder_point
      );
    }

    // Sort results
    switch (sortBy) {
      case "stock_level":
        filtered.sort((a, b) => a.current_stock - b.current_stock);
        break;
      case "last_updated":
        filtered.sort(
          (a, b) => new Date(b.last_updated) - new Date(a.last_updated)
        );
        break;
      case "item_code":
        filtered.sort((a, b) => a.item_code.localeCompare(b.item_code));
        break;
      case "value":
        filtered.sort(
          (a, b) =>
            b.current_stock * b.unit_cost - a.current_stock * a.unit_cost
        );
        break;
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  };

  // Actions
  const updateStock = async (
    itemId,
    quantity,
    reason,
    transactionType = "adjustment"
  ) => {
    try {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");

      // Use original item ID if this is a composite ID
      const actualItemId = item.original_item_id || itemId;

      const stockBefore = item.current_stock;
      let newQuantity;
      let quantityChange;

      // Calculate new stock based on transaction type
      if (
        transactionType === "used" ||
        transactionType === "expired" ||
        transactionType === "damaged"
      ) {
        quantityChange = -Math.abs(quantity);
        newQuantity = stockBefore + quantityChange;
      } else if (
        transactionType === "purchase" ||
        transactionType === "adjustment"
      ) {
        quantityChange = Math.abs(quantity);
        newQuantity = stockBefore + quantityChange;
      } else {
        // Direct stock adjustment
        newQuantity = quantity;
        quantityChange = newQuantity - stockBefore;
      }

      // Ensure stock doesn't go negative
      if (newQuantity < 0) {
        throw new Error("Stock cannot be negative");
      }

      // Try to create transaction in database
      let transaction = null;
      try {
        const { data: transactionData, error: transactionError } =
          await supabase
            .from("inventory_transactions")
            .insert([
              {
                item_id: actualItemId,
                transaction_type: transactionType,
                quantity: quantityChange,
                unit_cost: item.unit_cost || 0,
                total_cost: Math.abs(quantityChange) * (item.unit_cost || 0),
                reference_type: "adjustment",
                reason,
                stock_before: stockBefore,
                stock_after: newQuantity,
                transaction_date: new Date().toISOString(),
              },
            ])
            .select()
            .single();

        if (!transactionError) {
          transaction = transactionData;
        } else {
        }
      } catch (transErr) {
      }

      // Update stock in branch_inventory table
      const { error: updateError } = await supabase
        .from("branch_inventory")
        .update({
          current_stock: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("inventory_item_id", actualItemId)
        .eq("branch_id", item.branch_id);

      if (updateError) throw updateError;

      // Update local state
      setInventoryItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                current_stock: newQuantity,
                available_stock: newQuantity - (i.reserved_stock || 0),
                last_updated: new Date().toISOString(),
                status:
                  newQuantity === 0
                    ? "out_of_stock"
                    : newQuantity <= i.reorder_point
                    ? "low_stock"
                    : "active",
              }
            : i
        )
      );

      // Add transaction to local state
      const transactionWithName = {
        ...transaction,
        item_name: item.name,
      };
      setTransactions((prev) => [transactionWithName, ...prev]);

      // Check for alerts
      checkStockAlerts(itemId, newQuantity);

      return { success: true, transaction: transactionWithName };
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error("Failed to update stock: " + error.message);
    }
  };

  const recordUsage = async (itemId, quantityUsed, context) => {
    try {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");

      if (quantityUsed > item.available_stock) {
        throw new Error("Insufficient stock available");
      }

      await updateStock(
        itemId,
        item.current_stock - quantityUsed,
        context.reason || "Used in treatment",
        "used"
      );

      return { success: true };
    } catch (error) {
      console.error("Error recording usage:", error);
      throw error;
    }
  };

  const addInventoryItem = async (itemData) => {
    try {
      // Check if table exists first
      const { data: testItems, error: testError } = await supabase
        .from("inventory_items")
        .select("id")
        .limit(1);

      if (testError) {
        throw new Error("Database tables not available. Using mock data.");
      }

      // Create the inventory item first
      const { data: newItem, error: insertError } = await supabase
        .from("inventory_items")
        .insert([
          {
            item_name: itemData.item_name,
            item_type: itemData.item_type,
            description: itemData.description,
            unit_of_measure: itemData.unit_of_measure,
            minimum_stock_level: itemData.minimum_stock_level,
            unit_cost: itemData.unit_cost,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // If we have branches and initial stock, create branch_inventory entries
      if (itemData.initial_stock && itemData.initial_stock > 0) {
        try {
          let branchId = null;


          // If a specific branch is selected, use that
          if (itemData.selectedBranchId) {
            branchId = itemData.selectedBranchId;
          } else {
            // Otherwise, get user's branches or use the first available branch
            const { data: branches, error: branchError } = await supabase
              .from("vet_owner_branches")
              .select("branch_id")
              .limit(1);

            if (!branchError && branches && branches.length > 0) {
              branchId = branches[0].branch_id;
            } else {
            }
          }

          if (branchId) {
            // Create branch inventory entry
            const { error: branchInventoryError } = await supabase
              .from("branch_inventory")
              .insert([
                {
                  branch_id: branchId,
                  inventory_item_id: newItem.id,
                  current_stock: itemData.initial_stock,
                  reserved_stock: 0,
                  minimum_threshold: itemData.minimum_stock_level,
                  maximum_threshold: itemData.minimum_stock_level * 10, // Default to 10x minimum
                  last_restocked_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]);

            if (branchInventoryError) {
            }

            // Try to create initial stock transaction if table exists
            try {
              const { error: transactionError } = await supabase
                .from("stock_transactions")
                .insert([
                  {
                    branch_id: branchId,
                    inventory_item_id: newItem.id,
                    transaction_type: "stock_in",
                    quantity: itemData.initial_stock,
                    remaining_stock: itemData.initial_stock,
                    unit_cost: itemData.unit_cost || 0,
                    total_cost:
                      itemData.initial_stock * (itemData.unit_cost || 0),
                    reference_type: "manual_adjustment",
                    notes: "Initial stock entry",
                    performed_by: "system", // Should be actual user ID
                    created_at: new Date().toISOString(),
                  },
                ]);

              if (transactionError) {
              }
            } catch (transErr) {
            }
          } else {
            console.warn(
              "No branch ID available, skipping branch_inventory creation"
            );
          }
        } catch (branchErr) {
        }
      }

      // Refresh data
      await loadInventoryData();

      return { success: true, item: newItem };
    } catch (error) {
      console.error("Error adding inventory item:", error);
      throw new Error("Failed to add inventory item: " + error.message);
    }
  };

  const updateInventoryItem = async (itemId, updates) => {
    try {
      const { data: updatedItem, error: updateError } = await supabase
        .from("inventory_items")
        .update({
          ...updates,
          last_updated: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh data to get latest state
      await loadInventoryData();

      return { success: true, item: updatedItem };
    } catch (error) {
      console.error("Error updating inventory item:", error);
      throw new Error("Failed to update inventory item: " + error.message);
    }
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      // Find the item in our local state first
      const localItem = inventoryItems.find((i) => i.id === itemId);
      const actualItemId = localItem?.original_item_id || itemId;

      // Check if tables exist first
      const { data: testItems, error: testError } = await supabase
        .from("inventory_items")
        .select("id")
        .limit(1);

      if (testError) {
        // For mock data, just remove from local state
        setInventoryItems(prev => prev.filter(item => item.id !== itemId));
        return { success: true };
      }

      // First, get the item to make sure it exists
      const { data: item, error: fetchError } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", actualItemId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching item:", fetchError);
        throw new Error(`Item not found: ${fetchError.message}`);
      }


      // Try to delete related branch inventory entries first (if they exist)
      try {
        const { error: branchInventoryError } = await supabase
          .from("branch_inventory")
          .delete()
          .eq("inventory_item_id", actualItemId);

        if (branchInventoryError) {
          // Continue with deletion anyway - this might be expected if no branch inventory exists
        }
      } catch (branchErr) {
      }

      // Try to delete related transactions (if table exists)
      try {
        const { error: transactionsError } = await supabase
          .from("inventory_transactions")
          .delete()
          .eq("item_id", itemId);

        if (transactionsError) {
        }
      } catch (transErr) {
      }

      // Try to delete related stock transactions (if table exists)
      try {
        const { error: stockTransactionsError } = await supabase
          .from("stock_transactions")
          .delete()
          .eq("inventory_item_id", actualItemId);

        if (stockTransactionsError) {
        }
      } catch (stockTransErr) {
      }

      // Now perform the actual deletion (hard delete for better UX)
      const { error: deleteError } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", actualItemId);

      if (deleteError) {
        console.error("❌ Error deleting from inventory_items:", deleteError);

        // If hard delete fails due to constraints, try soft delete as fallback
        const { error: softDeleteError } = await supabase
          .from("inventory_items")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", actualItemId);

        if (softDeleteError) {
          console.error("❌ Soft delete also failed:", softDeleteError);
          throw new Error(`Failed to delete item: ${softDeleteError.message}`);
        } else {
        }
      } else {
      }

      // Update local state immediately for better UX
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));

      // Also remove related transactions from local state
      setTransactions(prev => prev.filter(trans => trans.item_id !== actualItemId));

      // Remove related alerts from local state
      setAlerts(prev => prev.filter(alert => alert.item_id !== actualItemId));

      // Refresh data from server to ensure consistency
      setTimeout(() => {
        loadInventoryData();
      }, 100);

      return { success: true };
    } catch (error) {
      console.error("❌ Error in deleteInventoryItem:", error);

      // More specific error messages
      if (error.message.includes("foreign key")) {
        throw new Error("Cannot delete item: it has related records. Please remove all related data first.");
      } else if (error.message.includes("not found")) {
        throw new Error("Item not found or already deleted.");
      } else {
        throw new Error("Failed to delete inventory item: " + error.message);
      }
    }
  };

  const checkStockAlerts = (itemId, currentStock) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) return;

    const actualItemId = item.original_item_id || itemId;

    // Remove existing alerts for this item
    setAlerts((prev) => prev.filter((alert) => alert.item_id !== actualItemId));

    // Check for low stock
    if (currentStock <= item.reorder_point && item.reorder_point > 0) {
      const severity =
        currentStock === 0
          ? "critical"
          : currentStock <= item.reorder_point * 0.5
          ? "high"
          : "medium";

      const alert = {
        id: `alert-${Date.now()}`,
        item_id: actualItemId,
        item_name: item.name,
        alert_type: currentStock === 0 ? "out_of_stock" : "low_stock",
        severity,
        title: `${currentStock === 0 ? "Out of Stock" : "Low Stock"}: ${
          item.name
        }`,
        message: `Current stock: ${currentStock} ${item.unit_of_measure}, Reorder point: ${item.reorder_point} ${item.unit_of_measure}`,
        current_value: currentStock,
        threshold_value: item.reorder_point,
        status: "active",
        created_at: new Date().toISOString(),
      };

      setAlerts((prev) => [alert, ...prev]);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: "dismissed",
                acknowledged_at: new Date().toISOString(),
              }
            : alert
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Error dismissing alert:", error);
      throw error;
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      itemType: [],
      category: [],
      supplier: [],
      status: [],
      stockLevel: "",
      hasExpiration: null,
      requiresReorder: false,
    });
    setSearchTerm("");
  };

  // Get filter options
  const getFilterOptions = () => {
    const itemTypes = [...new Set(inventoryItems.map(item => item.item_type))].filter(Boolean).sort();
    const categories = [...new Set(inventoryItems.map(item => item.category))].filter(Boolean).sort();
    const suppliers = [...new Set(inventoryItems.map(item => item.supplier))].filter(Boolean).sort();
    const statuses = [...new Set(inventoryItems.map(item => item.status))].filter(Boolean).sort();
    const brands = [...new Set(inventoryItems.map(item => item.brand))].filter(Boolean).sort();

    return {
      itemTypes,
      categories,
      suppliers,
      statuses,
      brands,
      stockLevels: [
        { value: "low_stock", label: "Low Stock" },
        { value: "out_of_stock", label: "Out of Stock" },
        { value: "in_stock", label: "In Stock" }
      ]
    };
  };

  // Get statistics
  const getStats = () => {
    const totalItems = inventoryItems.length;
    const totalValue = inventoryItems.reduce(
      (sum, item) => sum + item.current_stock * item.unit_cost,
      0
    );
    const lowStockItems = inventoryItems.filter(
      (item) =>
        item.current_stock <= item.reorder_point && item.reorder_point > 0
    ).length;
    const outOfStockItems = inventoryItems.filter(
      (item) => item.current_stock === 0
    ).length;
    const activeAlerts = alerts.filter(
      (alert) => alert.status === "active"
    ).length;

    // Categories breakdown
    const categories = inventoryItems.reduce((acc, item) => {
      acc[item.item_type] = (acc[item.item_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      activeAlerts,
      categories,
      medicinesCount: categories.medicine || 0,
      vaccinesCount: categories.vaccine || 0,
      suppliesCount: categories.supply || 0,
      equipmentCount: categories.equipment || 0,
    };
  };

  return {
    // Data
    inventoryItems,
    suppliers,
    transactions,
    alerts,
    filteredItems: getFilteredItems(),

    // State
    loading,
    error,
    filters,
    searchTerm,
    sortBy,

    // Actions
    updateStock,
    recordUsage,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    dismissAlert,
    updateFilter,
    clearFilters,
    setSearchTerm,
    setSortBy,
    loadInventoryData,

    // Computed
    stats: getStats(),
    filterOptions: getFilterOptions(),

    // Utils
    getLowStockItems: () =>
      inventoryItems.filter(
        (item) =>
          item.current_stock <= item.reorder_point && item.reorder_point > 0
      ),
    getOutOfStockItems: () =>
      inventoryItems.filter((item) => item.current_stock === 0),
    getActiveAlerts: () => alerts.filter((alert) => alert.status === "active"),
    getRecentTransactions: (limit = 10) => transactions.slice(0, limit),
  };
};

export default useInventory;
