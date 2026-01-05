'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userAPI, walletAPI, bookingAPI } from '../../lib/api';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const testAPIs = async () => {
    setLoading(true);
    const testResults: any = {};
    
    try {
      // Test MSME List
      console.log('Testing MSME List...');
      const msmeList = await userAPI.msme.list();
      testResults.msmeList = { success: true, data: msmeList };
      console.log('MSME List:', msmeList);
    } catch (e) {
      testResults.msmeList = { success: false, error: String(e) };
      console.error('MSME List Error:', e);
    }

    try {
      // Test Vendor List
      console.log('Testing Vendor List...');
      const vendorList = await userAPI.vendor.list();
      testResults.vendorList = { success: true, data: vendorList };
      console.log('Vendor List:', vendorList);
    } catch (e) {
      testResults.vendorList = { success: false, error: String(e) };
      console.error('Vendor List Error:', e);
    }

    try {
      // Test Wallet Balance (if MSME exists)
      if (testResults.msmeList?.data?.data?.msmes?.[0]) {
        const msmeId = testResults.msmeList.data.data.msmes[0].id;
        console.log('Testing Wallet Balance for:', msmeId);
        const wallet = await walletAPI.getBalance(msmeId);
        testResults.wallet = { success: true, data: wallet, msmeId };
        console.log('Wallet:', wallet);
      } else {
        testResults.wallet = { success: false, error: 'No MSME found to test wallet' };
      }
    } catch (e) {
      testResults.wallet = { success: false, error: String(e) };
      console.error('Wallet Error:', e);
    }

    setResults(testResults);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    testAPIs();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🧪 GRUHA API Debug Page</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Last update: {lastUpdate}</span>
            <button 
              onClick={testAPIs}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '🔄 Testing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Testing APIs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3">🔗 Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/" className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">🏠 Home</Link>
                <Link href="/msme" className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">👤 MSME Portal</Link>
                <Link href="/msme/wallet" className="px-4 py-2 bg-green-100 rounded hover:bg-green-200">💰 Wallet</Link>
                <Link href="/msme/warehouse" className="px-4 py-2 bg-yellow-100 rounded hover:bg-yellow-200">📦 Warehouse</Link>
                <Link href="/msme/transport" className="px-4 py-2 bg-purple-100 rounded hover:bg-purple-200">🚛 Transport</Link>
                <Link href="/vendor" className="px-4 py-2 bg-orange-100 rounded hover:bg-orange-200">🏪 Vendor Portal</Link>
              </div>
            </div>

            {/* MSME List */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {results.msmeList?.success ? '✅' : '❌'} MSME List API 
                <span className="text-sm font-normal text-gray-500">
                  (GET http://localhost:3001/api/users/msme/list)
                </span>
              </h2>
              {results.msmeList?.success && results.msmeList.data?.data?.msmes?.length > 0 && (
                <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                  <p className="font-medium text-green-800">
                    Found {results.msmeList.data.data.msmes.length} MSME(s):
                  </p>
                  {results.msmeList.data.data.msmes.map((m: any) => (
                    <p key={m.id} className="text-green-700">
                      • {m.businessName} (ID: {m.id})
                    </p>
                  ))}
                </div>
              )}
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(results.msmeList, null, 2)}
              </pre>
            </div>

            {/* Vendor List */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {results.vendorList?.success ? '✅' : '❌'} Vendor List API
                <span className="text-sm font-normal text-gray-500">
                  (GET http://localhost:3001/api/users/vendor/list)
                </span>
              </h2>
              {results.vendorList?.success && results.vendorList.data?.data?.vendors?.length > 0 && (
                <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                  <p className="font-medium text-green-800">
                    Found {results.vendorList.data.data.vendors.length} Vendor(s):
                  </p>
                  {results.vendorList.data.data.vendors.map((v: any) => (
                    <p key={v.id} className="text-green-700">
                      • {v.name} ({v.category}) - ID: {v.id}
                    </p>
                  ))}
                </div>
              )}
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(results.vendorList, null, 2)}
              </pre>
            </div>

            {/* Wallet */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {results.wallet?.success ? '✅' : '❌'} Wallet Balance API
                <span className="text-sm font-normal text-gray-500">
                  (GET http://localhost:3002/api/wallet/{'{msmeId}'})
                </span>
              </h2>
              {results.wallet?.success && (
                <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                  <p className="font-medium text-green-800">
                    💰 Balance for {results.wallet.msmeId}:
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{parseInt(results.wallet.data?.data?.balance?.total || '0').toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm">
                    Relief Tokens: ₹{parseInt(results.wallet.data?.data?.balance?.reliefTokens || '0').toLocaleString()}
                    {' | '}
                    Resilience Credits: ₹{parseInt(results.wallet.data?.data?.balance?.resilienceCredits || '0').toLocaleString()}
                  </p>
                </div>
              )}
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(results.wallet, null, 2)}
              </pre>
            </div>

            {/* Service Status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">📡 Backend Services</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  API Gateway: <code className="bg-blue-100 px-1 rounded">localhost:3000</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  User Service: <code className="bg-blue-100 px-1 rounded">localhost:3001</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Wallet Service: <code className="bg-blue-100 px-1 rounded">localhost:3002</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Booking Service: <code className="bg-blue-100 px-1 rounded">localhost:3003</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
