import React, { useState, useEffect } from "react";
import { X, Save, Building } from "lucide-react";
import useBranches from "@/hooks/useBranches";
import useAuth from "@/hooks/useAuth";

const BranchesForm = ({
  onSubmit,
  onCancel,
  branch = null,
  isEdit = false,
}) => {
  const { user } = useAuth();
  const { branches } = useBranches(user);

  // Generate next branch ID
  const generateNextBranchId = () => {
    if (branches.length === 0) return "BR001";

    const existingNumbers = branches
      .map(b => {
        const code = b.displayId || b.branch_code;
        const match = code?.match(/^BR(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = Math.max(...existingNumbers, 0);
    const nextNumber = maxNumber + 1;
    return `BR${nextNumber.toString().padStart(3, '0')}`;
  };
  const [formData, setFormData] = useState({
    branch_id: "",
    branch_name: "",
    branch_type: "sub-branch",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && branch) {
      setFormData({
        branch_id: branch.displayId || branch.branch_code || "",
        branch_name: branch.branch_name || "",
        branch_type: branch.branch_type || "sub-branch",
      });
    } else {
      // Auto-generate ID for new branches
      setFormData(prev => ({
        ...prev,
        branch_id: generateNextBranchId()
      }));
    }
  }, [isEdit, branch, branches]);

  const validateForm = () => {
    const newErrors = {};

    const branchName = String(formData.branch_name || "");

    // Branch ID is auto-generated, no validation needed

    if (!branchName.trim()) {
      newErrors.branch_name = "Branch name is required";
    } else if (branchName.length < 2) {
      newErrors.branch_name = "Branch name must be at least 2 characters";
    }

    if (!formData.branch_type) {
      newErrors.branch_type = "Branch type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit Branch" : "Add New Branch"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch ID - Hidden, auto-generated */}
          <input
            type="hidden"
            name="branch_id"
            value={formData.branch_id}
          />

          {/* Display auto-generated ID for new branches */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Branch ID:</strong> {formData.branch_id} (auto-generated)
              </p>
            </div>
          )}

          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name *
            </label>
            <input
              type="text"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              placeholder="e.g., Downtown Branch"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.branch_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.branch_name && (
              <p className="mt-1 text-sm text-red-600">{errors.branch_name}</p>
            )}
          </div>

          {/* Branch Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Type *
            </label>
            <select
              name="branch_type"
              value={formData.branch_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.branch_type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="main-branch">Main Branch</option>
              <option value="sub-branch">Sub Branch</option>
            </select>
            {errors.branch_type && (
              <p className="mt-1 text-sm text-red-600">{errors.branch_type}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Update" : "Create"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchesForm;
