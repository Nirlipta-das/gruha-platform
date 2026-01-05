'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiPackage, FiTruck, FiCheck, FiLoader, FiDollarSign } from 'react-icons/fi';
import { gruhaAPI } from '../../../lib/api';

interface VendorRegistrationForm {
  name: string;
  businessName: string;
  phone: string;
  category: string;
  emergencyPricingAgreed: boolean;
  district: string;
  state: string;
  pincode: string;
}

export default function VendorRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState<VendorRegistrationForm>({
    name: '',
    businessName: '',
    phone: '',
    category: 'warehouse',
    emergencyPricingAgreed: false,
    district: '',
    state: 'Odisha',
    pincode: '',
  });

  const categories = [
    { value: 'warehouse', label: 'Warehouse / Storage', icon: FiPackage },
    { value: 'transport', label: 'Transport / Logistics', icon: FiTruck },
    { value: 'repair', label: 'Repair Services', icon: FiUser },
    { value: 'equipment', label: 'Equipment Rental', icon: FiUser },
    { value: 'materials', label: 'Raw Materials', icon: FiPackage },
  ];

  const states = [
    'Odisha', 'West Bengal', 'Andhra Pradesh', 'Bihar', 'Gujarat',
    'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu',
    'Uttar Pradesh', 'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.emergencyPricingAgreed) {
      setError('You must agree to emergency pricing caps to register as a GRUHA vendor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await gruhaAPI.vendor.register(form);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/vendor');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-success-600" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Registration Successful!</h2>
          <p className="text-neutral-600 mb-4">Welcome to GRUHA Vendor Network. Redirecting...</p>
          <FiLoader className="w-6 h-6 text-primary-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/vendor" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Vendor Registration</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-display font-bold">Join Vendor Network</h2>
              <p className="text-neutral-600 mt-2">Provide services to MSMEs during disasters</p>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Service Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        form.category === cat.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <cat.icon className={`w-6 h-6 mb-2 ${
                        form.category === cat.value ? 'text-primary-600' : 'text-neutral-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        form.category === cat.value ? 'text-primary-700' : 'text-neutral-700'
                      }`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Ramesh Patel"
                />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., SafeStore Warehouse Pvt Ltd"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FiPhone className="inline w-4 h-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 9876543210"
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Service Location
                </label>
                
                <input
                  type="text"
                  required
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="District *"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Pincode *"
                  />
                </div>
              </div>

              {/* Emergency Pricing Agreement */}
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="emergencyPricing"
                    checked={form.emergencyPricingAgreed}
                    onChange={(e) => setForm({ ...form, emergencyPricingAgreed: e.target.checked })}
                    className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="emergencyPricing" className="ml-3 text-sm">
                    <span className="font-medium text-warning-800">Emergency Pricing Agreement *</span>
                    <p className="text-warning-700 mt-1">
                      I agree to cap my prices during declared disasters as per GRUHA guidelines. 
                      This ensures fair pricing for MSMEs during emergencies and is required for vendor verification.
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !form.emergencyPricingAgreed}
                className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register as Vendor'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              By registering, you agree to GRUHA's Vendor Terms and Emergency Pricing Guidelines
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
