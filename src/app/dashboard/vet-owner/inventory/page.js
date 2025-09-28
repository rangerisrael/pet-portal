"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import InventoryContent from "@/components/dashboard/content/InventoryContent";

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  return (
    <DashboardMainLayout
      navList={vetOwnerItems}
      selectedPageRender={
        <InventoryContent
          user={user}
          userRole="vet-owner"
          branchName={profile?.branchName || "All Branches"}
          branchID={profile?.branchId || "all"}
        />
      }
      role={"vet-owner"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default InventoryManagement;
