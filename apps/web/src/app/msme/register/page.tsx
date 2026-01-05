'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiBriefcase, FiCheck, FiLoader } from 'react-icons/fi';
import { userAPI } from '../../../lib/api';

interface RegistrationForm {
  businessName: string;
  ownerName: string;
  phone: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function MSMERegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState<RegistrationForm>({
    businessName: '',
    ownerName: '',
    phone: '',
    businessType: 'Retail Trade',
    address: {
      street: '',
      city: '',
      state: 'Odisha',
      pincode: '',
    },
  });

  const businessTypes = [
    'Retail Trade',
    'Manufacturing',
    'Food Processing',
    'Textiles',
    'Handicrafts',
    'Services',
    'Agriculture',
    'Other',
  ];

  const states = [
    'Odisha', 'West Bengal', 'Andhra Pradesh', 'Bihar', 'Gujarat',
    'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu',
    'Uttar Pradesh', 'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await userAPI.msme.register(form);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/msme');
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please check your connection and try again.');
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
          <p className="text-neutral-600 mb-4">Welcome to GRUHA. Redirecting to your dashboard...</p>
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
          <Link href="/msme" className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">MSME Registration</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-display font-bold">Register Your Business</h2>
              <p className="text-neutral-600 mt-2">Join GRUHA for climate resilience protection</p>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FiBriefcase className="inline w-4 h-4 mr-1" />
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Krishna Grocery Store"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Krishna Kumar"
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

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Type *
                </label>
                <select
                  required
                  value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Business Address
                </label>
                
                <input
                  type="text"
                  value={form.address.street}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Street Address"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={form.address.city}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City *"
                  />
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={form.address.pincode}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Pincode *"
                  />
                </div>

                <select
                  required
                  value={form.address.state}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Business'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              By registering, you agree to GRUHA's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
