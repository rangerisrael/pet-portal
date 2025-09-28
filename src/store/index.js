import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";

// Persist configuration
const persistConfig = {
  key: "pet-portal-root",
  storage,
  whitelist: ["auth"], // Only persist auth state
  version: 1,
};

// Auth persist configuration (more specific)
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "session", "profile", "isAuthenticated", "isInitialized"],
  blacklist: ["isLoading", "error"], // Don't persist loading states and errors
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  // Add other reducers here as needed
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these paths in the state for serialization check
        ignoredPaths: [
          "auth.session.access_token",
          "auth.session.refresh_token",
        ],
      },
      // Enable Redux DevTools in development
      devTools: process.env.NODE_ENV !== "production",
    }),
  // Enhance store with additional development tools
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({
      autoBatch: false,
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (optional)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// Helper function to reset store (useful for logout)
export const resetStore = () => {
  persistor.purge();
  store.dispatch({ type: "RESET" });
};

export default store;
