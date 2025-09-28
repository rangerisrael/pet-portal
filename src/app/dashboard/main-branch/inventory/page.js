"use client";

import React, { useMemo, useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { mainBranchItems, vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import InventoryContent from "@/components/dashboard/content/InventoryContent";
import useVeterinaryStaff from "@/hooks/useVeterinaryStaff";

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  const {
    veterinaryStaff,
    branches,
    loading,
    error,
    createVeterinaryStaff,
    updateVeterinaryStaff,
    deleteVeterinaryStaff,
    generateInvitationLink,
  } = useVeterinaryStaff(user);

  const selectedVeterenaryStaff = useMemo(() => {
    const found = veterinaryStaff.find((u) => u.assigned_id === user.id);
    console.log("🔍 Main-branch searching for veterinary staff with assigned_id:", user?.id);
    console.log("🏥 Available veterinary staff:", veterinaryStaff);
    console.log("✅ Found veterinary staff:", found);
    return found || null;
  }, [user, veterinaryStaff]);

  return (
    <DashboardMainLayout
      navList={mainBranchItems}
      selectedPageRender={
        <InventoryContent
          branchName={selectedVeterenaryStaff?.branch_name || "Main Branch"}
          branchID={selectedVeterenaryStaff?.branch_id || branches?.find(b => b.branch_type === "main")?.branch_id || branches?.[0]?.branch_id || 1}
          user={user}
          userRole="main-branch"
        />
      }
      role={"main-branch"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default InventoryManagement;
