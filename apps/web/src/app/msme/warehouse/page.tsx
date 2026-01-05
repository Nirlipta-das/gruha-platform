'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiMapPin, FiPackage, FiShield, FiStar, FiLoader, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { useVendorList, useMSMEList } from '../../../hooks/useAPI';
import { bookingAPI } from '../../../lib/api';

export default function WarehousePage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<any | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedMsmeId, setSelectedMsmeId] = useState<string | null>(null);

  // Fetch real vendor data
  const { data: vendorData, loading: vendorLoading, error: vendorError, refetch } = useVendorList();
  const { data: msmeData, loading: msmeLoading } = useMSMEList();

  // Set first MSME
  useEffect(() => {
    if (msmeData?.msmes && msmeData.msmes.length > 0 && !selectedMsmeId) {
      setSelectedMsmeId(msmeData.msmes[0].id);
    }
  }, [msmeData, selectedMsmeId]);

  // Filter only warehouse vendors
  const warehouses = vendorData?.vendors?.filter((v: any) => v.category === 'warehouse') || [];

  // Handle booking
  const handleBook = async (warehouse: any) => {
    if (!selectedMsmeId) {
      setBookingResult({ success: false, message: 'No MSME selected' });
      return;
    }

    setBookingInProgress(true);
    setBookingResult(null);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 15);

      const result = await bookingAPI.create({
        msmeId: selectedMsmeId,
        vendorId: warehouse.id,
        serviceType: 'warehouse_storage',
        description: `Storage at ${warehouse.name || 'warehouse'} for 15 days`,
        quotedAmount: 15000,
        tokenType: 1,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        quantityKg: 500,
      });

      setBookingResult({ 
        success: true, 
        message: `Booking created! ID: ${result.data.bookingId}` 
      });
    } catch (err: any) {
      setBookingResult({ 
        success: false, 
        message: err.message || 'Booking failed' 
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  // Loading state
  if (vendorLoading || msmeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading warehouses from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/msme" className="flex items-center space-x-2 text-white/80 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Find Warehouse</h1>
          <button onClick={() => refetch()} className="text-white/80 hover:text-white">
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* API Status */}
        <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-secondary-700 font-medium">✓ Live Data from Vendor Service API</span>
          </div>
          <span className="text-xs text-secondary-600">{warehouses.length} warehouses found</span>
        </div>

        {/* Booking Result Message */}
        {bookingResult && (
          <div className={`mb-4 p-4 rounded-xl ${bookingResult.success ? 'bg-secondary-50 border border-secondary-200' : 'bg-alert-50 border border-alert-200'}`}>
            <p className={bookingResult.success ? 'text-secondary-700' : 'text-alert-700'}>
              {bookingResult.message}
            </p>
          </div>
        )}

        {/* Warehouse List */}
        {warehouses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiPackage className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">No warehouses registered yet</p>
            <p className="text-sm text-neutral-500 mt-1">Warehouse vendors need to register first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse: any) => (
              <div 
                key={warehouse.id}
                className={`card cursor-pointer transition-all ${
                  selectedWarehouse?.id === warehouse.id 
                    ? 'ring-2 ring-primary-500 bg-primary-50' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedWarehouse(warehouse)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{warehouse.name || 'Warehouse'}</h3>
                    <p className="text-sm text-neutral-500">{warehouse.category}</p>
                  </div>
                  {warehouse.isVerified && (
                    <span className="flex items-center text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      <FiShield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-neutral-600">
                    <FiMapPin className="w-4 h-4 mr-2 text-neutral-400" />
                    {warehouse.location?.city || 'Location not specified'}, {warehouse.location?.state || ''}
                  </div>
                  
                  {warehouse.capacity && (
                    <div className="flex items-center text-neutral-600">
                      <FiPackage className="w-4 h-4 mr-2 text-neutral-400" />
                      Capacity: {warehouse.capacity} kg
                    </div>
                  )}
                  
                  {warehouse.complianceScore && (
                    <div className="flex items-center text-neutral-600">
                      <FiStar className="w-4 h-4 mr-2 text-warning-500" />
                      Score: {warehouse.complianceScore}%
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-semibold">
                      ₹{warehouse.emergencyPricing?.perKgPerDay || 3}/kg/day
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(warehouse);
                      }}
                      disabled={bookingInProgress}
                      className="btn btn-primary btn-sm"
                    >
                      {bookingInProgress ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4 mr-1" />
                          Book Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Warehouse Details */}
        {selectedWarehouse && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-neutral-200 p-4 md:p-6">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedWarehouse.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {selectedWarehouse.location?.city}, {selectedWarehouse.location?.state}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ₹{selectedWarehouse.emergencyPricing?.perKgPerDay || 3}/kg/day
                    </p>
                    <p className="text-xs text-neutral-500">Emergency pricing active</p>
                  </div>
                  <button
                    onClick={() => handleBook(selectedWarehouse)}
                    disabled={bookingInProgress}
                    className="btn btn-primary"
                  >
                    {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
