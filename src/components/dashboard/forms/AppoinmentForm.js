import { Plus, XCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';
import { useBranches } from "@/hooks/useBranches";

// Appointment Form Component
export function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  isEdit = false,
  pets,
  colorPalette,
  selectedColor,
  setSelectedColor,
  setShowPetForm,
  preSelectedPet = null,
  appointments = [],
}) {
  const [formData, setFormData] = useState({
    pet_id: appointment?.pet_id || preSelectedPet?.id || "",
    branch_id: appointment?.branch_id || "",
    appointment_date: appointment?.appointment_date || "",
    appointment_time: appointment?.appointment_time || "",
    appointment_type: appointment?.appointment_type || "annual_checkup",
    priority: appointment?.priority || "routine",
    reason_for_visit: appointment?.reason_for_visit || "",
    symptoms: appointment?.symptoms || "",
    notes: appointment?.notes || "",
    estimated_cost: appointment?.estimated_cost || "",
    duration_minutes: appointment?.duration_minutes || 30,
  });

  // Load branches data
  const { branches, loading: branchesLoading } = useBranches();

  // Helper function to check if pet has active appointments
  const getPetStatus = (petId) => {
    const activeStatuses = ['scheduled', 'confirmed', 'in_progress'];
    const activeAppointments = appointments.filter(
      apt => apt.pet_id === petId && activeStatuses.includes(apt.status?.toLowerCase())
    );
    return {
      hasActiveAppointment: activeAppointments.length > 0,
      activeAppointment: activeAppointments[0],
      isAvailable: activeAppointments.length === 0
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.pet_id ||
      !formData.branch_id ||
      !formData.appointment_date ||
      !formData.appointment_time ||
      !formData.reason_for_visit
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  const appointmentTypes = [
    { value: "annual_checkup", label: "Annual Checkup" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgical_consultation", label: "Surgical Consultation" },
    { value: "emergency_care", label: "Emergency Care" },
    { value: "dental_care", label: "Dental Care" },
    { value: "grooming", label: "Grooming" },
    { value: "behavioral_consultation", label: "Behavioral Consultation" },
    { value: "follow_up", label: "Follow-up" },
    { value: "diagnostic", label: "Diagnostic" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Appointment" : preSelectedPet ? `Schedule Appointment for ${preSelectedPet.name}` : "Schedule New Appointment"}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-gray-50 space-y-6">
          {/* Pet Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Pet Selection
            </h4>
            {preSelectedPet && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">Booking appointment for:</span> {preSelectedPet.name}
                  {preSelectedPet.species && ` (${preSelectedPet.species.charAt(0).toUpperCase() + preSelectedPet.species.slice(1)})`}
                  {preSelectedPet.breed && ` - ${preSelectedPet.breed}`}
                </p>
              </div>
            )}

            {/* Pet Availability Info */}
            {pets && pets.length > 0 && !isEdit && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-semibold">Pet Availability:</span>
                </p>
                <div className="space-y-1">
                  {pets.map((pet) => {
                    const petStatus = getPetStatus(pet.id);
                    return (
                      <div key={pet.id} className="flex justify-between text-xs">
                        <span className="text-blue-700">{pet.name}</span>
                        <span className={petStatus.isAvailable ? "text-green-600" : "text-orange-600"}>
                          {petStatus.isAvailable ? "Available" : "Has active appointment"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Pet *
              </label>
              {pets?.length === 0 ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                  <p className="text-gray-600 mb-3">
                    You haven't added any pets yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPetForm && setShowPetForm(true)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Pet
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={formData.pet_id}
                    onChange={(e) =>
                      setFormData({ ...formData, pet_id: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  >
                    <option value="">Choose a pet</option>
                    {pets?.map((pet) => {
                      const petStatus = getPetStatus(pet.id);
                      return (
                        <option
                          key={pet.id}
                          value={pet.id}
                          disabled={!isEdit && petStatus.hasActiveAppointment}
                        >
                          {pet.name} (
                          {pet.species.charAt(0).toUpperCase() +
                            pet.species.slice(1)}
                          ){pet.breed && ` - ${pet.breed}`}
                          {petStatus.hasActiveAppointment && " - Has Active Appointment"}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowPetForm && setShowPetForm(true)}
                    className="w-full px-3 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                  >
                    <Plus size={14} className="inline mr-2" />
                    Add Another Pet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Branch Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
              <MapPin size={20} className="mr-2 text-orange-600" />
              Clinic Branch
            </h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Branch *
              </label>
              {branchesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                  <p className="text-gray-600">Loading branches...</p>
                </div>
              ) : branches?.length === 0 ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                  <p className="text-gray-600">No branches available</p>
                </div>
              ) : (
                <select
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                >
                  <option value="">Choose a branch</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.branch_id}>
                      {branch.branch_name} ({branch.branch_code}) - {branch.branch_type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Appointment Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_date: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appointment Type and Priority */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Service Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={formData.appointment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="routine">Routine</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Visit Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.reason_for_visit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reason_for_visit: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Describe the reason for this appointment..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Symptoms (if any)
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Describe any symptoms..."
                />
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Customization
            </h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Color
              </label>
              <div className="flex space-x-2">
                {colorPalette?.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.hex_code)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color.hex_code
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.hex_code }}
                    title={color.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20"
            >
              {isEdit ? "Update Appointment" : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
