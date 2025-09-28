"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  UserCheck,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const DashboardInvitation = () => {
  const searchParams = useSearchParams();
  const staffId = searchParams.get("staff_id");

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (staffId) {
      fetchStaffInfo();
    } else {
      setError("No staff ID provided");
      setLoading(false);
    }
  }, [staffId]);

  const fetchStaffInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/accept-invitation?staff_id=${staffId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch staff information");
      }

      setStaff(data.staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard/vet-owner/veterenary"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff Management</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Staff Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested staff member could not be found.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invitation Status
          </h1>
          <p className="text-gray-600">Veterinary staff invitation details</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Status Header */}
          <div
            className={`px-6 py-4 ${
              staff.invitation_accepted
                ? "bg-green-50 border-b border-green-200"
                : "bg-yellow-50 border-b border-yellow-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              {staff.invitation_accepted ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    staff.invitation_accepted
                      ? "text-green-900"
                      : "text-yellow-900"
                  }`}
                >
                  {staff.invitation_accepted
                    ? "Invitation Accepted"
                    : "Invitation Pending"}
                </h2>
                <p
                  className={`text-sm ${
                    staff.invitation_accepted
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {staff.invitation_accepted
                    ? "This staff member has accepted the invitation and can access the system."
                    : "This staff member has not yet accepted the invitation."}
                </p>
              </div>
            </div>
          </div>

          {/* Staff Details */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-full ${
                  staff.staff_type === "resident"
                    ? "bg-green-100"
                    : "bg-blue-100"
                }`}
              >
                <UserCheck
                  className={`w-6 h-6 ${
                    staff.staff_type === "resident"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {staff.staff_name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{staff.staff_email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{staff.branch_name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Staff ID: {staff.displayId}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      staff.staff_type === "resident"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {staff.staff_type === "resident"
                      ? "Veterinary Resident"
                      : "Veterinary Assistant"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      staff.invitation_accepted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {staff.invitation_accepted ? "Active" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invitation Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Invitation Created
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(staff.created_at).toLocaleDateString()} at{" "}
                  {new Date(staff.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {staff.invitation_accepted && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Invitation Accepted
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(staff.updated_at).toLocaleDateString()} at{" "}
                    {new Date(staff.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardInvitation;
