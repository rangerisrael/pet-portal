import React, { useState } from "react";
import {
  X,
  XCircle,
  AlertTriangle,
  Package,
  Building2,
  Clock,
  User
} from "lucide-react";

const StockRequestRejectionModal = ({
  isOpen,
  onClose,
  onSubmit,
  request
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(request.id, reason.trim());
      // Reset form and close modal
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error submitting rejection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Reject Stock Request
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1 hover:bg-red-200 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Request Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Request Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Request #:</span>
                <span className="font-medium text-gray-900">
                  {request.request_number}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium text-gray-900">
                  {request.inventory_items?.item_name || 'Unknown Item'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">
                  {request.requested_quantity} {request.inventory_items?.unit_of_measure || 'units'}
                </span>
              </div>

              {request.requesting_branch?.branch_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    From:
                  </span>
                  <span className="font-medium text-gray-900">
                    {request.requesting_branch.branch_name}
                  </span>
                </div>
              )}

              {request.urgency_level && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                    request.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                    request.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgency_level}
                  </span>
                </div>
              )}

              {request.requested_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Requested:
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {request.reason && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">Original Reason:</span>
                  <p className="text-gray-900 text-sm mt-1 italic">
                    "{request.reason}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                  Confirm Rejection
                </h4>
                <p className="text-yellow-700 text-sm">
                  This action will reject the stock request and notify the requesting branch.
                  Please provide a clear reason for the rejection.
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why this request is being rejected..."
                required
                rows={4}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be shared with the requesting branch
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockRequestRejectionModal;