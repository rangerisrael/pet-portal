"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { petOwnerItems, vetOwnerItems } from "@/components/utils/link-data";
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
import PetContent from "@/components/dashboard/content/PetContent";
import PetOwnerContent from "@/components/dashboard/content/PetOwnerContent";
import { PetForm } from "@/components/dashboard/forms/PetForm";
import { PetOwnerForm } from "@/components/dashboard/forms/PetOwnerForm";
import { VetPetShowForm } from "@/utils/global-state/dashboard/vet-owner.glb";
import { useAuthUsers } from "@/hooks/useAuthUsers";

const DashboardPetOwnerRecord = () => {
  const [activeTab, setActiveTab] = useState("pet-record");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetForm, setShowPetForm] = VetPetShowForm();
  const [showEditPetForm, setShowEditPetForm] = useState(false);

  // Pet Owner Form states
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [showEditOwnerForm, setShowEditOwnerForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user, "vet-owner") || {};

  // Hook to get all registered pet owners
  const {
    users: petOwners = [],
    loading: ownersLoading,
    error: ownersError,
    createPetOwner,
    updatePetOwner,
    deletePetOwner,
  } = useAuthUsers();

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = appointmentHook;
  const { pets = [], createPet, updatePet, deletePet } = petHook;

  // Pet Owner CRUD handlers
  const handleAddOwner = () => {
    setSelectedOwner(null);
    setShowOwnerForm(true);
  };

  const handleEditOwner = (owner) => {
    setSelectedOwner(owner);
    setShowEditOwnerForm(true);
  };

  const handleDeleteOwner = async (ownerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this pet owner? This action cannot be undone."
      )
    ) {
      try {
        await deletePetOwner(ownerId);
      } catch (error) {
        console.error("Error deleting owner:", error);
      }
    }
  };

  const handleOwnerSubmit = async (ownerData) => {
    try {
      await createPetOwner(ownerData);
      setShowOwnerForm(false);
    } catch (error) {
      console.error("Error creating owner:", error);
    }
  };

  const handleOwnerUpdate = async (ownerData) => {
    try {
      await updatePetOwner(selectedOwner.id, ownerData);
      setShowEditOwnerForm(false);
      setSelectedOwner(null);
    } catch (error) {
      console.error("Error updating owner:", error);
    }
  };

  return (
    <>
      <DashboardMainLayout
        navList={vetOwnerItems}
        selectedPageRender={
          <PetContent
            pets={pets}
            setShowCreateForm={setShowCreateForm}
            setSelectedPet={setSelectedPet}
            setShowPetForm={setShowPetForm}
            setShowEditPetForm={setShowEditPetForm}
            deletePet={deletePet}
            userRole={"vet-owner"}
          />
        }
        role={"vet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* Pet Form */}
      {showPetForm && (
        <PetForm
          onSubmit={async (data) => {
            try {
              await createPet(data);
              setShowPetForm(false);
            } catch (error) {
              console.error("Error creating pet:", error);
            }
          }}
          onCancel={() => setShowPetForm(false)}
        />
      )}

      {/* Edit Pet Form */}
      {showEditPetForm && selectedPet && (
        <PetForm
          pet={selectedPet}
          onSubmit={async (data) => {
            try {
              await updatePet(selectedPet.id, data);
              setShowEditPetForm(false);
              setSelectedPet(null);
            } catch (error) {
              console.error("Error updating pet:", error);
            }
          }}
          onCancel={() => {
            setShowEditPetForm(false);
            setSelectedPet(null);
          }}
          isEdit={true}
        />
      )}

      {/* Add Pet Owner Form */}
      {showOwnerForm && (
        <PetOwnerForm
          onSubmit={handleOwnerSubmit}
          onCancel={() => setShowOwnerForm(false)}
        />
      )}

      {/* Edit Pet Owner Form */}
      {showEditOwnerForm && selectedOwner && (
        <PetOwnerForm
          owner={selectedOwner}
          onSubmit={handleOwnerUpdate}
          onCancel={() => {
            setShowEditOwnerForm(false);
            setSelectedOwner(null);
          }}
          isEdit={true}
        />
      )}
    </>
  );
};

export default DashboardPetOwnerRecord;
