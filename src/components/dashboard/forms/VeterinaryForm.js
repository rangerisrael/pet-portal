import React, { useState, useEffect } from "react";
import { X, Save, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import useVeterinaryStaff from "@/hooks/useVeterinaryStaff";
import useAuth from "@/hooks/useAuth";
import useAuthUsers from "@/hooks/useAuthUsers";
import { populateUserProfiles } from "@/utils/populateUserProfiles";
import { testUsersAPI } from "@/utils/testUsersAPI";

const VeterinaryForm = ({
  onSubmit,
  onCancel,
  staff = null,
  isEdit = false,
  countStaff,
}) => {
  const { user } = useAuth();
  const { veterinaryStaff, branches, generateNextStaffId } =
    useVeterinaryStaff(user);
  const {
    users,
    loading: usersLoading,
    getEligibleStaffUsers,
    isUserEligibleForStaff,
    loadUsers, // Add loadUsers function for manual refresh
  } = useAuthUsers(veterinaryStaff);

  // Get only eligible users (excluding vet-owners and already assigned staff)
  // For edit mode, exclude current staff member from the check
  const eligibleUsers = getEligibleStaffUsers(isEdit ? staff?.id : null);

  const [formData, setFormData] = useState({
    staff_id: "",
    selected_user_id: "",
    staff_name: "",
    staff_email: "",
    staff_type: "assistant",
    vet_owner_id: user?.id || "",
    assigned_id: user?.id || "",
    designated_branch_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopulatingUsers, setIsPopulatingUsers] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  useEffect(() => {
    if (isEdit && staff) {
      setFormData({
        staff_id: staff.displayId || staff.staff_code || "",
        selected_user_id: staff.assigned_id || "",
        staff_name: staff.staff_name || "",
        staff_email: staff.staff_email || "",
        staff_type: staff.staff_type || "assistant",
        vet_owner_id: staff.vet_owner_id || user?.id || "",
        assigned_id: staff.assigned_id || user?.id || "",
        designated_branch_id: staff.designated_branch_id || "",
      });
    } else if (!isEdit) {
      // Auto-generate ID for new staff only once
      setFormData((prev) => ({
        ...prev,
        staff_id: generateNextStaffId(),
        vet_owner_id: user?.id || "",
        assigned_id: user?.id || "",
        selected_user_id: "",
        staff_name: "",
        staff_email: "",
      }));
    }
  }, [isEdit, staff?.id, user?.id]); // Only depend on essential, stable values

  const validateForm = () => {
    const newErrors = {};

    // Staff ID is auto-generated, no validation needed

    if (!formData.selected_user_id) {
      newErrors.selected_user_id = "Please select a user";
    } else if (
      !isUserEligibleForStaff(
        formData.selected_user_id,
        isEdit ? staff?.id : null
      )
    ) {
      newErrors.selected_user_id =
        "Selected user is not eligible (vet-owners or already assigned staff cannot be selected)";
    }

    if (!formData.staff_type) {
      newErrors.staff_type = "Staff type is required";
    }

    if (!formData.designated_branch_id) {
      newErrors.designated_branch_id = "Branch selection is required";
    }

    // Duplicate checking is now handled by the eligibility filter

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const staffForm = {
      ...formData,
      staff_code: generateStaffCode(),
      staff_id: generateStaffCode(),
    };

    console.log("🔄 Form submission started");
    console.log("Form data:", staffForm);

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    console.log("✅ Form validation passed");

    setIsSubmitting(true);
    try {
      console.log("📤 Submitting form data:", formData);
      await onSubmit(staffForm);
      console.log("✅ Form submitted successfully");
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user selection changes, update name and email automatically
    if (name === "selected_user_id") {
      const selectedUser = eligibleUsers.find((u) => u.id === value);
      console.log("👤 User selected:", selectedUser);

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        assigned_id: value,
        staff_name: selectedUser ? selectedUser.full_name : "",
        staff_email: selectedUser ? selectedUser.email : "",
      }));

      console.log("📝 Updated form data with selected user:", {
        selected_user_id: value,
        assigned_id: value,
        staff_name: selectedUser ? selectedUser.full_name : "",
        staff_email: selectedUser ? selectedUser.email : "",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  function generateStaffCode() {
    const code = `VS${String(countStaff + 1).padStart(3, "0")}`;
    return code;
  }

  const handlePopulateUsers = async () => {
    setIsPopulatingUsers(true);
    try {
      console.log("🔄 Populating user profiles...");
      const result = await populateUserProfiles();

      if (result.success) {
        toast.success(
          "User profiles populated successfully! Please refresh the page to see updated user list."
        );
        // Force page refresh to reload user data
        window.location.reload();
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error populating users:", error);
      toast.error(`Error populating users: ${error.message}`);
    } finally {
      setIsPopulatingUsers(false);
    }
  };

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    try {
      console.log("🧪 Testing users API...");
      const result = await testUsersAPI();

      if (result.success) {
        toast.success(
          `API Test Successful! Found ${result.users.length} registered users. Check console for detailed results.`
        );
      } else {
        toast.error(
          `API Test Failed: ${result.error}. Check console for details.`
        );
      }
    } catch (error) {
      console.error("Error testing API:", error);
      toast.error(`Error testing API: ${error.message}`);
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
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
          {/* Staff ID - Hidden, auto-generated */}
          <input type="hidden" name="staff_id" value={generateStaffCode()} />

          {/* Display auto-generated ID for new staff */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Staff ID:</strong> {generateStaffCode()}{" "}
                (auto-generated)
              </p>
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select User *
            </label>
            <select
              name="selected_user_id"
              value={formData.selected_user_id}
              onChange={handleChange}
              disabled={usersLoading || isEdit}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.selected_user_id ? "border-red-500" : "border-gray-300"
              } ${
                usersLoading || isEdit ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">
                {usersLoading ? "Loading users..." : "Select a registered user"}
              </option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            {errors.selected_user_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.selected_user_id}
              </p>
            )}
            {isEdit && (
              <p className="mt-1 text-sm text-gray-500">
                User selection cannot be changed when editing
              </p>
            )}
            {!isEdit && eligibleUsers.length === 0 && !usersLoading && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-yellow-600">
                  No eligible users found. Only users with roles other than
                  "vet-owner" and not already assigned as staff can be selected.
                </p>

                {/* Test API Button */}
                <button
                  type="button"
                  onClick={handleTestAPI}
                  disabled={isTestingAPI}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingAPI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing API...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Test Users API</span>
                    </>
                  )}
                </button>

                {/* Setup User Profiles Button */}
                <button
                  type="button"
                  onClick={handlePopulateUsers}
                  disabled={isPopulatingUsers}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPopulatingUsers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up users...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Setup User Profiles</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Test Users API:</strong> Check if admin.listUsers()
                    is working
                  </p>
                  <p>
                    <strong>Setup User Profiles:</strong> Create fallback user
                    profiles table
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Display Selected User Info */}
          {formData.staff_name && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected User:
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <strong>Name:</strong> {formData.staff_name}
                </div>
                <div>
                  <strong>Email:</strong> {formData.staff_email}
                </div>
              </div>
            </div>
          )}

          {/* Staff Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Type *
            </label>
            <select
              name="staff_type"
              value={formData.staff_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.staff_type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="resident">Resident</option>
              <option value="assistant">Assistant</option>
            </select>
            {errors.staff_type && (
              <p className="mt-1 text-sm text-red-600">{errors.staff_type}</p>
            )}
          </div>

          {/* Designated Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designated Branch *
            </label>
            <select
              name="designated_branch_id"
              value={formData.designated_branch_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.designated_branch_id
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_code}-{branch.branch_name} / (
                  {branch.branch_type})
                </option>
              ))}
            </select>
            {errors.designated_branch_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.designated_branch_id}
              </p>
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

export default VeterinaryForm;
