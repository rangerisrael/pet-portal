import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Package,
  Clock,
  User,
  Building2
} from "lucide-react";

const StockRequestResultModal = ({
  isOpen,
  onClose,
  result,
  type = "info" // success, error, warning, info
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "error":
        return <XCircle className="w-8 h-8 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Operation Successful";
      case "error":
        return "Operation Failed";
      case "warning":
        return "Warning";
      default:
        return "Information";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className={`p-6 border-b border-2 ${getBgColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h2 className="text-xl font-semibold text-gray-900">
                {getTitle()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Message */}
          <div className="mb-4">
            <p className="text-gray-700 text-base leading-relaxed">
              {result?.message || "Operation completed"}
            </p>
          </div>

          {/* Request Details (if available) */}
          {result?.request && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Request Details
              </h3>

              <div className="space-y-2 text-sm">
                {result.request.request_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request #:</span>
                    <span className="font-medium text-gray-900">
                      {result.request.request_number}
                    </span>
                  </div>
                )}

                {result.request.inventory_items?.item_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium text-gray-900">
                      {result.request.inventory_items.item_name}
                    </span>
                  </div>
                )}

                {result.request.requested_quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium text-gray-900">
                      {result.request.requested_quantity} {result.request.inventory_items?.unit_of_measure || 'units'}
                    </span>
                  </div>
                )}

                {result.request.approved_quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium text-gray-900">
                      {result.request.approved_quantity} {result.request.inventory_items?.unit_of_measure || 'units'}
                    </span>
                  </div>
                )}

                {result.request.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                      result.request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      result.request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      result.request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      result.request.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.request.status}
                    </span>
                  </div>
                )}

                {result.request.requesting_branch?.branch_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      From:
                    </span>
                    <span className="font-medium text-gray-900">
                      {result.request.requesting_branch.branch_name}
                    </span>
                  </div>
                )}

                {result.request.target_branch?.branch_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      To:
                    </span>
                    <span className="font-medium text-gray-900">
                      {result.request.target_branch.branch_name}
                    </span>
                  </div>
                )}

                {result.request.urgency_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                      result.request.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                      result.request.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {result.request.urgency_level}
                    </span>
                  </div>
                )}

                {result.request.requested_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Requested:
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(result.request.requested_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {result.request.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Notes:</span>
                    <p className="text-gray-900 text-sm mt-1 italic">
                      "{result.request.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Details (if error) */}
          {type === "error" && result?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Error Details</h4>
              <p className="text-red-700 text-sm">{result.error}</p>
            </div>
          )}

          {/* Next Steps (if success) */}
          {type === "success" && result?.nextSteps && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Next Steps</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${getButtonColor()}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockRequestResultModal;