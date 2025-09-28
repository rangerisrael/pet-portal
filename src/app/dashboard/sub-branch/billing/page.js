"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { petOwnerItems, subBranchItems } from "@/components/utils/link-data";
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
import BillingContent from "@/components/dashboard/content/BillingContent";

const DashboardPetOwnerBilling = () => {
  const [activeTab, setActiveTab] = useState("billing");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user) || {};

  return (
    <DashboardMainLayout
      navList={subBranchItems}
      selectedPageRender={
        <>
          <BillingContent />
        </>
      }
      role={"sub-branch"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default DashboardPetOwnerBilling;
