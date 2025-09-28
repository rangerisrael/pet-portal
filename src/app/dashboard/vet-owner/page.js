"use client";

import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { vetOwnerItems } from "@/components/utils/link-data";
import { useAppointments } from "@/hooks/useAppointments";
import useAuth from "@/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import { useAuthUsers } from "@/hooks/useAuthUsers";
import {
  calculatePetTypeData,
  calculateRevenueData,
  calculateStats,
  calculateVetStats,
  getFilteredAppointments,
} from "@/utils/dashboard-calculations";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const DashboardVetOwner = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults (vet-owner role)
  const appointmentHook = useAppointments(user, 'vet-owner') || {};
  const petHook = usePets(user, 'vet-owner') || {};
  const usersHook = useAuthUsers() || {};

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loading: appointmentsLoading,
  } = appointmentHook;

  const {
    pets = [],
    createPet,
    updatePet,
    deletePet,
    loading: petsLoading,
  } = petHook;

  const {
    users = [],
    loading: usersLoading,
  } = usersHook;

  // Define color scheme for charts
  const colors = {
    primary: '#EA580C', // Orange
    secondary: '#3B82F6', // Blue
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    purple: '#8B5CF6' // Purple
  };

  // Calculate vet-specific stats and filtered data
  const stats = calculateVetStats(appointments, pets, users);
  const appointmentsData = getFilteredAppointments(
    appointments,
    filterStatus,
    searchTerm,
    sortBy
  );
  const revenueData = calculateRevenueData(appointments);
  const petTypeData = calculatePetTypeData(pets);

  // Show auth notice if not authenticated
  const showAuthNotice = !user || !isAuthenticated;

  return (
    <>
      {showAuthNotice && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-100 border-b border-orange-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
              <p className="text-orange-800 text-sm">
                Please log in to access the full veterinary dashboard.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-orange-600 text-white px-4 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      )}
      <div className={showAuthNotice ? 'pt-14' : ''}>
        <DashboardMainLayout
          navList={vetOwnerItems}
          selectedPageRender={
            <DashboardContent
              user={user}
              stats={stats}
              appointments={appointments}
              revenueData={revenueData}
              colors={colors}
              petTypeData={petTypeData}
              appointmentsData={appointmentsData}
              appointmentsLoading={appointmentsLoading}
              petsLoading={petsLoading}
              usersLoading={usersLoading}
              setShowCreateForm={() => setActiveTab("appointments")}
            />
          }
          role={"vet-owner"}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </>
  );
};

export default DashboardVetOwner;
