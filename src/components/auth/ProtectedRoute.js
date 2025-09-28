import React from "react";
import useAuth from "@/hooks/useAuth";
import { UnauthorizedAccess, ForbiddenAccess } from "./AccessDenied";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredRoles = [],
  fallbackComponent = null,
  showForbiddenInsteadOfLogin = false
}) => {
  const { isAuthenticated, isLoading, userRole, isInitialized } = useAuth();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return <UnauthorizedAccess />;
  }

  // Check role-based access if roles are specified
  if (requiredRole || requiredRoles.length > 0) {
    const hasRequiredRole = requiredRole
      ? userRole === requiredRole
      : requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      if (showForbiddenInsteadOfLogin) {
        return (
          <ForbiddenAccess
            message={`This page is only accessible to ${requiredRole || requiredRoles.join(", ")} users.`}
            showLoginButton={false}
          />
        );
      }
      // If fallback is provided, use it
      if (fallbackComponent) {
        return fallbackComponent;
      }
      // Default to unauthorized (prompts to login with correct account)
      return (
        <UnauthorizedAccess
          message={`Please sign in with a ${requiredRole || requiredRoles.join(" or ")} account to access this page.`}
        />
      );
    }
  }

  // User is authenticated and has required permissions
  return children;
};

// HOC version for easier usage
export const withProtection = (WrappedComponent, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role-based wrappers
export const withPetOwnerAccess = (WrappedComponent) =>
  withProtection(WrappedComponent, { requiredRole: "pet-owner" });

export const withVetAccess = (WrappedComponent) =>
  withProtection(WrappedComponent, { requiredRole: "veterinarian" });

export const withMainBranchAccess = (WrappedComponent) =>
  withProtection(WrappedComponent, { requiredRole: "main-branch" });

export const withSubBranchAccess = (WrappedComponent) =>
  withProtection(WrappedComponent, { requiredRole: "sub-branch" });

export const withStaffAccess = (WrappedComponent) =>
  withProtection(WrappedComponent, {
    requiredRoles: ["veterinarian", "main-branch", "sub-branch"]
  });

export default ProtectedRoute;