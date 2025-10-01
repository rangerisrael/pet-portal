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
import AppointmentsContent from "@/components/dashboard/content/AppointmentContent";
import { AppointmentForm } from "@/components/dashboard/forms/AppoinmentForm";

const DashboardPetOwnerAppointment = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [colorPalette, setColorPalette] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#EA580C");

  const router = useRouter();

  // Use Redux for authentication
  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();

  // Use custom hooks for data management with safe defaults
  const appointmentHook = useAppointments(user, "main-branch") || {};

  const {
    appointments = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = appointmentHook;

  return (
    <>
      {" "}
      <DashboardMainLayout
        navList={mainBranchItems}
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
            deleteAppointment={deleteAppointment}
            appointmentsData={appointments}
          />
        }
        role={"main-branch"}
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
    </>
  );
};

export default DashboardPetOwnerAppointment;
