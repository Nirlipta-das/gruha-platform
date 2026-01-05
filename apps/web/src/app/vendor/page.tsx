'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck, FiX, FiTruck, FiPackage, FiDollarSign, FiClock, FiMapPin, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useVendorList, useVendorPendingBookings, useBookingActions } from '../../hooks/useAPI';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Fetch vendor list
  const { data: vendorListData, loading: vendorListLoading, error: vendorListError, refetch: refetchVendors } = useVendorList();
  
  // Get first vendor for demo (in real app, would come from authentication)
  useEffect(() => {
    if (vendorListData?.vendors && vendorListData.vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendorListData.vendors[0].id);
    }
  }, [vendorListData, selectedVendorId]);
  
  // Fetch bookings for selected vendor
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useVendorPendingBookings(selectedVendorId);
  
  // Booking actions
  const { acceptBooking, rejectBooking, startService, completeBooking } = useBookingActions();

  // Handle booking accept
  const handleAccept = async (bookingId: string) => {
    if (!selectedVendorId) return;
    setActionLoading(bookingId);
    try {
      await acceptBooking(bookingId, selectedVendorId);
      refetchBookings();
    } catch (err) {
      console.error('Failed to accept booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle booking reject
  const handleReject = async (bookingId: string) => {
    if (!selectedVendorId) return;
    setActionLoading(bookingId);
    try {
      await rejectBooking(bookingId, selectedVendorId, 'Vendor declined the booking');
      refetchBookings();
    } catch (err) {
      console.error('Failed to reject booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle start service
  const handleStart = async (bookingId: string) => {
    if (!selectedVendorId) return;
    setActionLoading(bookingId);
    try {
      await startService(bookingId, selectedVendorId);
      refetchBookings();
    } catch (err) {
      console.error('Failed to start booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle complete service
  const handleComplete = async (bookingId: string) => {
    if (!selectedVendorId) return;
    setActionLoading(bookingId);
    try {
      await completeBooking(bookingId, selectedVendorId);
      refetchBookings();
    } catch (err) {
      console.error('Failed to complete booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (vendorListLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  // Error state - no vendors found
  if (vendorListError || !vendorListData?.vendors?.length) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-display font-semibold">Vendor Portal</h1>
            <div className="w-20"></div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <FiAlertCircle className="w-16 h-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">No Vendor Found</h2>
            <p className="text-neutral-600 mb-6">
              {vendorListError || 'You need to register as a vendor first to access the portal.'}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => refetchVendors()}
                className="btn btn-primary w-full"
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Retry Loading
              </button>
              <Link href="/vendor/register" className="btn btn-outline w-full">
                Register as Vendor
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentVendor = vendorListData.vendors.find(v => v.id === selectedVendorId) || vendorListData.vendors[0];
  
  // Parse bookings by status
  const allBookings = bookingsData?.bookings || [];
  const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
  const activeBookings = allBookings.filter((b: any) => ['accepted', 'in_progress'].includes(b.status));
  const completedBookings = allBookings.filter((b: any) => b.status === 'completed');

  // Calculate stats (these would come from a real settlements API)
  const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + parseInt(b.quotedAmount || '0'), 0);
  const pendingSettlement = activeBookings.reduce((sum: number, b: any) => sum + parseInt(b.quotedAmount || '0'), 0);
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Vendor Portal</h1>
          <button 
            onClick={() => refetchBookings()}
            className="text-primary-600 hover:text-primary-700"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Vendor Selector (if multiple vendors) */}
        {vendorListData.vendors.length > 1 && (
          <div className="mb-4">
            <label className="text-sm text-neutral-500">Select Business:</label>
            <select 
              value={selectedVendorId || ''} 
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="ml-2 px-3 py-1 border rounded-lg"
            >
              {vendorListData.vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.businessName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold mb-1">
              {currentVendor.businessName}
            </h2>
            <div className="flex items-center space-x-2">
              {currentVendor.isVerified && (
                <span className="badge bg-secondary-100 text-secondary-700">
                  <FiCheck className="w-3 h-3 mr-1" /> Verified Vendor
                </span>
              )}
              <span className="text-neutral-500">ID: {currentVendor.id.slice(0, 20)}...</span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Category: {currentVendor.category?.replace(/_/g, ' ')} | Compliance: {currentVendor.complianceScore || 100}%
            </p>
          </div>
          <Link href="/vendor/warehouses" className="btn btn-primary mt-4 md:mt-0">
            Manage Warehouses
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Active Value</p>
                <p className="text-2xl font-bold">₹{pendingSettlement.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-200 rounded-xl p-1 mb-6">
          {(['pending', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && pendingBookings.length > 0 && (
                <span className="ml-2 bg-alert-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              )}
              {tab === 'active' && activeBookings.length > 0 && (
                <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State for Bookings */}
        {bookingsLoading && (
          <div className="card text-center py-12">
            <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-neutral-500">Loading bookings...</p>
          </div>
        )}

        {/* Error State for Bookings */}
        {bookingsError && !bookingsLoading && (
          <div className="card text-center py-12">
            <FiAlertCircle className="w-8 h-8 text-warning-500 mx-auto mb-2" />
            <p className="text-neutral-500">Failed to load bookings</p>
            <button 
              onClick={() => refetchBookings()}
              className="text-primary-600 hover:underline mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pending Bookings */}
        {activeTab === 'pending' && !bookingsLoading && !bookingsError && (
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="card text-center py-12">
                <FiPackage className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No pending booking requests</p>
                <p className="text-sm text-neutral-400 mt-1">New bookings from MSMEs will appear here</p>
              </div>
            ) : (
              pendingBookings.map((booking: any) => (
                <div key={booking.id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          {booking.serviceType === 'warehouse_storage' ? (
                            <FiPackage className="w-5 h-5 text-primary-600" />
                          ) : (
                            <FiTruck className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">MSME: {booking.msmeId.slice(0, 15)}...</h3>
                          <p className="text-sm text-neutral-500">
                            {booking.serviceType?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <p className="text-neutral-700 mb-2">{booking.requirements || 'No description provided'}</p>
                      <div className="flex items-center text-sm text-neutral-500 space-x-4">
                        <span className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <FiMapPin className="w-4 h-4 mr-1" />
                          Booking #{booking.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{parseInt(booking.quotedAmount || '0').toLocaleString()}
                      </p>
                      <div className="flex space-x-2">
                        <button 
                          className="btn bg-alert-500 text-white hover:bg-alert-600 py-2 px-4 disabled:opacity-50"
                          onClick={() => handleReject(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <FiX className="w-5 h-5 mr-1" />
                              Reject
                            </>
                          )}
                        </button>
                        <button 
                          className="btn btn-secondary py-2 px-4 disabled:opacity-50"
                          onClick={() => handleAccept(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <FiCheck className="w-5 h-5 mr-1" />
                              Accept
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Bookings */}
        {activeTab === 'active' && !bookingsLoading && !bookingsError && (
          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="card text-center py-12">
                <FiTruck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No active bookings</p>
                <p className="text-sm text-neutral-400 mt-1">Accept pending bookings to start serving MSMEs</p>
              </div>
            ) : (
              activeBookings.map((booking: any) => (
                <div key={booking.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">MSME: {booking.msmeId.slice(0, 15)}...</h3>
                      <p className="text-neutral-500">
                        {booking.serviceType?.replace(/_/g, ' ')} · Created {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{parseInt(booking.quotedAmount || '0').toLocaleString()}</p>
                      <span className={`badge ${
                        booking.status === 'in_progress' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'accepted' && (
                      <button 
                        className="btn btn-primary flex-1 disabled:opacity-50"
                        onClick={() => handleStart(booking.id)}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                          'Start Service'
                        )}
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <>
                        <Link href={`/vendor/bookings/${booking.id}/proof`} className="btn btn-outline flex-1">
                          Upload Proof
                        </Link>
                        <button 
                          className="btn btn-primary flex-1 disabled:opacity-50"
                          onClick={() => handleComplete(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                          ) : (
                            'Complete Service'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Completed Bookings */}
        {activeTab === 'completed' && !bookingsLoading && !bookingsError && (
          <div className="space-y-4">
            {completedBookings.length === 0 ? (
              <div className="card text-center py-12">
                <FiCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No completed bookings yet</p>
                <p className="text-sm text-neutral-400 mt-1">Completed services will appear here</p>
              </div>
            ) : (
              completedBookings.map((booking: any) => (
                <div key={booking.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">MSME: {booking.msmeId.slice(0, 15)}...</h3>
                      <p className="text-neutral-500">
                        {booking.serviceType?.replace(/_/g, ' ')} · Completed {new Date(booking.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary-600">₹{parseInt(booking.quotedAmount || '0').toLocaleString()}</p>
                      <span className="badge bg-secondary-100 text-secondary-700">
                        <FiCheck className="w-3 h-3 mr-1" /> Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* API Status Indicator */}
        <div className="mt-8 p-4 bg-neutral-100 rounded-xl">
          <h4 className="text-sm font-semibold text-neutral-600 mb-2">🔗 Live Data Status</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${vendorListError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
              User Service
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
