import React from 'react';
import { Heart, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatTime, formatEnumText, getStatusClassName } from '../../utils/formatters';
import { APPOINTMENT_STATUS_COLORS } from '../../constants/statusColors';

const AppointmentTable = ({
  appointments,
  setSelectedAppointment,
  setShowEditForm,
  deleteAppointment
}) => {
  return (
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
            {appointments.map((appointment, index) => (
              <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">
                    {formatTime(appointment.appointment_time)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(appointment.appointment_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: appointment.color_code + '20' }}
                    >
                      <Heart size={14} style={{ color: appointment.color_code }} />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {appointment.pet_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  {appointment.owner_first_name} {appointment.owner_last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  {formatEnumText(appointment.appointment_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClassName(appointment.status, APPOINTMENT_STATUS_COLORS)}`}>
                    {formatEnumText(appointment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
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
  );
};

export default AppointmentTable;