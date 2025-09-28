import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "@/services/authService";
import { queryKeys } from "@/lib/queryClient";
import {
  setAuthState,
  setProfile,
  clearAuth,
  setInitialized,
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
} from "@/store/slices/authSlice";

// Hook to get current session
export const useSessionQuery = (enabled = true) => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  const query = useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: authService.getSession,
    enabled: enabled && !isInitialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Handle query state changes with useEffect
  React.useEffect(() => {
    if (query.isSuccess) {
      const session = query.data;
      if (session) {
        dispatch(
          setAuthState({
            user: session.user,
            session: session,
            profile: null, // Will be fetched separately
          })
        );
      } else {
        dispatch(clearAuth());
      }
      dispatch(setInitialized(true));
    } else if (query.isError) {
      console.error("Session query error:", query.error);
      dispatch(clearAuth());
      dispatch(setInitialized(true));
    }
  }, [query.isSuccess, query.isError, query.data, query.error, dispatch]);

  return query;
};

// Hook to get user profile
export const useUserProfileQuery = (userId, enabled = true) => {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: () => authService.getUserProfile(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Handle query state changes
  React.useEffect(() => {
    if (query.isSuccess && query.data) {
      dispatch(setProfile(query.data));
    } else if (query.isError) {
      console.log("Profile query error:", query.error);
    }
  }, [query.isSuccess, query.isError, query.data, query.error, dispatch]);

  return query;
};

// Hook for sign in mutation
// Hook for sign in mutation
export const useSignInMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.signInWithEmail,
    onSuccess: () => {
      // // Update query cache
      // queryClient.setQueryData(queryKeys.auth.session(), session);

      // if (user?.id) {
      //   // Cache the profile data (prefer explicit profile over user_metadata)
      //   const profileData = profile || user.user_metadata;
      //   queryClient.setQueryData(queryKeys.auth.profile(user.id), profileData);
      // }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: "user-auth" });
    },
  });

  return mutation;
};

// Hook for sign up mutation
export const useSignUpMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signUpWithEmail,
    onSuccess: (data) => {
      const { user, session } = data;

      if (session) {
        // User is confirmed and signed in
        dispatch(setAuthState({ user, session, profile: null }));
        queryClient.setQueryData(queryKeys.auth.session(), session);
      }

      // Return data for component to handle
      return data;
    },
    onError: (error) => {
      console.log("Sign up error:", error);
      throw error;
    },
  });
};

// Hook for sign out mutation
export const useSignOutMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      console.log("🔄 Sign out mutation successful, cleaning up...");

      // Clear Redux state
      dispatch(clearAuth());

      // Clear all query cache
      queryClient.clear();

      // Reset specific auth queries
      queryClient.setQueryData(queryKeys.auth.session(), null);

      console.log("✅ Auth state cleanup completed");
    },
    onError: (error) => {
      console.error("❌ Sign out mutation error:", error);

      // Still clean up state even on error
      dispatch(clearAuth());
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.session(), null);
    },
  });

  return mutation;
};

// Hook for update profile mutation
export const useUpdateProfileMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation({
    mutationFn: (profileData) =>
      authService.updateProfile({
        userId: user?.id,
        profileData,
      }),
    onSuccess: (updatedProfile) => {
      // Update Redux state
      dispatch(setProfile(updatedProfile));

      // Update query cache
      if (user?.id) {
        queryClient.setQueryData(
          queryKeys.auth.profile(user.id),
          updatedProfile
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile(user?.id),
      });
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      throw error;
    },
  });
};

// Hook for reset password mutation
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
    onError: (error) => {
      console.error("Reset password error:", error);
      throw error;
    },
  });
};

// Hook for update password mutation
export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: authService.updatePassword,
    onError: (error) => {
      console.error("Update password error:", error);
      throw error;
    },
  });
};

// Hook to initialize authentication state
export const useInitializeAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  // Fetch session if not initialized
  const sessionQuery = useSessionQuery(!isInitialized);

  // Fetch profile if user exists but no profile query is running
  const profileQuery = useUserProfileQuery(
    user?.id,
    isAuthenticated && !!user?.id
  );

  return {
    isLoading:
      sessionQuery.isLoading || (isAuthenticated && profileQuery.isLoading),
    isError: sessionQuery.isError || profileQuery.isError,
    error: sessionQuery.error || profileQuery.error,
    isInitialized,
  };
};
