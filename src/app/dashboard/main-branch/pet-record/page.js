"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { mainBranchItems, petOwnerItems } from "@/components/utils/link-data";
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
import { PetForm } from "@/components/dashboard/forms/PetForm";

const DashboardPetOwnerRecord = () => {
  const [activeTab, setActiveTab] = useState("pet-record");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetForm, setShowPetForm] = useState(false);
  const [showEditPetForm, setShowEditPetForm] = useState(false);

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user, 'main-branch') || {};
  const petHook = usePets(user, 'main-branch') || {};

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = appointmentHook;
  const { pets = [], createPet, updatePet, deletePet } = petHook;

  return (
    <>
      <DashboardMainLayout
        navList={mainBranchItems}
        selectedPageRender={
          <PetContent
            pets={pets}
            setShowCreateForm={setShowCreateForm}
            setSelectedPet={setSelectedPet}
            setShowPetForm={setShowPetForm}
            setShowEditPetForm={setShowEditPetForm}
            deletePet={deletePet}
            userRole={"main-branch"}
          />
        }
        role={"main-branch"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* Pet Form */}
      {showPetForm && (
        <PetForm onSubmit={createPet} onCancel={() => setShowPetForm(false)} />
      )}

      {/* Edit Pet Form */}
      {showEditPetForm && selectedPet && (
        <PetForm
          pet={selectedPet}
          onSubmit={(data) => updatePet(selectedPet.id, data)}
          onCancel={() => {
            setShowEditPetForm(false);
            setSelectedPet(null);
          }}
          isEdit={true}
        />
      )}
    </>
  );
};

export default DashboardPetOwnerRecord;
