/**
 * GRUHA API Client
 * Connects frontend to real backend services
 */

// API Base URLs - In production these would be configured via environment variables
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const WALLET_SERVICE_URL = process.env.NEXT_PUBLIC_WALLET_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost:3003';

// Token storage
let accessToken: string | null = null;

// Helper function for API calls
async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

// ============================================
// AUTH API (API Gateway - Port 3000)
// ============================================
export const authAPI = {
  /**
   * Send OTP to phone number
   */
  sendOTP: async (phone: string) => {
    return fetchAPI<{ success: boolean; data: { sessionId: string; message: string } }>(
      `${API_GATEWAY_URL}/api/v1/auth/otp/send`,
      {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }
    );
  },

  /**
   * Verify OTP and get JWT token
   */
  verifyOTP: async (sessionId: string, otp: string) => {
    const response = await fetchAPI<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: { id: string; phone: string };
      };
    }>(`${API_GATEWAY_URL}/api/v1/auth/otp/verify`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, otp }),
    });
    
    // Store the access token
    accessToken = response.data.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gruha_token', accessToken);
      localStorage.setItem('gruha_user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Load token from storage
   */
  loadToken: () => {
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('gruha_token');
      return accessToken;
    }
    return null;
  },

  /**
   * Logout
   */
  logout: () => {
    accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gruha_token');
      localStorage.removeItem('gruha_user');
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('gruha_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
};

// ============================================
// USER SERVICE API (Port 3001)
// ============================================
export const userAPI = {
  // MSME APIs
  msme: {
    /**
     * Register new MSME
     */
    register: async (data: {
      businessName: string;
      ownerName: string;
      phone: string;
      email?: string;
      udyamNumber?: string;
      address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: { lat: number; lng: number };
      };
      businessType: string;
      category?: string;
      annualTurnover?: number;
    }) => {
      return fetchAPI<{ success: boolean; data: { msme: any } }>(
        `${USER_SERVICE_URL}/api/users/msme/register`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    /**
     * Get MSME profile
     */
    getProfile: async (msmeId: string) => {
      return fetchAPI<{ success: boolean; data: any }>(
        `${USER_SERVICE_URL}/api/users/msme/profile/${msmeId}`
      );
    },

    /**
     * List all MSMEs
     */
    list: async (params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI<{
        success: boolean;
        data: {
          msmes: Array<{
            id: string;
            businessName: string;
            kycStatus: string;
            riskLevel: string;
            hasWallet: boolean;
          }>;
          pagination: { limit: number; offset: number; total: number };
        };
      }>(`${USER_SERVICE_URL}/api/users/msme/list${query ? `?${query}` : ''}`);
    },

    /**
     * Get MSME by phone
     */
    getByPhone: async (phone: string) => {
      const list = await userAPI.msme.list();
      // This is a workaround - ideally we'd have a dedicated endpoint
      return list.data.msmes.find(m => m.id.includes(phone)) || null;
    },
  },

  // Vendor APIs
  vendor: {
    /**
     * Register new vendor
     */
    register: async (data: {
      phone: string;
      category: 'warehouse' | 'transport' | 'repair_shop' | 'electrical' | 'machinery' | 'raw_material' | 'equipment' | 'power_generator' | 'temporary_shop';
      name?: string;
      businessName?: string;
      businessType?: string;
      gstNumber?: string;
      address?: string;
      district?: string;
      state?: string;
      pincode?: string;
      geoLat?: number;
      geoLng?: number;
      serviceRadiusKm?: number;
      bankAccountNumber?: string;
      bankIfsc?: string;
      bankName?: string;
      emergencyPricingAgreed?: boolean;
    }) => {
      return fetchAPI<{ success: boolean; data: { vendor: any } }>(
        `${USER_SERVICE_URL}/api/users/vendor/register`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    /**
     * Get vendor profile
     */
    getProfile: async (vendorId: string) => {
      return fetchAPI<{ success: boolean; data: any }>(
        `${USER_SERVICE_URL}/api/users/vendor/profile/${vendorId}`
      );
    },

    /**
     * List all vendors
     */
    list: async (params?: { category?: string; district?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI<{
        success: boolean;
        data: {
          vendors: Array<{
            id: string;
            name: string;
            businessName: string;
            category: string;
            district: string;
            state: string;
            complianceScore: number;
            kycStatus: string;
            isVerified: boolean;
            emergencyPricingAgreed: boolean;
          }>;
          pagination: { limit: number; offset: number; total: number };
        };
      }>(`${USER_SERVICE_URL}/api/users/vendor/list${query ? `?${query}` : ''}`);
    },

    /**
     * Search warehouses
     */
    searchWarehouses: async (params: {
      district?: string;
      state?: string;
      minCapacity?: number;
      floodSafe?: boolean;
    }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI<{ success: boolean; data: { warehouses: any[] } }>(
        `${USER_SERVICE_URL}/api/users/vendor/warehouses/search${query ? `?${query}` : ''}`
      );
    },
  },
};

// ============================================
// WALLET SERVICE API (Port 3002)
// ============================================
export const walletAPI = {
  /**
   * Get wallet balance for an MSME
   */
  getBalance: async (msmeId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        msmeId: string;
        balance: {
          resilienceCredits: string;
          reliefTokens: string;
          total: string;
        };
        activeAllocations: Array<{
          id: string;
          tokenType: string;
          amount: string;
          remaining: string;
          validUntil: string;
          categories: string[];
        }>;
        updatedAt: string;
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/${msmeId}`);
  },

  /**
   * Allocate tokens to MSME (Authority action)
   */
  allocate: async (data: {
    msmeId: string;
    disasterId: string;
    tokenType: 0 | 1; // 0=Resilience, 1=Relief
    amount: number;
    validityDays: number;
    categories: number[];
    allocatedBy: string;
  }) => {
    return fetchAPI<{
      success: boolean;
      data: {
        allocationId: string;
        msmeId: string;
        tokenType: string;
        amount: string;
        validUntil: string;
        categories: string[];
        message: string;
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/allocate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Spend tokens
   */
  spend: async (data: {
    msmeId: string;
    vendorId: string;
    amount: number;
    tokenType: 0 | 1;
    category: number;
    bookingId: string;
    description?: string;
    geoLat?: number;
    geoLng?: number;
  }) => {
    return fetchAPI<{
      success: boolean;
      data: {
        transactionId: string;
        status: string;
        fraudCheck: {
          score: number;
          flags: string[];
          action: string;
        };
        message: string;
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/spend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get transactions for an MSME
   */
  getTransactions: async (msmeId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        transactions: Array<{
          id: string;
          tokenType: string;
          category: string;
          amount: string;
          vendorId: string;
          status: string;
          createdAt: string;
        }>;
        total: number;
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/${msmeId}/transactions`);
  },

  /**
   * Get flagged transactions (Authority only)
   */
  getFlagged: async () => {
    return fetchAPI<{
      success: boolean;
      data: {
        transactions: Array<{
          id: string;
          msmeId: string;
          vendorId: string;
          tokenType: string;
          category: string;
          amount: string;
          fraudScore: number;
          fraudFlags: string[];
          createdAt: string;
        }>;
        total: number;
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/flagged`);
  },

  /**
   * Approve flagged transaction
   */
  approveFlagged: async (txnId: string, reviewedBy: string, reason: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${WALLET_SERVICE_URL}/api/wallet/flagged/${txnId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ reviewedBy, reason }),
      }
    );
  },

  /**
   * Reject flagged transaction
   */
  rejectFlagged: async (txnId: string, reviewedBy: string, reason: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${WALLET_SERVICE_URL}/api/wallet/flagged/${txnId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reviewedBy, reason }),
      }
    );
  },

  /**
   * Get allocations for a disaster
   */
  getDisasterAllocations: async (disasterId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        disasterId: string;
        allocations: any[];
        summary: {
          totalAllocated: string;
          totalRemaining: string;
          beneficiaryCount: number;
        };
      };
    }>(`${WALLET_SERVICE_URL}/api/wallet/allocations/${disasterId}`);
  },
};

// ============================================
// BOOKING SERVICE API (Port 3003)
// ============================================
export const bookingAPI = {
  /**
   * Create a new booking
   */
  create: async (data: {
    msmeId: string;
    vendorId: string;
    serviceType: string;
    description: string;
    quotedAmount: number;
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
    quantityKg?: number;
    estimatedValue?: number;
    pickupAddress?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      lat?: number;
      lng?: number;
    };
    specialInstructions?: string;
    emergencyContact?: string;
    tokenType: 0 | 1;
  }) => {
    return fetchAPI<{
      success: boolean;
      data: {
        bookingId: string;
        msmeId: string;
        vendorId: string;
        serviceType: string;
        quotedAmount: string;
        status: string;
        createdAt: string;
        message: string;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get booking by ID
   */
  getById: async (bookingId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        id: string;
        msmeId: string;
        vendorId: string;
        serviceType: string;
        description: string;
        quotedAmount: string;
        tokenType: string;
        paymentStatus: string;
        status: string;
        statusHistory: Array<{ status: string; timestamp: string; note?: string }>;
        proofsCount: number;
        createdAt: string;
        updatedAt: string;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings/${bookingId}`);
  },

  /**
   * Get bookings for an MSME
   */
  getByMsme: async (msmeId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        bookings: Array<{
          id: string;
          serviceType: string;
          vendorId: string;
          quotedAmount: string;
          status: string;
          createdAt: string;
        }>;
        total: number;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings/msme/${msmeId}`);
  },

  /**
   * Get bookings for a vendor
   */
  getByVendor: async (vendorId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        bookings: any[];
        total: number;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings/vendor/${vendorId}`);
  },

  /**
   * Get pending bookings for vendor
   */
  getPendingForVendor: async (vendorId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        bookings: any[];
        total: number;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings/vendor/${vendorId}/pending`);
  },

  /**
   * Accept a booking (Vendor action)
   */
  accept: async (bookingId: string, vendorId: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ vendorId }),
      }
    );
  },

  /**
   * Reject a booking (Vendor action)
   */
  reject: async (bookingId: string, vendorId: string, reason: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ vendorId, reason }),
      }
    );
  },

  /**
   * Start service
   */
  startService: async (bookingId: string, vendorId: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/start`,
      {
        method: 'POST',
        body: JSON.stringify({ vendorId }),
      }
    );
  },

  /**
   * Upload proof
   */
  uploadProof: async (bookingId: string, data: {
    uploadedBy: 'msme' | 'vendor';
    type: 'photo' | 'signature' | 'document';
    url: string;
  }) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/proof`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Complete booking
   */
  complete: async (bookingId: string, vendorId: string, completionNotes?: string) => {
    return fetchAPI<{ success: boolean; data: any }>(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ vendorId, completionNotes }),
      }
    );
  },

  /**
   * Get booking service info/stats
   */
  getStats: async () => {
    return fetchAPI<{
      name: string;
      version: string;
      serviceTypes: string[];
      statusFlow: string[];
      stats: {
        total: number;
        pending: number;
        active: number;
        completed: number;
      };
    }>(`${BOOKING_SERVICE_URL}/api/bookings`);
  },
};

// ============================================
// BLOCKCHAIN SERVICE API (Port 3005)
// ============================================
const BLOCKCHAIN_SERVICE_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL || 'http://localhost:3005';

export const blockchainAPI = {
  /**
   * Get blockchain service status
   */
  getStatus: async () => {
    return fetchAPI<{
      success: boolean;
      data: {
        configured: boolean;
        signerAddress: string;
        signerBalance: string;
        network: {
          chainId: number;
          name: string;
        };
      };
    }>(`${BLOCKCHAIN_SERVICE_URL}/api/blockchain/status`);
  },

  /**
   * Get blockchain statistics
   */
  getStats: async () => {
    return fetchAPI<{
      success: boolean;
      data: {
        totalMinted: string;
        totalSpent: string;
        totalMSMEs: string;
        totalVendors: string;
        totalTransactions: string;
      };
    }>(`${BLOCKCHAIN_SERVICE_URL}/api/blockchain/stats`);
  },

  /**
   * Get MSME balance from blockchain
   */
  getMSMEBalance: async (wallet: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        wallet: string;
        resilienceCredits: string;
        reliefTokens: string;
        total: string;
      };
    }>(`${BLOCKCHAIN_SERVICE_URL}/api/blockchain/msme/${wallet}/balance`);
  },

  /**
   * Get transaction details from blockchain
   */
  getTransaction: async (txId: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        id: string;
        from: string;
        to: string;
        amount: string;
        tokenType: string;
        category: string;
        timestamp: string;
        blockNumber: number;
      };
    }>(`${BLOCKCHAIN_SERVICE_URL}/api/blockchain/transaction/${txId}`);
  },

  /**
   * Verify transaction on blockchain
   */
  verifyTransaction: async (txHash: string) => {
    return fetchAPI<{
      success: boolean;
      data: {
        verified: boolean;
        blockNumber: number;
        timestamp: string;
        confirmations: number;
      };
    }>(`${BLOCKCHAIN_SERVICE_URL}/api/blockchain/verify/${txHash}`);
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  user: userAPI,
  wallet: walletAPI,
  booking: bookingAPI,
  blockchain: blockchainAPI,
};

export default api;
