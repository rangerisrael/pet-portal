import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectAuth,
  selectUser,
  selectProfile,
  selectSession,
  selectIsAuthenticated,
  selectIsInitialized,
  selectUserName,
  selectUserRole,
  selectUserAvatar,
  clearAuth,
} from '@/store/slices/authSlice';
import {
  useInitializeAuth,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useUpdateProfileMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
} from '@/hooks/useAuthQueries';

export const useAuth = () => {
  // Redux selectors and dispatch
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const profile = useSelector(selectProfile);
  const session = useSelector(selectSession);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const userName = useSelector(selectUserName);
  const userRole = useSelector(selectUserRole);
  const userAvatar = useSelector(selectUserAvatar);

  // Initialize auth state
  const initAuth = useInitializeAuth();

  // Query mutations
  const signInMutation = useSignInMutation();
  const signUpMutation = useSignUpMutation();
  const signOutMutation = useSignOutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();

  // Auth actions using React Query mutations
  const login = useCallback(
    async (email, password) => {
      try {
        const result = await signInMutation.mutateAsync({ email, password });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [signInMutation]
  );

  const register = useCallback(
    async (email, password, firstName, lastName) => {
      try {
        const result = await signUpMutation.mutateAsync({
          email,
          password,
          firstName,
          lastName,
        });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [signUpMutation]
  );

  const logout = useCallback(async () => {
    console.log("🔄 useAuth logout initiated...");
    try {
      // Immediately clear Redux state for instant UI feedback
      dispatch(clearAuth());

      // Then perform the actual logout
      await signOutMutation.mutateAsync();

      console.log("✅ useAuth logout completed");
      return { success: true };
    } catch (error) {
      console.error("❌ useAuth logout error:", error);
      return { success: false, error: error.message };
    }
  }, [signOutMutation, dispatch]);

  const updateUserProfile = useCallback(
    async (profileData) => {
      try {
        const result = await updateProfileMutation.mutateAsync(profileData);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [updateProfileMutation]
  );

  const sendPasswordReset = useCallback(
    async (email) => {
      try {
        const result = await resetPasswordMutation.mutateAsync({ email });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [resetPasswordMutation]
  );

  const updatePassword = useCallback(
    async (password) => {
      try {
        const result = await updatePasswordMutation.mutateAsync({ password });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [updatePasswordMutation]
  );

  // Utility functions
  const getUserRole = useCallback(() => {
    return userRole;
  }, [userRole]);

  const getUserName = useCallback(() => {
    return userName;
  }, [userName]);

  const isRole = useCallback(
    (role) => {
      return userRole === role;
    },
    [userRole]
  );

  const hasRole = useCallback(
    (roles) => {
      return Array.isArray(roles) ? roles.includes(userRole) : roles === userRole;
    },
    [userRole]
  );

  // Loading states from mutations and initialization
  const isLoading =
    initAuth.isLoading ||
    signInMutation.isPending ||
    signUpMutation.isPending ||
    signOutMutation.isPending ||
    updateProfileMutation.isPending ||
    resetPasswordMutation.isPending ||
    updatePasswordMutation.isPending;

  // Error from mutations or initialization
  const error =
    initAuth.error ||
    signInMutation.error ||
    signUpMutation.error ||
    signOutMutation.error ||
    updateProfileMutation.error ||
    resetPasswordMutation.error ||
    updatePasswordMutation.error;

  // Clear error function
  const clearAuthError = useCallback(() => {
    // Reset mutation errors
    signInMutation.reset();
    signUpMutation.reset();
    signOutMutation.reset();
    updateProfileMutation.reset();
    resetPasswordMutation.reset();
    updatePasswordMutation.reset();
  }, [
    signInMutation,
    signUpMutation,
    signOutMutation,
    updateProfileMutation,
    resetPasswordMutation,
    updatePasswordMutation,
  ]);

  return {
    // State
    auth,
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    error: error?.message || null,
    isInitialized,
    userName,
    userRole,
    userAvatar,

    // Actions
    login,
    register,
    logout,
    updateUserProfile,
    sendPasswordReset,
    updatePassword,
    clearAuthError,

    // Utilities
    getUserRole,
    getUserName,
    isRole,
    hasRole,

    // Mutation states for granular control
    mutations: {
      signIn: {
        isPending: signInMutation.isPending,
        error: signInMutation.error,
        reset: signInMutation.reset,
      },
      signUp: {
        isPending: signUpMutation.isPending,
        error: signUpMutation.error,
        reset: signUpMutation.reset,
      },
      signOut: {
        isPending: signOutMutation.isPending,
        error: signOutMutation.error,
        reset: signOutMutation.reset,
      },
      updateProfile: {
        isPending: updateProfileMutation.isPending,
        error: updateProfileMutation.error,
        reset: updateProfileMutation.reset,
      },
      resetPassword: {
        isPending: resetPasswordMutation.isPending,
        error: resetPasswordMutation.error,
        reset: resetPasswordMutation.reset,
      },
      updatePassword: {
        isPending: updatePasswordMutation.isPending,
        error: updatePasswordMutation.error,
        reset: updatePasswordMutation.reset,
      },
    },
  };
};

// Hook for protected routes
export const useRequireAuth = (redirectTo = '/auth/login') => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  // If not initialized or loading, don't redirect yet
  if (!isInitialized || isLoading) {
    return { isLoading: true, isAuthenticated: false };
  }

  // If initialized and not authenticated, redirect
  if (isInitialized && !isAuthenticated && typeof window !== 'undefined') {
    window.location.href = redirectTo;
    return { isLoading: true, isAuthenticated: false };
  }

  return { isLoading: false, isAuthenticated };
};

// Hook for guest-only routes (login, register)
export const useRequireGuest = (redirectTo = '/dashboard') => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  // If not initialized or loading, don't redirect yet
  if (!isInitialized || isLoading) {
    return { isLoading: true, isAuthenticated: false };
  }

  // If initialized and authenticated, redirect
  if (isInitialized && isAuthenticated && typeof window !== 'undefined') {
    window.location.href = redirectTo;
    return { isLoading: true, isAuthenticated: true };
  }

  return { isLoading: false, isAuthenticated };
};

export default useAuth;