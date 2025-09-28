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
import { PetForm } from "@/components/dashboard/forms/PetForm";
import { AppointmentForm } from "@/components/dashboard/forms/AppoinmentForm";
import { VetPetShowForm } from "@/utils/global-state/dashboard/vet-owner.glb";

const DashboardPetOwnerRecord = () => {
  const [activeTab, setActiveTab] = useState("pet-record");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetForm, setShowPetForm] = VetPetShowForm();
  const [showEditPetForm, setShowEditPetForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [colorPalette, setColorPalette] = useState([
    { id: 1, hex_code: "#EA580C", description: "Orange" },
    { id: 2, hex_code: "#DC2626", description: "Red" },
    { id: 3, hex_code: "#16A34A", description: "Green" },
    { id: 4, hex_code: "#2563EB", description: "Blue" },
    { id: 5, hex_code: "#7C3AED", description: "Purple" },
  ]);
  const [selectedColor, setSelectedColor] = useState("#EA580C");

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

  // Show authentication notice at the top if not authenticated, but don't block the page
  const showAuthNotice = !user || !isAuthenticated;

  return (
    <>
      {showAuthNotice && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-100 border-b border-orange-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
              <p className="text-orange-800 text-sm">
                You need to be logged in to manage your pets.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-orange-600 text-white px-4 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      )}
      <div className={showAuthNotice ? 'pt-14' : ''}>
        <DashboardMainLayout
          navList={petOwnerItems}
          selectedPageRender={
            <PetContent
              pets={pets}
              setShowCreateForm={setShowAppointmentForm}
              setSelectedPet={setSelectedPet}
              setShowPetForm={setShowPetForm}
              setShowEditPetForm={setShowEditPetForm}
              deletePet={deletePet}
              userRole={"pet-owner"}
            />
          }
          role={"pet-owner"}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {/* Pet Form */}
      {showPetForm && (
        <PetForm
          onSubmit={async (data) => {
            try {
              if (!user?.id) {
                throw new Error("User not authenticated");
              }
              await createPet(data);
              setShowPetForm(false);
            } catch (error) {
              console.error("Error creating pet:", error);
              // Toast should already be shown by usePets hook
            }
          }}
          onCancel={() => setShowPetForm(false)}
        />
      )}

      {/* Appointment Form */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          pets={pets}
          appointments={appointments}
          colorPalette={colorPalette}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          preSelectedPet={selectedPet}
          onSubmit={async (data) => {
            try {
              if (!user?.id) {
                throw new Error("User not authenticated");
              }
              if (selectedAppointment) {
                await updateAppointment(selectedAppointment.id, data, pets);
              } else {
                await createAppointment(data, pets, selectedColor);
              }
              setShowAppointmentForm(false);
              setSelectedAppointment(null);
              setSelectedPet(null);
            } catch (error) {
              console.error("Error with appointment:", error);
              // Toast should already be shown by useAppointments hook
            }
          }}
          onCancel={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
            setSelectedPet(null);
          }}
          isEdit={!!selectedAppointment}
          setShowPetForm={setShowPetForm}
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
    </>
  );
};

export default DashboardPetOwnerRecord;
