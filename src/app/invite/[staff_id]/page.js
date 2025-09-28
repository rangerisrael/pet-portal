"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader, UserCheck, Mail, MapPin, Clock } from "lucide-react";

const InvitationLink = () => {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staff_id;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null); // 'success', 'error', 'already_accepted'

  useEffect(() => {
    if (staffId) {
      fetchStaffInfo();
    }
  }, [staffId]);

  const fetchStaffInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accept-invitation?staff_id=${staffId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch staff information');
      }

      setStaff(data.staff);

      // If already accepted, redirect immediately
      if (data.staff.invitation_accepted) {
        setStatus('already_accepted');
        setTimeout(() => {
          router.push('/dashboard/invitation?staff_id=' + staffId);
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: staffId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setStatus('success');
      setStaff(data.staff);

      // Redirect to dashboard invitation page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/invitation?staff_id=' + staffId);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const declineInvitation = () => {
    // For now, just show a decline message
    setStatus('declined');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Invitation Accepted!
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome to the team! You will be redirected to the dashboard shortly.
          </p>
          <div className="animate-pulse text-blue-600">
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'already_accepted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Already Accepted
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation has already been accepted. Redirecting to dashboard...
          </p>
          <div className="animate-pulse text-blue-600">
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Invitation Declined
          </h1>
          <p className="text-gray-600 mb-6">
            You have declined this invitation.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            Veterinary Staff Invitation
          </h1>
          <p className="text-blue-100">
            You have been invited to join our veterinary team
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {staff && (
            <>
              {/* Staff Info Card */}
              <div className="text-center mb-6">
                <div className={`p-4 rounded-full mx-auto mb-4 w-20 h-20 flex items-center justify-center ${
                  staff.staff_type === 'resident' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <UserCheck className={`w-10 h-10 ${
                    staff.staff_type === 'resident' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {staff.staff_name}
                </h2>
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
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{staff.staff_email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{staff.branch_name}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Staff ID: {staff.displayId}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={declineInvitation}
                  disabled={processing}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={acceptInvitation}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <span>Accept Invitation</span>
                  )}
                </button>
              </div>

              {/* Terms */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By accepting this invitation, you agree to join the veterinary team and
                  gain access to the portal systems.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationLink;