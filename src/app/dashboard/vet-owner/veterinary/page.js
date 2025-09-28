"use client";

import React, { useEffect, useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import useVeterinaryStaff from "@/hooks/useVeterinaryStaff";
import { toast } from "react-toastify";
import VeterinaryContent from "@/components/dashboard/content/VeterinaryContent";
import VeterinaryForm from "@/components/dashboard/forms/VeterinaryForm";
import { supabase } from "@/lib/supabase";

const Veterinary = () => {
  const [activeTab, setActiveTab] = useState("veterinary");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Use veterinary staff hook for data management
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

  // Handle create staff
  const handleCreateStaff = () => {
    setShowCreateForm(true);
  };

  // Handle edit staff
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowEditForm(true);
  };

  // Handle delete staff
  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteVeterinaryStaff(staffId);
      } catch (error) {
        console.error("Error deleting staff:", error);
        toast.error("Failed to delete staff member. Please try again.");
      }
    }
  };

  // Handle generate invitation
  const handleGenerateInvitation = (staff) => {
    const invitationLink = generateInvitationLink(staff.id);
    navigator.clipboard
      .writeText(invitationLink)
      .then(() => {
        toast.success(
          `Invitation link copied to clipboard!\n\nLink: ${invitationLink}`
        );
      })
      .catch(() => {
        toast.info(`Invitation link generated:\n\n${invitationLink}`);
      });
  };

  // Handle form submission for creating staff
  const handleCreateSubmit = async (formData) => {
    try {
      console.log("Creating staff with data:", formData);
      await createVeterinaryStaff(formData);
      setShowCreateForm(false);
      toast.success("Staff member created successfully!");
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error("Failed to create staff member. Please try again.");
    }
  };

  // Handle form submission for editing staff
  const handleEditSubmit = async (formData) => {
    try {
      await updateVeterinaryStaff(selectedStaff.id, formData);
      setShowEditForm(false);
      setSelectedStaff(null);
      toast.success("Staff member updated successfully!");
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error("Failed to update staff member. Please try again.");
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedStaff(null);
  };

  return (
    <>
      <DashboardMainLayout
        navList={vetOwnerItems}
        selectedPageRender={
          <VeterinaryContent
            veterinaryStaff={veterinaryStaff}
            loading={loading}
            error={error}
            onCreateStaff={handleCreateStaff}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteStaff}
            onGenerateInvitation={handleGenerateInvitation}
          />
        }
        role={"vet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Create Staff Form */}
      {showCreateForm && (
        <VeterinaryForm
          countStaff={veterinaryStaff?.length ?? 0}
          onSubmit={handleCreateSubmit}
          onCancel={handleFormCancel}
          isEdit={false}
        />
      )}

      {/* Edit Staff Form */}
      {showEditForm && selectedStaff && (
        <VeterinaryForm
          countStaff={veterinaryStaff?.length ?? 0}
          staff={selectedStaff}
          onSubmit={handleEditSubmit}
          onCancel={handleFormCancel}
          isEdit={true}
        />
      )}
    </>
  );
};

export default Veterinary;
