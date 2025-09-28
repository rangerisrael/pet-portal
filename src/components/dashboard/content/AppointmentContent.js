import {
  Calendar,
  Heart,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  RotateCcw,
  MapPin,
  Check,
  X,
  Eye,
} from "lucide-react";

const AppointmentsContent = ({
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  setShowCreateForm,
  setSelectedAppointment,
  setShowEditForm,
  setShowRescheduleForm,
  setShowRejectForm,
  setShowDetailsModal,
  deleteAppointment,
  approveAppointment,
  appointmentsData,
  role = "pet-owner",
}) => {
  // Check if appointment can be rescheduled (24 hours before)
  const canReschedule = (appointment) => {
    if (
      appointment.status === "cancelled" ||
      appointment.status === "completed"
    ) {
      return false;
    }

    const appointmentDateTime = new Date(
      `${appointment.appointment_date} ${appointment.appointment_time}`
    );
    const now = new Date();
    const hoursUntilAppointment =
      (appointmentDateTime - now) / (1000 * 60 * 60);

    return hoursUntilAppointment > 24;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Appointment Management
          </h3>
          <p className="text-gray-600 mt-1">
            Schedule and track all patient appointments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm w-48"
          />

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold shadow-lg shadow-orange-600/20"
          >
            <Plus size={16} />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointmentsData.map((appointment, index) => (
                <tr
                  key={appointment.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      {new Date(
                        `2000-01-01 ${appointment.appointment_time}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: appointment.color_code + "20",
                        }}
                      >
                        <Heart
                          size={14}
                          style={{ color: appointment.color_code }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {appointment.pet_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                    {appointment.owner_first_name} {appointment.owner_last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.branch_name ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin size={12} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.branch_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.branch_code} •{" "}
                            {appointment.branch_type
                              ?.replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No branch assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                    {appointment.appointment_type
                      ?.replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : appointment.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "scheduled"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View appointment details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Vet-owner specific actions */}
                      {role === "vet-owner" &&
                        appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() => approveAppointment(appointment.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve appointment"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowRejectForm(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject appointment"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}

                      {canReschedule(appointment) && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRescheduleForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reschedule appointment"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowEditForm(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit appointment"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {appointmentsData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No appointments found</p>
          <p>Try adjusting your filters or schedule a new appointment.</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsContent;
