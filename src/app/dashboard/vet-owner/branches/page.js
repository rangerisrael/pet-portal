"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import useBranches from "@/hooks/useBranches";
import { toast } from 'react-toastify';
import BranchesContent from "@/components/dashboard/content/BranchesContent";
import BranchesForm from "@/components/dashboard/forms/BranchesForm";

const Branches = () => {
  const [activeTab, setActiveTab] = useState("branches");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Use branches hook for data management
  const { branches, loading, error, createBranch, updateBranch, deleteBranch } =
    useBranches(user);

  // Handle create branch
  const handleCreateBranch = () => {
    setShowCreateForm(true);
  };

  // Handle edit branch
  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setShowEditForm(true);
  };

  // Handle delete branch
  const handleDeleteBranch = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteBranch(branchId);
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast.error("Failed to delete branch. Please try again.");
      }
    }
  };

  // Handle form submission for creating branch
  const handleCreateSubmit = async (formData) => {
    try {
      await createBranch(formData);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch. Please try again.");
    }
  };

  // Handle form submission for editing branch
  const handleEditSubmit = async (formData) => {
    try {
      await updateBranch(selectedBranch.id, formData);
      setShowEditForm(false);
      setSelectedBranch(null);
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch. Please try again.");
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedBranch(null);
  };

  return (
    <>
      <DashboardMainLayout
        navList={vetOwnerItems}
        selectedPageRender={
          <BranchesContent
            branches={branches}
            loading={loading}
            error={error}
            onCreateBranch={handleCreateBranch}
            onEditBranch={handleEditBranch}
            onDeleteBranch={handleDeleteBranch}
          />
        }
        role={"vet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Create Branch Form */}
      {showCreateForm && (
        <BranchesForm
          onSubmit={handleCreateSubmit}
          onCancel={handleFormCancel}
          isEdit={false}
        />
      )}

      {/* Edit Branch Form */}
      {showEditForm && selectedBranch && (
        <BranchesForm
          branch={selectedBranch}
          onSubmit={handleEditSubmit}
          onCancel={handleFormCancel}
          isEdit={true}
        />
      )}
    </>
  );
};

export default Branches;
