'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiMapPin, FiTruck, FiShield, FiStar, FiLoader, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { useVendorList, useMSMEList } from '../../../hooks/useAPI';
import { bookingAPI } from '../../../lib/api';

export default function TransportPage() {
  const [selectedTransport, setSelectedTransport] = useState<any | null>(null);
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

  // Filter only transport vendors
  const transporters = vendorData?.vendors?.filter((v: any) => v.category === 'transport') || [];

  // Handle booking
  const handleBook = async (transporter: any) => {
    if (!selectedMsmeId) {
      setBookingResult({ success: false, message: 'No MSME selected' });
      return;
    }

    setBookingInProgress(true);
    setBookingResult(null);

    try {
      const startDate = new Date();

      const result = await bookingAPI.create({
        msmeId: selectedMsmeId,
        vendorId: transporter.id,
        serviceType: 'transport',
        description: `Transport service by ${transporter.name || 'transporter'}`,
        quotedAmount: 8000,
        tokenType: 1,
        startDate: startDate.toISOString().split('T')[0],
        quantityKg: 500,
        pickupAddress: {
          street: 'Shop Location',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
      });

      setBookingResult({ 
        success: true, 
        message: `Transport booking created! ID: ${result.data.bookingId}` 
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
          <FiLoader className="w-12 h-12 text-secondary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading transport providers from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/msme" className="flex items-center space-x-2 text-white/80 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Find Transport</h1>
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
          <span className="text-xs text-secondary-600">{transporters.length} transporters found</span>
        </div>

        {/* Booking Result Message */}
        {bookingResult && (
          <div className={`mb-4 p-4 rounded-xl ${bookingResult.success ? 'bg-secondary-50 border border-secondary-200' : 'bg-alert-50 border border-alert-200'}`}>
            <p className={bookingResult.success ? 'text-secondary-700' : 'text-alert-700'}>
              {bookingResult.message}
            </p>
          </div>
        )}

        {/* Transport List */}
        {transporters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiTruck className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">No transport providers registered yet</p>
            <p className="text-sm text-neutral-500 mt-1">Transport vendors need to register first</p>
            <p className="text-xs text-neutral-400 mt-4">
              Tip: Register a transport vendor via the API to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transporters.map((transporter: any) => (
              <div 
                key={transporter.id}
                className={`card cursor-pointer transition-all ${
                  selectedTransport?.id === transporter.id 
                    ? 'ring-2 ring-secondary-500 bg-secondary-50' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedTransport(transporter)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{transporter.name || 'Transport Provider'}</h3>
                    <p className="text-sm text-neutral-500">{transporter.category}</p>
                  </div>
                  {transporter.isVerified && (
                    <span className="flex items-center text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      <FiShield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-neutral-600">
                    <FiMapPin className="w-4 h-4 mr-2 text-neutral-400" />
                    {transporter.location?.city || 'Location not specified'}, {transporter.location?.state || ''}
                  </div>
                  
                  {transporter.vehicleType && (
                    <div className="flex items-center text-neutral-600">
                      <FiTruck className="w-4 h-4 mr-2 text-neutral-400" />
                      Vehicle: {transporter.vehicleType}
                    </div>
                  )}
                  
                  {transporter.complianceScore && (
                    <div className="flex items-center text-neutral-600">
                      <FiStar className="w-4 h-4 mr-2 text-warning-500" />
                      Score: {transporter.complianceScore}%
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 font-semibold">
                      ₹{transporter.emergencyPricing?.perKm || 15}/km
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(transporter);
                      }}
                      disabled={bookingInProgress}
                      className="btn btn-secondary btn-sm"
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

        {/* Selected Transport Details */}
        {selectedTransport && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-neutral-200 p-4 md:p-6">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTransport.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {selectedTransport.location?.city}, {selectedTransport.location?.state}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-secondary-600">
                      ₹{selectedTransport.emergencyPricing?.perKm || 15}/km
                    </p>
                    <p className="text-xs text-neutral-500">Emergency pricing active</p>
                  </div>
                  <button
                    onClick={() => handleBook(selectedTransport)}
                    disabled={bookingInProgress}
                    className="btn btn-secondary"
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
