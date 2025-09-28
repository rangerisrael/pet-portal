"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings, LogOut } from "lucide-react";

const UserRolePage = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    console.log("🔄 User role logout initiated...");

    try {
      const result = await logout();
      console.log("Logout result:", result);

      if (result.success) {
        console.log("✅ Logout successful, redirecting...");
        // Force navigation to root
        window.location.href = "/";
      } else {
        console.error("❌ Logout failed:", result.error);
        // Still redirect even if logout had issues
        window.location.href = "/";
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Force redirect anyway to prevent user being stuck
      window.location.href = "/";
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center text-white">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {user?.user_metadata?.first_name || "User"}
                </h1>
                <p className="text-gray-600">General User Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your personal information and preferences
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Name:</strong> {user?.user_metadata?.first_name}{" "}
                {user?.user_metadata?.last_name}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                {user?.user_metadata?.role || "General User"}
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure your account settings and preferences
            </p>
            <button className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Open Settings
            </button>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Support
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Need help? Get in touch with our support team
            </p>
            <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Contact Us
            </button>
          </div>
        </div>

        {/* Information Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-800 text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                Limited Access
              </h4>
              <p className="text-yellow-700">
                You are currently logged in as a general user. If you are a
                veterinary staff member and should have access to the clinic
                dashboard, please contact your administrator to be added to the
                veterinary staff system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRolePage;
