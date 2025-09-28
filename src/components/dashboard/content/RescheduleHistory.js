import { Calendar, Clock, User, MessageSquare, History } from "lucide-react";
import { useRescheduleHistory } from "@/hooks/useRescheduleHistory";

export function RescheduleHistory({ appointmentId, className = "" }) {
  const { rescheduleHistory, loading } = useRescheduleHistory(appointmentId);

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <History size={16} className="text-gray-500" />
          <h4 className="font-semibold text-gray-700">Reschedule History</h4>
        </div>
        <p className="text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (!rescheduleHistory || rescheduleHistory.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <History size={16} className="text-gray-500" />
          <h4 className="font-semibold text-gray-700">Reschedule History</h4>
        </div>
        <p className="text-sm text-gray-500">No reschedule history available.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <History size={16} className="text-blue-600" />
        <h4 className="font-semibold text-gray-900">Reschedule History</h4>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
          {rescheduleHistory.length} {rescheduleHistory.length === 1 ? 'change' : 'changes'}
        </span>
      </div>

      <div className="space-y-4">
        {rescheduleHistory.map((record, index) => (
          <div key={record.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">
                    {rescheduleHistory.length - index}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Reschedule #{rescheduleHistory.length - index}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(record.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* From/To Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {/* From */}
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <h5 className="text-xs font-semibold text-red-800 mb-2 uppercase tracking-wide">From</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar size={12} className="text-red-600" />
                    <span className="text-sm text-red-700">
                      {new Date(record.old_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={12} className="text-red-600" />
                    <span className="text-sm text-red-700">
                      {new Date(`2000-01-01 ${record.old_time}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* To */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <h5 className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">To</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar size={12} className="text-green-600" />
                    <span className="text-sm text-green-700">
                      {new Date(record.new_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={12} className="text-green-600" />
                    <span className="text-sm text-green-700">
                      {new Date(`2000-01-01 ${record.new_time}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            {record.reason && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare size={12} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Reason</span>
                </div>
                <p className="text-sm text-gray-700">{record.reason}</p>
              </div>
            )}

            {/* Rescheduled By */}
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
              <User size={12} className="text-gray-500" />
              <span className="text-xs text-gray-600">
                Rescheduled by: {record.rescheduled_by_user?.raw_user_meta_data?.first_name} {record.rescheduled_by_user?.raw_user_meta_data?.last_name}
                {!record.rescheduled_by_user?.raw_user_meta_data?.first_name && (
                  <span className="text-gray-500">({record.rescheduled_by_user?.email})</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}