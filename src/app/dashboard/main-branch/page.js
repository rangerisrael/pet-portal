"use client";

import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { mainBranchItems } from "@/components/utils/link-data";
import { useAppointments } from "@/hooks/useAppointments";
import useAuth from "@/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import {
  calculatePetTypeData,
  calculateRevenueData,
  calculateStats,
  getFilteredAppointments,
} from "@/utils/dashboard-calculations";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const DashboardMainBranch = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user) || {};

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

  return (
    <DashboardMainLayout
      navList={mainBranchItems}
      selectedPageRender={
        <DashboardContent
          user={user}
          stats={stats}
          appointments={appointments}
          revenueData={revenueData}
          petTypeData={petTypeData}
          appointmentsData={appointmentsData}
          setShowCreateForm={() => setActiveTab("appointments")}
        />
      }
      role={"main-branch"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default DashboardMainBranch;
