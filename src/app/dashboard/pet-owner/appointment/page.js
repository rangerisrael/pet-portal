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
import AppointmentsContent from "@/components/dashboard/content/AppointmentContent";
import { AppointmentForm } from "@/components/dashboard/forms/AppoinmentForm";
import { RescheduleForm } from "@/components/dashboard/forms/RescheduleForm";
import { AppointmentDetailsModal } from "@/components/dashboard/forms/AppointmentDetailsModal";
import { PetForm } from "@/components/dashboard/forms/PetForm";

const DashboardPetOwnerAppointment = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);

  // Default color palette for appointments
  const [colorPalette, setColorPalette] = useState([
    { id: 1, hex_code: "#EA580C", description: "Orange" },
    { id: 2, hex_code: "#DC2626", description: "Red" },
    { id: 3, hex_code: "#16A34A", description: "Green" },
    { id: 4, hex_code: "#2563EB", description: "Blue" },
    { id: 5, hex_code: "#7C3AED", description: "Purple" },
    { id: 6, hex_code: "#DB2777", description: "Pink" },
    { id: 7, hex_code: "#059669", description: "Emerald" },
    { id: 8, hex_code: "#D97706", description: "Amber" },
  ]);
  const [selectedColor, setSelectedColor] = useState("#EA580C");

  const router = useRouter();

  // Use Redux for authentication
  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user) || {};
  const petHook = usePets(user, 'pet-owner') || {};

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
    rescheduleAppointment,
    loading: appointmentsLoading,
  } = appointmentHook;

  const {
    pets = [],
    loading: petsLoading,
    createPet,
    refreshPets: refreshPets,
  } = petHook;

  return (
    <>
      {" "}
      <DashboardMainLayout
        navList={petOwnerItems}
        selectedPageRender={
          <AppointmentsContent
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowCreateForm={setShowCreateForm}
            setSelectedAppointment={setSelectedAppointment}
            setShowEditForm={setShowEditForm}
            setShowRescheduleForm={setShowRescheduleForm}
            setShowDetailsModal={setShowDetailsModal}
            deleteAppointment={deleteAppointment}
            appointmentsData={appointments}
          />
        }
        role={"pet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* Appointment Forms */}
      {showCreateForm && (
        <AppointmentForm
          onSubmit={(data) => createAppointment(data, pets, selectedColor)}
          onCancel={() => setShowCreateForm(false)}
          pets={pets}
          colorPalette={colorPalette}
          selectedColor={selectedColor}
          setShowPetForm={setShowPetForm}
        />
      )}
      {showEditForm && selectedAppointment && (
        <AppointmentForm
          appointment={selectedAppointment}
          onSubmit={(data) => updateAppointment(selectedAppointment.id, data, pets)}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedAppointment(null);
          }}
          isEdit={true}
          pets={pets}
          colorPalette={colorPalette}
          selectedColor={selectedColor}
          setShowPetForm={setShowPetForm}
        />
      )}
      {showRescheduleForm && selectedAppointment && (
        <RescheduleForm
          appointment={selectedAppointment}
          onSubmit={(data) => {
            rescheduleAppointment(data);
            setShowRescheduleForm(false);
            setSelectedAppointment(null);
          }}
          onCancel={() => {
            setShowRescheduleForm(false);
            setSelectedAppointment(null);
          }}
        />
      )}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Pet Form Modal */}
      {showPetForm && (
        <PetForm
          onSubmit={async (petData) => {
            try {
              await createPet(petData);
              await refreshPets(); // Refresh the pets list
              setShowPetForm(false);
            } catch (error) {
              console.error('Error creating pet:', error);
            }
          }}
          onCancel={() => setShowPetForm(false)}
        />
      )}
    </>
  );
};

export default DashboardPetOwnerAppointment;
