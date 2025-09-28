import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  type = 'warning', // 'warning', 'danger', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white'
        };
      case 'info':
        return {
          icon: Check,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmText: 'text-white'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${styles.iconBg} rounded-lg`}>
              <Icon size={24} className={styles.iconColor} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBg} ${styles.confirmText}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;