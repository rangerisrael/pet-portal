"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import DashboardContent from "@/components/dashboard/content/DashboardContent";
import { petOwnerItems, vetOwnerItems } from "@/components/utils/link-data";
import { useAppointments } from "@/hooks/useAppointments";
import useAuth from "@/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import { RescheduleForm } from "@/components/dashboard/forms/RescheduleForm";
import { RejectAppointmentForm } from "@/components/dashboard/forms/RejectAppointmentForm";
import { AppointmentDetailsModal } from "@/components/dashboard/forms/AppointmentDetailsModal";
import {
  calculatePetTypeData,
  calculateRevenueData,
  calculateStats,
  getFilteredAppointments,
} from "@/utils/dashboard-calculations";
import { useRouter } from "next/navigation";
import AppointmentsContent from "@/components/dashboard/content/AppointmentContent";
import { AppointmentForm } from "@/components/dashboard/forms/AppoinmentForm";

const DashboardVetOwnerAppointment = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults - VET-OWNER ROLE
  const appointmentHook = useAppointments(user, 'vet-owner') || {};
  const petHook = usePets(user, 'vet-owner') || {};

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
    rescheduleAppointment,
    approveAppointment,
    rejectAppointment,
    loading: appointmentsLoading,
  } = appointmentHook;

  const {
    pets = [],
    loading: petsLoading,
  } = petHook;

  return (
    <>
      {" "}
      <DashboardMainLayout
        navList={vetOwnerItems}
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
            setShowRejectForm={setShowRejectForm}
            setShowDetailsModal={setShowDetailsModal}
            deleteAppointment={deleteAppointment}
            approveAppointment={approveAppointment}
            appointmentsData={appointments}
            role="vet-owner"
          />
        }
        role={"vet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* Appointment Forms */}
      {showCreateForm && (
        <AppointmentForm
          onSubmit={createAppointment}
          onCancel={() => setShowCreateForm(false)}
          pets={pets}
          colorPalette={colorPalette}
          selectedColor={selectedColor}
        />
      )}
      {showEditForm && selectedAppointment && (
        <AppointmentForm
          appointment={selectedAppointment}
          onSubmit={(data) => updateAppointment(selectedAppointment.id, data)}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedAppointment(null);
          }}
          isEdit={true}
        />
      )}
      {showRescheduleForm && selectedAppointment && (
        <RescheduleForm
          appointment={selectedAppointment}
          onSubmit={rescheduleAppointment}
          onCancel={() => {
            setShowRescheduleForm(false);
            setSelectedAppointment(null);
          }}
        />
      )}
      {showRejectForm && selectedAppointment && (
        <RejectAppointmentForm
          appointment={selectedAppointment}
          onSubmit={(appointmentId, reason) => {
            rejectAppointment(appointmentId, reason);
            setShowRejectForm(false);
            setSelectedAppointment(null);
          }}
          onCancel={() => {
            setShowRejectForm(false);
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
    </>
  );
};

export default DashboardVetOwnerAppointment;
