import { XCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';

export function RejectAppointmentForm({
  appointment,
  onSubmit,
  onCancel,
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    onSubmit(appointment.id, rejectionReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reject Appointment
                </h3>
                <p className="text-sm text-gray-500">
                  {appointment.pet_name} • {appointment.appointment_type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Owner:</span>
              <span className="text-sm font-medium text-gray-900">
                {appointment.owner_first_name} {appointment.owner_last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              placeholder="Please provide a detailed reason for rejecting this appointment..."
              required
            />
          </div>

          {/* Warning Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    • This action will permanently reject the appointment<br/>
                    • The pet owner will be notified of the rejection<br/>
                    • This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              Reject Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}