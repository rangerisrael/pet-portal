"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { petOwnerItems } from "@/components/utils/link-data";
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
import AdoptionsContent from "@/components/dashboard/content/AdoptionsContent";
import useAdoptions from "@/hooks/useAdoptions";

const DashboardPetOwnerAdoption = () => {
  const [activeTab, setActiveTab] = useState("adoption");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user) || {};

  const { pets = [], createPet, updatePet, deletePet } = petHook;

  const {
    filteredPets,
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    stats,
    toggleFavorite,
    submitApplication,
    updateFilter,
    clearFilters,
    setSearchTerm,
    setSortBy,
    isFavorited,
  } = useAdoptions();

  return (
    <DashboardMainLayout
      navList={petOwnerItems}
      selectedPageRender={
        <AdoptionsContent
          filteredPets={[]}
          loading={loading}
          error={error}
          filters={filters}
          searchTerm={searchTerm}
          sortBy={sortBy}
          stats={stats}
          toggleFavorite={toggleFavorite}
          submitApplication={submitApplication}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          setSearchTerm={setSearchTerm}
          setSortBy={setSortBy}
          isFavorited={isFavorited}
        />
      }
      role={"pet-owner"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default DashboardPetOwnerAdoption;
