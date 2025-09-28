"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { petOwnerItems, vetOwnerItems } from "@/components/utils/link-data";
import { isNull } from "lodash";

const AccountSettingsContent = () => {
  const router = useRouter();
  const { user, profile, updateUserProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profilePhoto: "",
  });

  console.log(user, "user profile");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data on component mount
  useEffect(() => {
    if (user && profile) {
      const getUserProfile = user.user_metadata;

      setFormData({
        first_name: getUserProfile?.first_name || "",
        last_name: getUserProfile?.last_name || "",
        email: user?.email || "",
        phone: getUserProfile?.phone || "",
        profilePhoto: getUserProfile?.profilePhoto || "",
      });
    }
  }, [user, profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          profilePhoto: formData.profilePhoto,
        },
      });

      if (authError) throw authError;

      // Update profiles table if it exists
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          profile_photo: formData.profilePhoto,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Don't throw error if profiles table doesn't exist or no rows affected
      if (
        profileError &&
        !profileError.message.includes('relation "profiles" does not exist')
      ) {
        console.warn("Profile table update failed:", profileError);
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Update local auth state if using the hook's method
      if (updateUserProfile) {
        await updateUserProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profilePhoto: formData.profilePhoto,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {!isNull(formData.profilePhoto) ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      formData.firstName?.charAt(0) ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Camera size={16} />
                      <span>Change Photo</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) =>
                          handleInputChange("last_name", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Enter email"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Security
              </h2>

              {!showPasswordSection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">
                        Last updated 30 days ago
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordSection(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      <Lock size={16} />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("billing");
  return (
    <DashboardMainLayout
      navList={vetOwnerItems}
      selectedPageRender={<AccountSettingsContent />}
      role={"pet-owner"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default AccountSettings;
