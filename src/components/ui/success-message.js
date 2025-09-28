import { CheckCircle, X } from "lucide-react";

export const SuccessMessage = ({ message, onClose }) => (
  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <CheckCircle size={20} className="text-green-600" />
        <p className="text-green-800 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-green-600 hover:text-green-800 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  </div>
);
