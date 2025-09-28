import React, { useState, useEffect } from "react";
import { X, Save, Package, Pill, Shield } from "lucide-react";

import {
  INVENTORY_ITEM_TYPES,
  DOSAGE_FORMS,
  ADMINISTRATION_ROUTES,
  UNITS_OF_MEASURE,
  STORAGE_CONDITIONS,
  MEDICINE_SUBTYPES,
  VACCINE_SUBTYPES,
  SUPPLIER_PAYMENT_TERMS,
} from "@/constants/formOptions";

const InventoryItemForm = ({
  item = null,
  suppliers = [],
  categories = [],
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    item_code: "",
    barcode: "",
    category_id: "",
    category_name: "",

    // Type and Classification
    item_type: "medicine",
    subtype: "",
    brand: "",
    manufacturer: "",

    // Medicine/Vaccine Specific
    active_ingredient: "",
    concentration: "",
    dosage_form: "",
    administration_route: "",
    prescription_required: false,
    controlled_substance: false,

    // Physical Properties
    unit_of_measure: "units",
    unit_size: "",
    package_size: 1,
    weight: "",
    volume: "",

    // Storage Requirements
    storage_requirements: "",
    temperature_min: "",
    temperature_max: "",

    // Pricing
    unit_cost: "",
    selling_price: "",

    // Stock Management
    initial_stock: 0,
    minimum_stock: 0,
    maximum_stock: 1000,
    reorder_point: 0,
    reorder_quantity: 0,

    // Supplier Info
    primary_supplier_id: "",
    supplier_item_code: "",
    lead_time_days: 7,

    // Expiration Management
    has_expiration: true,
    shelf_life_months: "",

    // Status and Flags
    active: true,
    requires_prescription: false,
    hazardous: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        item_code: item.item_code || "",
        barcode: item.barcode || "",
        category_id: item.category_id || "",
        category_name: item.category || "",
        item_type: item.item_type || "medicine",
        subtype: item.subtype || "",
        brand: item.brand || "",
        manufacturer: item.manufacturer || "",
        active_ingredient: item.active_ingredient || "",
        concentration: item.concentration || "",
        dosage_form: item.dosage_form || "",
        administration_route: item.administration_route || "",
        prescription_required: item.prescription_required || false,
        controlled_substance: item.controlled_substance || false,
        unit_of_measure: item.unit_of_measure || "units",
        unit_size: item.unit_size || "",
        package_size: item.package_size || 1,
        weight: item.weight || "",
        volume: item.volume || "",
        storage_requirements: item.storage_requirements || "",
        temperature_min: item.temperature_min || "",
        temperature_max: item.temperature_max || "",
        unit_cost: item.unit_cost || "",
        selling_price: item.selling_price || "",
        initial_stock: item.current_stock || 0,
        minimum_stock: item.minimum_stock || 0,
        maximum_stock: item.maximum_stock || 1000,
        reorder_point: item.reorder_point || 0,
        reorder_quantity: item.reorder_quantity || 0,
        primary_supplier_id: item.primary_supplier_id || "",
        supplier_item_code: item.supplier_item_code || "",
        lead_time_days: item.lead_time_days || 7,
        has_expiration: item.has_expiration ?? true,
        shelf_life_months: item.shelf_life_months || "",
        active: item.active ?? true,
        requires_prescription: item.requires_prescription || false,
        hazardous: item.hazardous || false,
      });
    }
  }, [isEdit, item]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.item_code.trim())
      newErrors.item_code = "Item code is required";
    if (!formData.unit_of_measure)
      newErrors.unit_of_measure = "Unit of measure is required";
    if (!formData.unit_cost || formData.unit_cost <= 0)
      newErrors.unit_cost = "Valid unit cost is required";

    // Stock validation
    if (formData.minimum_stock < 0)
      newErrors.minimum_stock = "Minimum stock cannot be negative";
    if (formData.maximum_stock <= formData.minimum_stock)
      newErrors.maximum_stock =
        "Maximum stock must be greater than minimum stock";
    if (formData.reorder_point < 0)
      newErrors.reorder_point = "Reorder point cannot be negative";
    if (formData.reorder_quantity <= 0)
      newErrors.reorder_quantity = "Reorder quantity must be greater than 0";

    // Medicine specific validation
    if (
      formData.item_type === "medicine" &&
      !formData.active_ingredient.trim()
    ) {
      newErrors.active_ingredient =
        "Active ingredient is required for medicines";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        unit_cost: parseFloat(formData.unit_cost),
        selling_price: parseFloat(formData.selling_price) || null,
        unit_size: parseFloat(formData.unit_size) || null,
        package_size: parseInt(formData.package_size) || 1,
        weight: parseFloat(formData.weight) || null,
        volume: parseFloat(formData.volume) || null,
        temperature_min: parseFloat(formData.temperature_min) || null,
        temperature_max: parseFloat(formData.temperature_max) || null,
        initial_stock: parseInt(formData.initial_stock) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0,
        maximum_stock: parseInt(formData.maximum_stock) || 1000,
        reorder_point: parseInt(formData.reorder_point) || 0,
        reorder_quantity: parseInt(formData.reorder_quantity) || 0,
        lead_time_days: parseInt(formData.lead_time_days) || 7,
        shelf_life_months: parseInt(formData.shelf_life_months) || null,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubtypeOptions = () => {
    switch (formData.item_type) {
      case "medicine":
        return MEDICINE_SUBTYPES;
      case "vaccine":
        return VACCINE_SUBTYPES;
      default:
        return [];
    }
  };

  const showMedicineFields =
    formData.item_type === "medicine" || formData.item_type === "vaccine";

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <Package size={24} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {isEdit ? "Edit Inventory Item" : "Add New Inventory Item"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEdit
                    ? `Update ${item?.name}`
                    : "Create a new inventory item"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter item name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Code *
                </label>
                <input
                  type="text"
                  value={formData.item_code}
                  onChange={(e) =>
                    handleInputChange("item_code", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.item_code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., MED-001"
                />
                {errors.item_code && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.item_code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Type *
                </label>
                <select
                  value={formData.item_type}
                  onChange={(e) =>
                    handleInputChange("item_type", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {INVENTORY_ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtype
                </label>
                <select
                  value={formData.subtype}
                  onChange={(e) => handleInputChange("subtype", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select subtype</option>
                  {getSubtypeOptions().map((subtype) => (
                    <option key={subtype.value} value={subtype.value}>
                      {subtype.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    handleInputChange("manufacturer", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Manufacturer name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Item description and notes"
              />
            </div>
          </div>

          {/* Medicine/Vaccine Specific Fields */}
          {showMedicineFields && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                {formData.item_type === "medicine" ? (
                  <Pill className="text-blue-600" size={24} />
                ) : (
                  <Shield className="text-green-600" size={24} />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.item_type === "medicine" ? "Medicine" : "Vaccine"}{" "}
                  Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Active Ingredient{" "}
                    {formData.item_type === "medicine" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    value={formData.active_ingredient}
                    onChange={(e) =>
                      handleInputChange("active_ingredient", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.active_ingredient
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., Amoxicillin"
                  />
                  {errors.active_ingredient && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.active_ingredient}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Concentration
                  </label>
                  <input
                    type="text"
                    value={formData.concentration}
                    onChange={(e) =>
                      handleInputChange("concentration", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 250mg, 1.5mg/ml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dosage Form
                  </label>
                  <select
                    value={formData.dosage_form}
                    onChange={(e) =>
                      handleInputChange("dosage_form", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select form</option>
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form.value} value={form.value}>
                        {form.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Administration Route
                  </label>
                  <select
                    value={formData.administration_route}
                    onChange={(e) =>
                      handleInputChange("administration_route", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select route</option>
                    {ADMINISTRATION_ROUTES.map((route) => (
                      <option key={route.value} value={route.value}>
                        {route.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.prescription_required}
                    onChange={(e) =>
                      handleInputChange(
                        "prescription_required",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Prescription Required
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.controlled_substance}
                    onChange={(e) =>
                      handleInputChange(
                        "controlled_substance",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Controlled Substance
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hazardous}
                    onChange={(e) =>
                      handleInputChange("hazardous", e.target.checked)
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hazardous</span>
                </label>
              </div>
            </div>
          )}

          {/* Physical Properties & Pricing */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              Physical Properties & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit of Measure *
                </label>
                <select
                  value={formData.unit_of_measure}
                  onChange={(e) =>
                    handleInputChange("unit_of_measure", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.unit_of_measure
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  {UNITS_OF_MEASURE.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unit_of_measure && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.unit_of_measure}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Cost *
                </label>
                <input
                  type="number"
                  value={formData.unit_cost}
                  onChange={(e) =>
                    handleInputChange("unit_cost", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.unit_cost ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.unit_cost && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.unit_cost}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) =>
                    handleInputChange("selling_price", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              Stock Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={formData.initial_stock}
                  onChange={(e) =>
                    handleInputChange("initial_stock", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) =>
                    handleInputChange("minimum_stock", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.minimum_stock ? "border-red-300" : "border-gray-300"
                  }`}
                  min="0"
                />
                {errors.minimum_stock && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.minimum_stock}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Stock
                </label>
                <input
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) =>
                    handleInputChange("maximum_stock", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.maximum_stock ? "border-red-300" : "border-gray-300"
                  }`}
                  min="1"
                />
                {errors.maximum_stock && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.maximum_stock}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reorder Point
                </label>
                <input
                  type="number"
                  value={formData.reorder_point}
                  onChange={(e) =>
                    handleInputChange("reorder_point", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.reorder_point ? "border-red-300" : "border-gray-300"
                  }`}
                  min="0"
                />
                {errors.reorder_point && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.reorder_point}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reorder Quantity
                </label>
                <input
                  type="number"
                  value={formData.reorder_quantity}
                  onChange={(e) =>
                    handleInputChange("reorder_quantity", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.reorder_quantity
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  min="1"
                />
                {errors.reorder_quantity && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.reorder_quantity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              Supplier Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Supplier
                </label>
                <select
                  value={formData.primary_supplier_id}
                  onChange={(e) =>
                    handleInputChange("primary_supplier_id", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    handleInputChange("lead_time_days", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Expiration & Storage */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              Expiration & Storage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.has_expiration}
                    onChange={(e) =>
                      handleInputChange("has_expiration", e.target.checked)
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    Item Has Expiration Date
                  </span>
                </div>

                {formData.has_expiration && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shelf Life (Months)
                    </label>
                    <input
                      type="number"
                      value={formData.shelf_life_months}
                      onChange={(e) =>
                        handleInputChange("shelf_life_months", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min="1"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Storage Requirements
                </label>
                <textarea
                  value={formData.storage_requirements}
                  onChange={(e) =>
                    handleInputChange("storage_requirements", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Refrigerate at 2-8°C, store in dry place"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20"
              }`}
            >
              <Save size={18} />
              <span>
                {loading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryItemForm;
