import { AlertCircle, X } from "lucide-react";

export const ErrorMessage = ({ message, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertCircle size={20} className="text-red-600" />
        <p className="text-red-800 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  </div>
);
