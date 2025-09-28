import React, { useState } from "react";
import { X, Plus, Minus, Package, AlertTriangle } from "lucide-react";
import { TRANSACTION_TYPES } from "@/constants/formOptions";

const StockUpdateModal = ({
  item,
  onUpdate,
  onCancel,
  mode = "adjustment", // 'adjustment', 'increase', 'decrease'
}) => {
  const [formData, setFormData] = useState({
    transaction_type:
      mode === "increase"
        ? "purchase"
        : mode === "decrease"
        ? "used"
        : "adjustment",
    quantity: "",
    reason: "",
    reference_number: "",
    batch_number: "",
    lot_number: "",
    expiration_date: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!formData.quantity || formData.quantity === "0") {
      newErrors.quantity = "Quantity is required and must be greater than 0";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    // Check if decrease would result in negative stock
    if (
      formData.transaction_type === "used" &&
      parseInt(formData.quantity) > item.available_stock
    ) {
      newErrors.quantity = `Cannot use more than available stock (${item.available_stock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        item_id: item.id,
        quantity: parseInt(formData.quantity),
        unit_cost: item.unit_cost,
        performed_by: "Current User", // This should come from auth context
        transaction_date: new Date().toISOString(),
      };

      await onUpdate(updateData);
    } catch (error) {
      console.error("Stock update error:", error);
      setErrors({ submit: "Failed to update stock. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getNewStockLevel = () => {
    const quantity = parseInt(formData.quantity) || 0;
    if (
      formData.transaction_type === "used" ||
      formData.transaction_type === "expired" ||
      formData.transaction_type === "damaged"
    ) {
      return item.current_stock - quantity;
    }
    return item.current_stock + quantity;
  };

  const getModalTitle = () => {
    switch (mode) {
      case "increase":
        return "Increase Stock";
      case "decrease":
        return "Decrease Stock";
      default:
        return "Adjust Stock Level";
    }
  };

  const getDefaultReasons = () => {
    switch (formData.transaction_type) {
      case "purchase":
        return [
          "Purchase order received",
          "Emergency purchase",
          "Supplier delivery",
        ];
      case "used":
        return [
          "Used in treatment",
          "Administered to patient",
          "Consumed in procedure",
        ];
      case "expired":
        return ["Item expired", "Past expiration date"];
      case "damaged":
        return ["Item damaged", "Packaging damaged", "Quality issue"];
      case "adjustment":
        return [
          "Stock count adjustment",
          "Inventory reconciliation",
          "Correction",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getModalTitle()}
                </h2>
                <p className="text-gray-600 mt-1">
                  Update stock for {item.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Stock Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.current_stock}
                </div>
                <div className="text-sm text-gray-600">Current Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {item.available_stock}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {item.reorder_point}
                </div>
                <div className="text-sm text-gray-600">Reorder Point</div>
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.transaction_type}
              onChange={(e) =>
                handleInputChange("transaction_type", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.quantity ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter quantity"
                min="1"
              />
              <div className="absolute right-3 top-3 text-sm text-gray-500">
                {item.unit_of_measure}
              </div>
            </div>
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* New Stock Level Preview */}
          {formData.quantity && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  New Stock Level:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">
                    {getNewStockLevel()} {item.unit_of_measure}
                  </span>
                  {getNewStockLevel() <= item.reorder_point && (
                    <AlertTriangle size={16} className="text-yellow-600" />
                  )}
                </div>
              </div>

              {getNewStockLevel() <= item.reorder_point && (
                <p className="text-sm text-yellow-700 mt-2">
                  ⚠️ Stock will be at or below reorder point after this
                  transaction
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason *
            </label>
            <div className="space-y-2">
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select reason</option>
                {getDefaultReasons().map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
                <option value="other">Other (specify below)</option>
              </select>

              {(formData.reason === "other" ||
                !getDefaultReasons().includes(formData.reason)) && (
                <input
                  type="text"
                  value={formData.reason === "other" ? "" : formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter custom reason"
                />
              )}
            </div>
            {errors.reason && (
              <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) =>
                handleInputChange("reference_number", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="PO number, invoice number, etc."
            />
          </div>

          {/* Batch/Lot Information for purchases */}
          {(formData.transaction_type === "purchase" ||
            formData.transaction_type === "adjustment") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) =>
                    handleInputChange("batch_number", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Batch number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lot Number
                </label>
                <input
                  type="text"
                  value={formData.lot_number}
                  onChange={(e) =>
                    handleInputChange("lot_number", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Lot number"
                />
              </div>

              {item.has_expiration && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) =>
                      handleInputChange("expiration_date", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes about this transaction"
            />
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
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
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              }`}
            >
              {mode === "increase" ? (
                <Plus size={18} />
              ) : mode === "decrease" ? (
                <Minus size={18} />
              ) : (
                <Package size={18} />
              )}
              <span>{loading ? "Updating..." : "Update Stock"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
