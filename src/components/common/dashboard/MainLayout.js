"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Settings,
  Bell,
  LogOut,
  Search,
  Filter,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { usePets } from "@/hooks/usePets";
import {
  calculateStats,
  getFilteredAppointments,
  calculateRevenueData,
  calculatePetTypeData,
} from "@/utils/dashboard-calculations";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import InvoiceForm from "@/components/dashboard/forms/InvoiceForm";
import { downloadInvoicePDF, printInvoicePDF } from "@/utils/invoicePDF";
import authService from "@/services/authService";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, selectUser } from "@/store/slices/authSlice";
import CircleAvatar from "@/components/custom/Avatar";
import { isEmpty, isNull } from "lodash";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/common/dashboard/DashboardLayout";
import { useQueryClient } from "@tanstack/react-query";

const DashboardMainLayout = ({
  navList,
  renderList,
  activeTab,
  setActiveTab,
  selectedPageRender,
  role,
  url,
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  const [me, setMe] = useState();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Use Redux for authentication

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const getProfile = await authService.getCurrentUser();
        console.log(getProfile, "current user");
        if (getProfile && mounted) {
          setMe(getProfile.user_metadata);
        }
      } catch (error) {
        console.log("Failed to fetch user profile:", error);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    console.log("🔄 Main layout logout initiated...");

    try {
      // Immediately clear all state for instant UI feedback
      dispatch(clearAuth());
      queryClient.clear();

      // Use the useAuth hook for consistent logout
      const result = await logout();
      console.log("Logout result:", result);

      console.log("✅ Logout completed, redirecting...");
      // Force navigation to root
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Manual cleanup on error
      try {
        await authService.signOut();
      } catch (cleanupError) {
        console.error("❌ Cleanup error:", cleanupError);
      }
      // Force redirect anyway
      window.location.href = "/";
    }
  };

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user) || {};

  const router = useRouter();

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = appointmentHook;
  const { pets = [], createPet, updatePet, deletePet } = petHook;

  // Calculate stats and filtered data (functions now handle empty arrays gracefully)
  const stats = calculateStats(appointments, pets);
  const appointmentsData = getFilteredAppointments(
    appointments,
    filterStatus,
    searchTerm,
    sortBy
  );
  const revenueData = calculateRevenueData(appointments);
  const petTypeData = calculatePetTypeData(pets);

  const getUserProfile = me ?? user?.user_metadata;

  // Show loading while authenticating
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PetPortal</h1>
                <p className="text-sm text-gray-500">Veterinary Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navList?.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id.includes("dashboard")) {
                    router.push(`/dashboard/${role}`);
                  } else {
                    router.push(`/dashboard/${role}/${item.id}`);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-orange-50 text-orange-700 border-l-4 border-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {!isNull(getUserProfile?.profilePhoto) ||
                  !isEmpty(getUserProfileme?.profilePhoto) ? (
                    <CircleAvatar
                      src={getUserProfile?.profilePhoto}
                      alt="John Doe"
                      size="xs"
                    />
                  ) : (
                    getUserProfile?.first_name ||
                    getUserProfile?.email?.charAt(0)?.toUpperCase() ||
                    "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserProfile?.first_name +
                      " " +
                      getUserProfile?.last_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserProfile?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <DashboardLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
      >
        {selectedPageRender}
      </DashboardLayout>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardMainLayout;
