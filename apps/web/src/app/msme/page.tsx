'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCreditCard, FiPackage, FiTruck, FiClock, FiShield, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useMSMEList, useMSMEWallet, useMSMEBookings } from '../../hooks/useAPI';

export default function MSMEDashboard() {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [selectedMsmeId, setSelectedMsmeId] = useState<string | null>(null);
  
  // Fetch MSME list (in real app, would get from auth context)
  const { data: msmeListData, loading: msmeListLoading, error: msmeListError, refetch: refetchMsmes } = useMSMEList();
  
  // Get first MSME for demo (in real app, would come from authentication)
  useEffect(() => {
    if (msmeListData?.msmes && msmeListData.msmes.length > 0 && !selectedMsmeId) {
      setSelectedMsmeId(msmeListData.msmes[0].id);
    }
  }, [msmeListData, selectedMsmeId]);
  
  // Fetch wallet data for selected MSME
  const { data: walletData, loading: walletLoading, error: walletError, refetch: refetchWallet } = useMSMEWallet(selectedMsmeId);
  
  // Fetch bookings for selected MSME
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useMSMEBookings(selectedMsmeId);

  // Loading state
  if (msmeListLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading MSME data...</p>
        </div>
      </div>
    );
  }

  // Error state - no MSMEs found
  if (msmeListError || !msmeListData?.msmes?.length) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-display font-semibold">MSME Portal</h1>
            <div className="w-20"></div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <FiAlertCircle className="w-16 h-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">No MSME Found</h2>
            <p className="text-neutral-600 mb-6">
              {msmeListError || 'You need to register as an MSME first to access the portal.'}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => refetchMsmes()}
                className="btn btn-primary w-full"
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Retry Loading
              </button>
              <Link href="/msme/register" className="btn btn-outline w-full">
                Register as MSME
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentMsme = msmeListData.msmes.find(m => m.id === selectedMsmeId) || msmeListData.msmes[0];
  
  // Parse wallet balance (comes as string from API)
  const resilienceCredits = walletData?.balance?.resilienceCredits 
    ? parseInt(walletData.balance.resilienceCredits, 10) 
    : 0;
  const reliefTokens = walletData?.balance?.reliefTokens 
    ? parseInt(walletData.balance.reliefTokens, 10) 
    : 0;

  // Parse bookings
  const bookings = bookingsData?.bookings || [];
  
  return (
    <div className={isEmergencyMode ? 'emergency-mode' : ''}>
      {/* Emergency Banner */}
      {isEmergencyMode && (
        <div className="emergency-banner">
          ⚠️ EMERGENCY MODE ACTIVE - Cyclone Alert for your region
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">MSME Portal</h1>
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`px-3 py-1 rounded-full text-sm ${
              isEmergencyMode ? 'bg-alert-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}
          >
            {isEmergencyMode ? 'Emergency' : 'Normal'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* MSME Selector (if multiple MSMEs) */}
        {msmeListData.msmes.length > 1 && (
          <div className="mb-4">
            <label className="text-sm text-neutral-500">Select Business:</label>
            <select 
              value={selectedMsmeId || ''} 
              onChange={(e) => setSelectedMsmeId(e.target.value)}
              className="ml-2 px-3 py-1 border rounded-lg"
            >
              {msmeListData.msmes.map((msme) => (
                <option key={msme.id} value={msme.id}>
                  {msme.businessName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-2">
            Welcome, {currentMsme.businessName}
          </h2>
          <p className="text-neutral-600">
            Your GRUHA ID: {currentMsme.id}
          </p>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`badge ${currentMsme.kycStatus === 'verified' ? 'bg-secondary-100 text-secondary-700' : 'bg-warning-100 text-warning-700'}`}>
              KYC: {currentMsme.kycStatus}
            </span>
            <span className={`badge ${currentMsme.riskLevel === 'low' ? 'bg-secondary-100 text-secondary-700' : 'bg-warning-100 text-warning-700'}`}>
              Risk: {currentMsme.riskLevel}
            </span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resilience Credits */}
          <div className="balance-card">
            <div className="flex items-center space-x-3 mb-4">
              <FiShield className="w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Resilience Credits</p>
                {walletLoading ? (
                  <div className="flex items-center">
                    <FiLoader className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : walletError ? (
                  <p className="text-white/70">No wallet found</p>
                ) : (
                  <p className="text-3xl font-bold">₹{resilienceCredits.toLocaleString()}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-white/70">
              Pre-disaster tokens for storage & transport
            </p>
            {walletData?.activeAllocations && walletData.activeAllocations.length > 0 && (
              <p className="text-xs text-white/50 mt-2">
                {walletData.activeAllocations.length} active allocation(s)
              </p>
            )}
          </div>

          {/* Relief Tokens */}
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FiCreditCard className="w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Relief Tokens</p>
                {walletLoading ? (
                  <div className="flex items-center">
                    <FiLoader className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : walletError ? (
                  <p className="text-white/70">No wallet found</p>
                ) : (
                  <p className="text-3xl font-bold">₹{reliefTokens.toLocaleString()}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-white/70">
              Post-disaster tokens for recovery services
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/msme/warehouse" className="btn btn-primary flex-col h-auto py-6">
            <FiPackage className="w-8 h-8 mb-2" />
            <span>Find Warehouse</span>
          </Link>
          <Link href="/msme/transport" className="btn btn-primary flex-col h-auto py-6">
            <FiTruck className="w-8 h-8 mb-2" />
            <span>Book Transport</span>
          </Link>
          <Link href="/msme/bookings" className="btn btn-outline flex-col h-auto py-6">
            <FiClock className="w-8 h-8 mb-2" />
            <span>My Bookings</span>
          </Link>
          <Link href="/msme/wallet" className="btn btn-outline flex-col h-auto py-6">
            <FiCreditCard className="w-8 h-8 mb-2" />
            <span>Wallet History</span>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-semibold">Recent Bookings</h3>
            <button 
              onClick={() => refetchBookings()}
              className="text-primary-600 hover:text-primary-700"
              title="Refresh bookings"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : bookingsError ? (
            <div className="text-center py-8">
              <FiAlertCircle className="w-8 h-8 text-warning-500 mx-auto mb-2" />
              <p className="text-neutral-500">Failed to load bookings</p>
              <button 
                onClick={() => refetchBookings()}
                className="text-primary-600 hover:underline mt-2"
              >
                Try again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <FiPackage className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No bookings yet</p>
              <p className="text-sm text-neutral-400 mt-1">
                Book a warehouse or transport to protect your inventory
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      {booking.serviceType === 'warehouse_storage' ? (
                        <FiPackage className="w-6 h-6 text-primary-600" />
                      ) : (
                        <FiTruck className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {booking.serviceType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-neutral-500">
                        ID: {booking.id.slice(0, 20)}...
                        {' · '}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{parseInt(booking.quotedAmount).toLocaleString()}</p>
                    <span className={`badge ${
                      booking.status === 'completed' ? 'bg-secondary-100 text-secondary-700' :
                      booking.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                      booking.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
              
              {bookings.length > 5 && (
                <Link 
                  href="/msme/bookings" 
                  className="block text-center text-primary-600 hover:underline py-2"
                >
                  View all {bookings.length} bookings →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* API Status Indicator */}
        <div className="mt-8 p-4 bg-neutral-100 rounded-xl">
          <h4 className="text-sm font-semibold text-neutral-600 mb-2">🔗 Live Data Status</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${msmeListError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
              User Service
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${walletError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
              Wallet Service
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${bookingsError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
              Booking Service
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
