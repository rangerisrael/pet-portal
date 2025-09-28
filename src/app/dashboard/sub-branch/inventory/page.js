"use client";

import React, { useMemo, useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { subBranchItems, vetOwnerItems } from "@/components/utils/link-data";
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
    const found = veterinaryStaff.find((u) => u.assigned_id === user?.id);
    console.log(
      "🔍 Sub-branch searching for veterinary staff with assigned_id:",
      user?.id
    );
    console.log("🏥 Available veterinary staff:", veterinaryStaff);
    console.log("✅ Found veterinary staff:", found);

    // If no specific assignment found, fallback to a sub-branch based on user info
    // This ensures different users get different branches for demonstration
    if (!found && branches.length > 0) {
      const subBranches = branches.filter(b => b.branch_type === 'sub-branch');

      if (subBranches.length > 0) {
        // For demonstration, we'll assign users to specific branches
        // In production, this would come from the database assignment
        let assignedSubBranch;

        // Simple assignment logic - you can modify this based on your needs
        console.log("🔍 User assignment logic - email:", user?.email, "id:", user?.id);

        if (user?.email?.includes('pili') || user?.id?.includes('pili')) {
          assignedSubBranch = subBranches.find(b => b.branch_name === 'Pili') || subBranches[1] || subBranches[0];
          console.log("✅ Assigned user to Pili branch based on email/id match");
        } else if (user?.email?.includes('legazpi') || user?.id?.includes('legazpi')) {
          assignedSubBranch = subBranches.find(b => b.branch_name === 'Legazpi') || subBranches[2] || subBranches[0];
          console.log("✅ Assigned user to Legazpi branch based on email/id match");
        } else {
          // For demo purposes, assign to Pili branch for sub-branch users
          // Always prefer Pili as the default sub-branch for unmatched users
          assignedSubBranch = subBranches.find(b => b.branch_name === 'Pili') ||
                              subBranches.find(b => b.branch_type === 'sub-branch') ||
                              subBranches[0];
          console.log("✅ Default assignment to Pili branch for sub-branch user");
        }

        console.log("🔧 Available sub-branches:", subBranches.map(b => `${b.branch_name} (ID: ${b.branch_id})`));
        console.log(`🔧 User ${user?.email || user?.id} assigned to:`, assignedSubBranch);

        return {
          branch_id: assignedSubBranch.branch_id,
          branch_name: assignedSubBranch.branch_name,
          branch_type: assignedSubBranch.branch_type,
          assigned_id: user?.id
        };
      }

      // Fallback to any available branch if no sub-branches exist
      // For sub-branch users, prefer sub-branches over main-branch
      const anyBranch = branches.find(b => b.branch_type === 'sub-branch') || branches[0];
      console.log("🔧 No sub-branches available in filtered list, using fallback branch:", anyBranch);
      return {
        branch_id: anyBranch.branch_id,
        branch_name: anyBranch.branch_name,
        branch_type: anyBranch.branch_type,
        assigned_id: user?.id
      };
    }

    return found || null;
  }, [user, veterinaryStaff, branches]);

  console.log(selectedVeterenaryStaff, "get selectedBranch");
  console.log("🏥 All branches available:", branches);
  console.log("🔍 User ID:", user?.id);
  console.log("👥 All veterinary staff:", veterinaryStaff);

  return (
    <DashboardMainLayout
      navList={subBranchItems}
      selectedPageRender={
        <InventoryContent
          branchName={selectedVeterenaryStaff?.branch_name || "No Branch Assigned"}
          branchID={selectedVeterenaryStaff?.branch_id || null}
          user={user}
          userRole="sub-branch"
        />
      }
      role={"sub-branch"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default InventoryManagement;
