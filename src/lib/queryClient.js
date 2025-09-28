import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time: how long data stays in cache when not in use (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus for important data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Background refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations up to 1 time
      retry: 1,
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  auth: {
    all: ['auth'],
    session: () => [...queryKeys.auth.all, 'session'],
    user: (userId) => [...queryKeys.auth.all, 'user', userId],
    profile: (userId) => [...queryKeys.auth.all, 'profile', userId],
  },
  pets: {
    all: ['pets'],
    list: (userId) => [...queryKeys.pets.all, 'list', userId],
    detail: (petId) => [...queryKeys.pets.all, 'detail', petId],
  },
  appointments: {
    all: ['appointments'],
    list: (userId) => [...queryKeys.appointments.all, 'list', userId],
    detail: (appointmentId) => [...queryKeys.appointments.all, 'detail', appointmentId],
  },
  billing: {
    all: ['billing'],
    invoices: (userId) => [...queryKeys.billing.all, 'invoices', userId],
    payments: (userId) => [...queryKeys.billing.all, 'payments', userId],
  },
};

export default queryClient;