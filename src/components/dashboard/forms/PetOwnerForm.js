import React, { useState, useEffect } from "react";
import { XCircle, User, Mail, Phone, UserCheck, Camera, Upload } from "lucide-react";

export const PetOwnerForm = ({ owner = null, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "pet-owner"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && owner) {
      setFormData({
        first_name: owner.first_name || "",
        last_name: owner.last_name || "",
        email: owner.email || "",
        phone: owner.phone || "",
        role: owner.role || "pet-owner"
      });
    }
  }, [isEdit, owner]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
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
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Pet Owner" : "Add New Pet Owner"}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-gray-50 space-y-6">
          {/* Owner Photo Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Owner Photo
            </h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No image selected</p>
                </div>
              </div>
              <button
                type="button"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Select Image</span>
              </button>
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP • Max size: 5MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-6 text-lg">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.first_name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.last_name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  disabled={isEdit}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                {isEdit && (
                  <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                >
                  <option value="pet-owner">Pet Owner</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number (optional)"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  isEdit ? "Update Owner" : "Create Owner"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};