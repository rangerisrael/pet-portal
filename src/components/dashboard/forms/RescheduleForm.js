import { XCircle, RotateCcw, Clock, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';
import { useBranches } from "@/hooks/useBranches";

export function RescheduleForm({
  appointment,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    new_date: "",
    new_time: "",
    new_branch_id: appointment?.branch_id || "",
    reason: "",
  });

  // Load branches data
  const { branches, loading: branchesLoading } = useBranches();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.new_date || !formData.new_time) {
      toast.error("Please select both new date and time");
      return;
    }

    // Check if new date/time is different from current
    if (
      formData.new_date === appointment.appointment_date &&
      formData.new_time === appointment.appointment_time
    ) {
      toast.error("Please select a different date or time");
      return;
    }

    // Check if new date is not in the past
    const newDateTime = new Date(`${formData.new_date} ${formData.new_time}`);
    const now = new Date();
    if (newDateTime <= now) {
      toast.error("Please select a future date and time");
      return;
    }

    onSubmit({
      appointmentId: appointment.id,
      oldDate: appointment.appointment_date,
      oldTime: appointment.appointment_time,
      oldBranchId: appointment.branch_id,
      newDate: formData.new_date,
      newTime: formData.new_time,
      newBranchId: formData.new_branch_id || appointment.branch_id,
      reason: formData.reason,
    });
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <RotateCcw size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reschedule Appointment
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

        {/* Current Appointment Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">Current Appointment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {appointment.branch_name && (
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {appointment.branch_name} ({appointment.branch_code})
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* New Date, Time, and Branch */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Select New Date, Time & Branch</h4>

            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Branch (Optional)
              </label>
              {branchesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                  <p className="text-gray-600">Loading branches...</p>
                </div>
              ) : (
                <select
                  value={formData.new_branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, new_branch_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Keep current branch</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.branch_id}>
                      {branch.branch_name} ({branch.branch_code}) - {branch.branch_type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Date *
                </label>
                <input
                  type="date"
                  value={formData.new_date}
                  onChange={(e) =>
                    setFormData({ ...formData, new_date: e.target.value })
                  }
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Time *
                </label>
                <input
                  type="time"
                  value={formData.new_time}
                  onChange={(e) =>
                    setFormData({ ...formData, new_time: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reason for Rescheduling */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Please provide a reason for rescheduling..."
            />
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Reschedule Policy
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    • Appointments can only be rescheduled up to 24 hours before the scheduled time<br/>
                    • A record of this change will be kept for reference<br/>
                    • Please ensure the new time is convenient for you
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20"
            >
              Reschedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}