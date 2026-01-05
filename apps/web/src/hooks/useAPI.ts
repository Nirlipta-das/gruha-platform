/**
 * GRUHA API Hooks
 * React hooks for fetching data from backend services
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { userAPI, walletAPI, bookingAPI, authAPI } from '../lib/api';

// Generic hook for API calls with loading/error states
function useAPI<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============================================
// AUTH HOOKS
// ============================================
export function useAuth() {
  const [user, setUser] = useState<{ id: string; phone: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load token and user from storage on mount
    authAPI.loadToken();
    const storedUser = authAPI.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phone: string, otp: string, sessionId: string) => {
    const response = await authAPI.verifyOTP(sessionId, otp);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const sendOTP = async (phone: string) => {
    return authAPI.sendOTP(phone);
  };

  return { user, isAuthenticated, login, logout, sendOTP };
}

// ============================================
// MSME HOOKS
// ============================================
export function useMSMEProfile(msmeId: string | null) {
  return useAPI(
    async () => {
      if (!msmeId) return null;
      const response = await userAPI.msme.getProfile(msmeId);
      return response.data;
    },
    [msmeId]
  );
}

export function useMSMEList() {
  return useAPI(
    async () => {
      const response = await userAPI.msme.list();
      return response.data;
    },
    []
  );
}

export function useMSMEWallet(msmeId: string | null) {
  return useAPI(
    async () => {
      if (!msmeId) return null;
      const response = await walletAPI.getBalance(msmeId);
      return response.data;
    },
    [msmeId]
  );
}

export function useMSMEBookings(msmeId: string | null) {
  return useAPI(
    async () => {
      if (!msmeId) return null;
      const response = await bookingAPI.getByMsme(msmeId);
      return response.data;
    },
    [msmeId]
  );
}

export function useMSMETransactions(msmeId: string | null) {
  return useAPI(
    async () => {
      if (!msmeId) return null;
      const response = await walletAPI.getTransactions(msmeId);
      return response.data;
    },
    [msmeId]
  );
}

// ============================================
// VENDOR HOOKS
// ============================================
export function useVendorProfile(vendorId: string | null) {
  return useAPI(
    async () => {
      if (!vendorId) return null;
      const response = await userAPI.vendor.getProfile(vendorId);
      return response.data;
    },
    [vendorId]
  );
}

export function useVendorList(filters?: { category?: string; district?: string }) {
  return useAPI(
    async () => {
      const response = await userAPI.vendor.list(filters);
      return response.data;
    },
    [filters?.category, filters?.district]
  );
}

export function useVendorBookings(vendorId: string | null) {
  return useAPI(
    async () => {
      if (!vendorId) return null;
      const response = await bookingAPI.getByVendor(vendorId);
      return response.data;
    },
    [vendorId]
  );
}

export function useVendorPendingBookings(vendorId: string | null) {
  return useAPI(
    async () => {
      if (!vendorId) return null;
      const response = await bookingAPI.getPendingForVendor(vendorId);
      return response.data;
    },
    [vendorId]
  );
}

export function useWarehouseSearch(params: {
  district?: string;
  state?: string;
  minCapacity?: number;
  floodSafe?: boolean;
}) {
  return useAPI(
    async () => {
      const response = await userAPI.vendor.searchWarehouses(params);
      return response.data.warehouses;
    },
    [params.district, params.state, params.minCapacity, params.floodSafe]
  );
}

// ============================================
// AUTHORITY/ADMIN HOOKS
// ============================================
export function useFlaggedTransactions() {
  return useAPI(
    async () => {
      const response = await walletAPI.getFlagged();
      return response.data;
    },
    []
  );
}

export function useDisasterAllocations(disasterId: string | null) {
  return useAPI(
    async () => {
      if (!disasterId) return null;
      const response = await walletAPI.getDisasterAllocations(disasterId);
      return response.data;
    },
    [disasterId]
  );
}

export function useBookingStats() {
  return useAPI(
    async () => {
      const response = await bookingAPI.getStats();
      return response;
    },
    []
  );
}

export function useDashboardStats() {
  return useAPI(
    async () => {
      // Aggregate stats from multiple services
      const [msmes, vendors, bookings, flagged] = await Promise.all([
        userAPI.msme.list(),
        userAPI.vendor.list(),
        bookingAPI.getStats(),
        walletAPI.getFlagged(),
      ]);

      // Use stats from booking service (completed value represents spent)
      const totalSpent = (bookings.stats?.completed || 0) * 10000; // Estimate
      const totalAllocated = (bookings.stats?.total || 0) * 15000; // Estimate

      return {
        totalMsmes: msmes.data.pagination.total,
        totalVendors: vendors.data.pagination.total,
        bookingStats: bookings.stats,
        flaggedCount: flagged.data.total,
        msmes: msmes.data.msmes,
        vendors: vendors.data.vendors,
        totalAllocated,
        totalSpent,
      };
    },
    []
  );
}

// ============================================
// BOOKING HOOKS
// ============================================
export function useBookingDetails(bookingId: string | null) {
  return useAPI(
    async () => {
      if (!bookingId) return null;
      const response = await bookingAPI.getById(bookingId);
      return response.data;
    },
    [bookingId]
  );
}

// ============================================
// ACTION HOOKS (Mutations)
// ============================================
export function useBookingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: Parameters<typeof bookingAPI.create>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptBooking = async (bookingId: string, vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.accept(bookingId, vendorId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectBooking = async (bookingId: string, vendorId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.reject(bookingId, vendorId, reason);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startService = async (bookingId: string, vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.startService(bookingId, vendorId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (bookingId: string, vendorId: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.complete(bookingId, vendorId, notes);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBooking,
    acceptBooking,
    rejectBooking,
    startService,
    completeBooking,
  };
}

export function useWalletActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocateTokens = async (data: Parameters<typeof walletAPI.allocate>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletAPI.allocate(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const spendTokens = async (data: Parameters<typeof walletAPI.spend>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletAPI.spend(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spend tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveFlagged = async (txnId: string, reviewedBy: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletAPI.approveFlagged(txnId, reviewedBy, reason);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectFlagged = async (txnId: string, reviewedBy: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletAPI.rejectFlagged(txnId, reviewedBy, reason);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    allocateTokens,
    spendTokens,
    approveFlagged,
    rejectFlagged,
  };
}
