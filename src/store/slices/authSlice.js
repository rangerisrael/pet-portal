import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set the complete authentication state
    setAuthState: (state, action) => {
      const { user, session, profile } = action.payload;
      state.user = user;
      state.session = session;
      state.profile = profile;
      state.isAuthenticated = !!user;
      state.isInitialized = true;
    },

    // Set only the session
    setSession: (state, action) => {
      const { user, session, profile } = action.payload;
      state.user = user;
      state.session = session;
      state.profile = profile;
      state.isAuthenticated = !!user;
      state.isInitialized = true;
    },

    // Update only the profile
    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    // Clear all authentication data
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },

    // Set initialization status
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },

    // Update user data
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Reset auth state to initial
    resetAuth: () => initialState,
  },
});

export const {
  setAuthState,
  setSession,
  setProfile,
  clearAuth,
  setInitialized,
  updateUser,
  resetAuth,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectProfile = (state) => state.auth.profile;
export const selectSession = (state) => state.auth.session;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;

// Computed selectors
export const selectUserName = (state) => {
  const { user, profile } = state.auth;
  return (
    profile?.name ||
    profile?.first_name + " " + profile?.last_name ||
    user?.user_metadata?.first_name + " " + user?.user_metadata?.last_name ||
    user?.email?.split("@")[0] ||
    "User"
  );
};

export const selectUserRole = (state) => {
  const { user, profile } = state.auth;
  return profile?.role || user?.user_metadata?.role || "user";
};

export const selectUserAvatar = (state) => {
  const { user, profile } = state.auth;
  return profile?.avatar_url || user?.user_metadata?.avatar_url;
};

export default authSlice.reducer;
