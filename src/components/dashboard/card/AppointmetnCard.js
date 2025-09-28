import { Clock, Edit, Heart, Stethoscope, Trash2 } from "lucide-react";

export function AppointmentCard({ appointment }) {
  const statusColors = {
    confirmed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    "in-progress": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    scheduled: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    },
    urgent: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  const priorityColors = {
    routine: { bg: "bg-gray-50", text: "text-gray-600" },
    high: { bg: "bg-orange-50", text: "text-orange-600" },
    critical: { bg: "bg-red-50", text: "text-red-600" },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Heart size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">
              {appointment.pet_name}
            </h4>
            <p className="text-sm text-gray-600 font-medium">
              {appointment.owner_first_name} {appointment.owner_last_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[appointment.status].bg
            } ${statusColors[appointment.status].text} ${
              statusColors[appointment.status].border
            }`}
          >
            {appointment.status.replace("-", " ")}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              priorityColors[appointment.priority].bg
            } ${priorityColors[appointment.priority].text}`}
          >
            {appointment.priority}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock size={16} />
            <span className="font-semibold">
              {new Date(
                `2000-01-01 ${appointment.appointment_time}`
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Stethoscope size={16} />
            <span className="text-sm font-medium">
              {appointment.appointment_type
                ?.replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowEditForm(true);
            }}
            className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            <Edit size={14} className="inline mr-2" />
            Edit
          </button>
          <button
            onClick={() => deleteAppointment(appointment.id)}
            className="px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <Trash2 size={14} className="inline mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
