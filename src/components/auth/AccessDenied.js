"use client";

import React from "react";
import { Shield, Home, LogIn, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const AccessDenied = ({
  type = "unauthorized", // "unauthorized", "forbidden", "notFound"
  title,
  message,
  showHomeButton = true,
  showLoginButton = true,
  customAction,
}) => {
  const router = useRouter();

  const configs = {
    unauthorized: {
      icon: Shield,
      title: "Access Denied",
      message: "You need to sign in to access this page.",
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    forbidden: {
      icon: AlertTriangle,
      title: "Forbidden",
      message: "You don't have permission to access this resource.",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    notFound: {
      icon: AlertTriangle,
      title: "Page Not Found",
      message: "The page you're looking for doesn't exist or has been moved.",
      iconColor: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const config = configs[type] || configs.unauthorized;
  const IconComponent = config.icon;

  const handleGoHome = () => {
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-20 h-20 ${config.bgColor} ${config.borderColor} border-2 rounded-full mb-6`}
          >
            <IconComponent size={40} className={config.iconColor} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title || config.title}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message || config.message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {customAction && (
              <button
                onClick={customAction.onClick}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2"
              >
                {customAction.icon && <customAction.icon size={18} />}
                <span>{customAction.label}</span>
              </button>
            )}

            {showLoginButton && type === "unauthorized" && (
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}

            {showHomeButton && (
              <button
                onClick={handleGoHome}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Home size={18} />
                <span>Go Home</span>
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact support or check your permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pre-configured variants for common use cases
export const UnauthorizedAccess = (props) => (
  <AccessDenied type="unauthorized" {...props} />
);

export const ForbiddenAccess = (props) => (
  <AccessDenied type="forbidden" {...props} />
);

export const PageNotFound = (props) => (
  <AccessDenied type="notFound" showLoginButton={false} {...props} />
);

export default AccessDenied;
