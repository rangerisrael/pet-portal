import { XCircle, Calendar, Clock, MapPin, Heart, User, FileText, DollarSign, Timer } from "lucide-react";
import { RescheduleHistory } from "@/components/dashboard/content/RescheduleHistory";

export function AppointmentDetailsModal({
  appointment,
  onClose,
}) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: appointment.color_code + "20" }}
              >
                <Heart
                  size={24}
                  style={{ color: appointment.color_code }}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Appointment Details
                </h3>
                <p className="text-sm text-gray-500">
                  {appointment.pet_name} • {appointment.appointment_type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet & Owner Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User size={16} className="mr-2 text-orange-600" />
                Pet & Owner Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pet Name:</span>
                  <span className="text-sm font-medium text-gray-900">{appointment.pet_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Owner:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.owner_first_name} {appointment.owner_last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    appointment.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-800"
                      : appointment.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : appointment.status === "scheduled"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {appointment.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Schedule */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar size={16} className="mr-2 text-blue-600" />
                Schedule Information
              </h4>
              <div className="space-y-2">
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
                {appointment.duration_minutes && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {appointment.duration_minutes} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Branch Information */}
          {appointment.branch_name && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin size={16} className="mr-2 text-blue-600" />
                Branch Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600 block">Branch Name:</span>
                  <span className="text-sm font-medium text-gray-900">{appointment.branch_name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 block">Code:</span>
                  <span className="text-sm font-medium text-gray-900">{appointment.branch_code}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 block">Type:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.branch_type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Service Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText size={16} className="mr-2 text-green-600" />
              Service Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">Service Type:</span>
                <span className="text-sm font-medium text-gray-900">
                  {appointment.appointment_type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">Priority:</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  appointment.priority === "critical"
                    ? "bg-red-100 text-red-800"
                    : appointment.priority === "high"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {appointment.priority}
                </span>
              </div>
              {appointment.estimated_cost && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Estimated Cost:</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <DollarSign size={12} className="mr-1" />
                    {appointment.estimated_cost}
                  </span>
                </div>
              )}
            </div>

            {appointment.reason_for_visit && (
              <div className="mt-4">
                <span className="text-sm text-gray-600 block mb-1">Reason for Visit:</span>
                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                  {appointment.reason_for_visit}
                </p>
              </div>
            )}

            {appointment.symptoms && (
              <div className="mt-4">
                <span className="text-sm text-gray-600 block mb-1">Symptoms:</span>
                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                  {appointment.symptoms}
                </p>
              </div>
            )}

            {appointment.notes && (
              <div className="mt-4">
                <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Rejection Reason (if applicable) */}
          {appointment.status === "cancelled" && appointment.rejection_reason && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h4 className="font-semibold text-red-900 mb-3">Rejection Reason</h4>
              <p className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-200">
                {appointment.rejection_reason}
              </p>
            </div>
          )}

          {/* Reschedule History */}
          <RescheduleHistory appointmentId={appointment.id} />

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block">Created:</span>
                <span className="text-gray-900">
                  {new Date(appointment.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {appointment.updated_at && appointment.updated_at !== appointment.created_at && (
                <div>
                  <span className="text-gray-600 block">Last Updated:</span>
                  <span className="text-gray-900">
                    {new Date(appointment.updated_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-all duration-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}