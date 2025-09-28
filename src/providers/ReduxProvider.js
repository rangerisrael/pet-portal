"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store, persistor } from "@/store";
import { queryClient } from "@/lib/queryClient";
import { setSession, clearAuth } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

// Loading component for PersistGate
const PersistLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading Pet Portal...</p>
      <p className="text-sm text-gray-500 mt-2">Initializing your session</p>
    </div>
  </div>
);

// Auth redirect handler component
const AuthRedirectHandler = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a pending redirect
    const handlePendingRedirect = async () => {
      if (typeof window === "undefined") return;

      const loginRedirectPending = localStorage.getItem("loginRedirectPending");
      const userEmail = localStorage.getItem("userEmail");
      const userId = localStorage.getItem("userId");

      if (loginRedirectPending === "true" && userEmail) {
        console.log("🔄 Processing pending login redirect...");

        try {
          const redirectRoute = await authService.getLoginRedirectRoute(userEmail, userId);
          console.log("✅ Redirect route determined:", redirectRoute);

          // Clear the pending redirect flags
          localStorage.removeItem("loginRedirectPending");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");

          // Perform the redirect
          router.push(redirectRoute);
        } catch (error) {
          console.error("❌ Error determining redirect route:", error);
          // Fallback redirect
          router.push("/dashboard/pet-owner");
        }
      }
    };

    // Small delay to ensure Redux state is updated
    const timer = setTimeout(handlePendingRedirect, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return children;
};

// Auth session listener component
const AuthSessionListener = ({ children }) => {
  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      // Avoid duplicate state updates during manual login process
      const isManualLogin =
        localStorage.getItem("manualLoginInProgress") === "true";

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session && !isManualLogin) {
          // Fetch user profile data
          try {
            const { data: userData, error: userError } =
              await supabase.auth.getUser();

            if (userError) {
              console.warn("User profile not found, using basic auth data");
            }

            store.dispatch(
              setSession({
                user: session.user,
                session: session,
                profile: userData || null,
              })
            );

            // Invalidate queries to refetch with new session
            queryClient.invalidateQueries({ queryKey: ["auth"] });
          } catch (error) {
            console.error("Error fetching user profile:", error);
            store.dispatch(
              setSession({
                user: session.user,
                session: session,
                profile: null,
              })
            );
          }
        } else if (session && isManualLogin) {
          // Manual login - set session and prepare for redirect
          try {
            const { data: userData, error: userError } =
              await supabase.auth.getUser();

            store.dispatch(
              setSession({
                user: session.user,
                session: session,
                profile: userData || null,
              })
            );

            // Set redirect pending flags for the redirect handler
            localStorage.setItem("loginRedirectPending", "true");
            localStorage.setItem("userEmail", session.user.email);
            localStorage.setItem("userId", session.user.id);

            // Clear the manual login flag
            localStorage.removeItem("manualLoginInProgress");

            console.log("✅ Manual login session set, redirect will be handled");
          } catch (error) {
            console.error("Error processing manual login:", error);
            localStorage.removeItem("manualLoginInProgress");
          }
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔄 Auth provider handling SIGNED_OUT event...");

        // Clear Redux state
        store.dispatch(clearAuth());

        // Clear all React Query cache on sign out
        queryClient.clear();

        // Clear manual login flag and any other localStorage items
        if (typeof window !== "undefined") {
          localStorage.removeItem("manualLoginInProgress");
          localStorage.removeItem("loginRedirectPending");
          localStorage.removeItem("redirectRoute");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");
        }

        console.log("✅ Auth provider cleanup completed");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthRedirectHandler>
      {children}
    </AuthRedirectHandler>
  );
};

// Main Redux Provider component
const ReduxProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          <AuthSessionListener>{children}</AuthSessionListener>
        </PersistGate>
      </Provider>
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default ReduxProvider;
