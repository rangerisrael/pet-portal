"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import useVeterinaryStaff from "@/hooks/useVeterinaryStaff";
import { UserCheck, Mail, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

const Invitation = () => {
  const [activeTab, setActiveTab] = useState("invitation");
  const searchParams = useSearchParams();
  const staffId = searchParams.get("staff_id");
  const type = searchParams.get("type");

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Use veterinary staff hook for data management
  const {
    veterinaryStaff,
    loading,
    error,
    getStaffById,
    updateVeterinaryStaff,
  } = useVeterinaryStaff(user);

  const [staff, setStaff] = useState(null);
  const [invitationStatus, setInvitationStatus] = useState(null);

  useEffect(() => {
    if (staffId && veterinaryStaff.length > 0) {
      const foundStaff = getStaffById(staffId);
      setStaff(foundStaff);
    }
  }, [staffId, veterinaryStaff, getStaffById]);

  // Handle invitation acceptance
  const handleAcceptInvitation = async () => {
    if (!staff) return;

    try {
      await updateVeterinaryStaff(staff.id, {
        ...staff,
        invitation_accepted: true,
      });
      setInvitationStatus("accepted");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setInvitationStatus("error");
    }
  };

  // Handle invitation rejection
  const handleRejectInvitation = async () => {
    if (!staff) return;

    try {
      // You might want to delete the staff record or mark as rejected
      setInvitationStatus("rejected");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      setInvitationStatus("error");
    }
  };

  const InvitationContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">Loading invitation...</div>
        </div>
      );
    }

    if (!staffId || !type) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Invalid Invitation Link
            </h3>
            <p className="text-gray-600">
              This invitation link is invalid or incomplete.
            </p>
          </div>
        </div>
      );
    }

    if (!staff) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Invitation Not Found
            </h3>
            <p className="text-gray-600">
              The staff invitation could not be found.
            </p>
          </div>
        </div>
      );
    }

    if (staff.invitation_accepted && invitationStatus !== "accepted") {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Invitation Already Accepted
            </h3>
            <p className="text-gray-600">
              This invitation has already been accepted.
            </p>
          </div>
        </div>
      );
    }

    if (invitationStatus === "accepted") {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Invitation Accepted!
            </h3>
            <p className="text-gray-600">
              Welcome to the team! You can now access the veterinary portal.
            </p>
          </div>
        </div>
      );
    }

    if (invitationStatus === "rejected") {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Invitation Declined
            </h3>
            <p className="text-gray-600">
              You have declined this invitation.
            </p>
          </div>
        </div>
      );
    }

    if (invitationStatus === "error") {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Processing Invitation
            </h3>
            <p className="text-gray-600">
              There was an error processing your invitation. Please try again.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Invitation
          </h1>
          <p className="text-gray-600">
            You have been invited to join our veterinary team
          </p>
        </div>

        {/* Invitation Card */}
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-lg p-6">
          {/* Staff Info */}
          <div className="text-center mb-6">
            <div className={`p-3 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${
              staff.staff_type === 'resident' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <UserCheck className={`w-8 h-8 ${
                staff.staff_type === 'resident' ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {staff.staff_name}
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                staff.staff_type === "resident"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {staff.staff_type === "resident" ? "Veterinary Resident" : "Veterinary Assistant"}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{staff.staff_email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{staff.branch_name}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Staff ID: {staff.displayId || staff.staff_code}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRejectInvitation}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptInvitation}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept Invitation
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-md mx-auto mt-6 text-center">
          <p className="text-sm text-gray-500">
            By accepting this invitation, you agree to join the veterinary team and
            gain access to the portal systems.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <DashboardMainLayout
        navList={vetOwnerItems}
        selectedPageRender={<InvitationContent />}
        role={"vet-owner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
};

export default Invitation;