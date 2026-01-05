'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  FiArrowLeft, FiAlertTriangle, FiDollarSign, FiUsers, 
  FiTrendingUp, FiActivity, FiMapPin, FiClock, FiFlag,
  FiLoader, FiAlertCircle, FiRefreshCw, FiCheck
} from 'react-icons/fi';
import { useDashboardStats, useFlaggedTransactions, useWalletActions, useMSMEList, useVendorList } from '../../hooks/useAPI';

export default function AuthorityDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'disasters' | 'flagged' | 'allocate'>('overview');
  
  // Fetch data from APIs
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: flaggedData, loading: flaggedLoading, error: flaggedError, refetch: refetchFlagged } = useFlaggedTransactions();
  const { data: msmeData, loading: msmeLoading } = useMSMEList();
  const { data: vendorData, loading: vendorLoading } = useVendorList();
  const { allocateTokens } = useWalletActions();

  // Allocation form state
  const [allocateForm, setAllocateForm] = useState({
    msmeId: '',
    tokenType: 0 as 0 | 1, // 0 = ResilienceCredits, 1 = ReliefTokens
    amount: '',
    validityDays: '30',
    categories: [0, 1] as number[], // category indices
    disasterId: 'disaster_cyclone_biparjoy',
  });
  const [allocating, setAllocating] = useState(false);
  const [allocateMessage, setAllocateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Dummy disasters (in real app, would come from disaster-service)
  const mockDisasters = [
    {
      id: 'disaster_001',
      name: 'Cyclone Biparjoy',
      type: 'cyclone',
      status: 'active',
      region: 'Gujarat, Maharashtra',
      startDate: '2026-01-03',
      allocated: 25000000,
      spent: 18000000,
      beneficiaries: msmeData?.msmes?.length || 0,
    },
    {
      id: 'disaster_002',
      name: 'Mumbai Floods 2026',
      type: 'flood',
      status: 'recovery',
      region: 'Mumbai Metropolitan',
      startDate: '2025-12-28',
      allocated: 15000000,
      spent: 12000000,
      beneficiaries: Math.floor((msmeData?.msmes?.length || 0) / 2),
    },
  ];

  // Calculate stats from real data
  const stats = {
    totalAllocated: statsData?.totalAllocated || 50000000,
    totalSpent: statsData?.totalSpent || 32000000,
    activeMsmes: msmeData?.msmes?.length || 0,
    activeVendors: vendorData?.vendors?.length || 0,
    flaggedTransactions: flaggedData?.transactions?.length || 0,
    pendingReview: flaggedData?.transactions?.filter((t: any) => t.fraudStatus === 'flagged').length || 0,
  };

  const flaggedTransactions = flaggedData?.transactions || [];

  // Handle allocation
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocating(true);
    setAllocateMessage(null);
    
    try {
      const result = await allocateTokens({
        msmeId: allocateForm.msmeId,
        tokenType: allocateForm.tokenType,
        amount: parseInt(allocateForm.amount),
        validityDays: parseInt(allocateForm.validityDays),
        categories: allocateForm.categories,
        disasterId: allocateForm.disasterId,
        allocatedBy: 'authority_district_001',
      });
      
      if (result.success) {
        setAllocateMessage({ type: 'success', text: `Successfully allocated ₹${parseInt(allocateForm.amount).toLocaleString()} to ${allocateForm.msmeId}` });
        setAllocateForm(prev => ({ ...prev, msmeId: '', amount: '' }));
        refetchStats();
      } else {
        setAllocateMessage({ type: 'error', text: 'Allocation failed' });
      }
    } catch (err: any) {
      setAllocateMessage({ type: 'error', text: err.message || 'Allocation failed' });
    } finally {
      setAllocating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Authority Dashboard</h1>
          <button 
            onClick={() => { refetchStats(); refetchFlagged(); }}
            className="text-white/80 hover:text-white"
            title="Refresh data"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={<FiDollarSign />}
            label="Total Allocated"
            value={`₹${(stats.totalAllocated / 10000000).toFixed(1)}Cr`}
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            icon={<FiTrendingUp />}
            label="Total Spent"
            value={`₹${(stats.totalSpent / 10000000).toFixed(1)}Cr`}
            color="secondary"
            loading={statsLoading}
          />
          <StatCard
            icon={<FiUsers />}
            label="Active MSMEs"
            value={stats.activeMsmes.toLocaleString()}
            color="primary"
            loading={msmeLoading}
          />
          <StatCard
            icon={<FiActivity />}
            label="Active Vendors"
            value={stats.activeVendors.toLocaleString()}
            color="secondary"
            loading={vendorLoading}
          />
          <StatCard
            icon={<FiFlag />}
            label="Flagged Txns"
            value={stats.flaggedTransactions.toString()}
            color="warning"
            loading={flaggedLoading}
          />
          <StatCard
            icon={<FiClock />}
            label="Pending Review"
            value={stats.pendingReview.toString()}
            color="alert"
            loading={flaggedLoading}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {(['overview', 'disasters', 'flagged', 'allocate'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'flagged' && stats.flaggedTransactions > 0 && (
                <span className="ml-2 bg-alert-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.flaggedTransactions}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Disasters */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold mb-4">Active Disasters</h3>
              <div className="space-y-4">
                {mockDisasters.map((disaster) => (
                  <div key={disaster.id} className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{disaster.name}</h4>
                      <span className={`badge ${
                        disaster.status === 'active' ? 'badge-flagged' : 'badge-accepted'
                      }`}>
                        {disaster.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-500 mb-3">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      {disaster.region}
                    </div>
                    <div className="bg-neutral-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${(disaster.spent / disaster.allocated) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>₹{(disaster.spent / 100000).toFixed(1)}L spent</span>
                      <span className="text-neutral-500">of ₹{(disaster.allocated / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="btn btn-alert flex-col h-auto py-6"
                  onClick={() => setActiveTab('disasters')}
                >
                  <FiAlertTriangle className="w-8 h-8 mb-2" />
                  <span>Declare Disaster</span>
                </button>
                <button 
                  className="btn btn-primary flex-col h-auto py-6"
                  onClick={() => setActiveTab('allocate')}
                >
                  <FiDollarSign className="w-8 h-8 mb-2" />
                  <span>Allocate Tokens</span>
                </button>
                <button 
                  className="btn btn-outline flex-col h-auto py-6"
                  onClick={() => setActiveTab('flagged')}
                >
                  <FiFlag className="w-8 h-8 mb-2" />
                  <span>Review Flagged</span>
                </button>
                <Link href="/public" className="btn btn-outline flex-col h-auto py-6">
                  <FiActivity className="w-8 h-8 mb-2" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>

            {/* API Status */}
            <div className="card col-span-2">
              <h3 className="text-lg font-display font-semibold mb-4">🔗 API Status</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${statsError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
                  <span className="text-sm">Wallet Service</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${msmeLoading ? 'bg-warning-500 animate-pulse' : msmeData ? 'bg-secondary-500' : 'bg-alert-500'}`}></span>
                  <span className="text-sm">User Service (MSME)</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${vendorLoading ? 'bg-warning-500 animate-pulse' : vendorData ? 'bg-secondary-500' : 'bg-alert-500'}`}></span>
                  <span className="text-sm">User Service (Vendor)</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${flaggedError ? 'bg-alert-500' : 'bg-secondary-500'}`}></span>
                  <span className="text-sm">Fraud Detection</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disasters Tab */}
        {activeTab === 'disasters' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold">Disaster Management</h3>
              <button className="btn btn-alert">
                <FiAlertTriangle className="w-5 h-5 mr-2" />
                Declare New Disaster
              </button>
            </div>
            
            <div className="space-y-4">
              {mockDisasters.map((disaster) => (
                <div key={disaster.id} className="p-6 bg-neutral-50 rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold">{disaster.name}</h4>
                        <span className={`badge ${
                          disaster.status === 'active' ? 'badge-flagged' : 'badge-accepted'
                        }`}>
                          {disaster.status}
                        </span>
                      </div>
                      <div className="text-neutral-600 space-y-1">
                        <p>
                          <strong>Region:</strong> {disaster.region}
                        </p>
                        <p>
                          <strong>Start Date:</strong> {disaster.startDate}
                        </p>
                        <p>
                          <strong>Beneficiaries:</strong> {disaster.beneficiaries} MSMEs
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{(disaster.allocated / 100000).toLocaleString()}L
                      </p>
                      <p className="text-neutral-500">
                        {((disaster.spent / disaster.allocated) * 100).toFixed(0)}% utilized
                      </p>
                      <button className="btn btn-outline py-2 px-4">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagged Transactions Tab */}
        {activeTab === 'flagged' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold">
                Flagged Transactions ({flaggedTransactions.length})
              </h3>
              <button 
                onClick={() => refetchFlagged()}
                className="btn btn-outline py-2 px-4"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
            
            {flaggedLoading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-neutral-500">Loading flagged transactions...</p>
              </div>
            ) : flaggedError ? (
              <div className="text-center py-12">
                <FiAlertCircle className="w-8 h-8 text-warning-500 mx-auto mb-2" />
                <p className="text-neutral-500">Failed to load flagged transactions</p>
                <button onClick={() => refetchFlagged()} className="text-primary-600 hover:underline mt-2">
                  Try again
                </button>
              </div>
            ) : flaggedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FiCheck className="w-12 h-12 text-secondary-500 mx-auto mb-3" />
                <p className="text-neutral-500">No flagged transactions! All clear.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedTransactions.map((txn: any) => (
                  <div key={txn.id} className="p-4 border border-alert-200 bg-alert-50 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-mono text-sm bg-neutral-200 px-2 py-0.5 rounded">
                            {txn.id.slice(0, 20)}...
                          </span>
                          <span className={`badge ${txn.fraudScore >= 50 ? 'badge-flagged' : 'badge-pending'}`}>
                            Score: {txn.fraudScore}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <p>MSME: {txn.msmeId.slice(0, 15)}... → Vendor: {txn.vendorId.slice(0, 15)}...</p>
                          <p>Amount: <strong>₹{parseInt(txn.amount).toLocaleString()}</strong></p>
                          <p>Time: {new Date(txn.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {txn.fraudFlags?.map((flag: string) => (
                            <span key={flag} className="text-xs bg-alert-200 text-alert-800 px-2 py-0.5 rounded">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="btn btn-outline py-2 px-4 text-alert-600 border-alert-600">
                          Reject
                        </button>
                        <button className="btn btn-secondary py-2 px-4">
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Allocate Tab */}
        {activeTab === 'allocate' && (
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-display font-semibold mb-6">Allocate Tokens</h3>
            
            {allocateMessage && (
              <div className={`p-4 rounded-xl mb-6 ${
                allocateMessage.type === 'success' ? 'bg-secondary-100 text-secondary-800' : 'bg-alert-100 text-alert-800'
              }`}>
                {allocateMessage.text}
              </div>
            )}
            
            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Disaster Context
                </label>
                <select 
                  className="input"
                  value={allocateForm.disasterId}
                  onChange={(e) => setAllocateForm(prev => ({ ...prev, disasterId: e.target.value }))}
                >
                  <option value="disaster_cyclone_biparjoy">Cyclone Biparjoy - Gujarat, Maharashtra</option>
                  <option value="disaster_mumbai_floods_2026">Mumbai Floods 2026</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Token Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer ${
                    allocateForm.tokenType === 0 ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tokenType" 
                      checked={allocateForm.tokenType === 0}
                      onChange={() => setAllocateForm(prev => ({ ...prev, tokenType: 0 as 0 | 1 }))}
                      className="mr-3" 
                    />
                    <span>Resilience Credit</span>
                  </label>
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer ${
                    allocateForm.tokenType === 1 ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tokenType" 
                      checked={allocateForm.tokenType === 1}
                      onChange={() => setAllocateForm(prev => ({ ...prev, tokenType: 1 as 0 | 1 }))}
                      className="mr-3" 
                    />
                    <span>Relief Token</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Select MSME
                </label>
                {msmeLoading ? (
                  <div className="input flex items-center">
                    <FiLoader className="w-4 h-4 animate-spin mr-2" />
                    Loading MSMEs...
                  </div>
                ) : (
                  <select 
                    className="input"
                    value={allocateForm.msmeId}
                    onChange={(e) => setAllocateForm(prev => ({ ...prev, msmeId: e.target.value }))}
                    required
                  >
                    <option value="">Select an MSME...</option>
                    {msmeData?.msmes?.map((msme: any) => (
                      <option key={msme.id} value={msme.id}>
                        {msme.businessName} ({msme.id.slice(0, 20)}...)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Amount (₹)
                </label>
                <input 
                  type="number" 
                  className="input" 
                  placeholder="50000" 
                  value={allocateForm.amount}
                  onChange={(e) => setAllocateForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Validity (days)
                </label>
                <input 
                  type="number" 
                  className="input" 
                  value={allocateForm.validityDays}
                  onChange={(e) => setAllocateForm(prev => ({ ...prev, validityDays: e.target.value }))}
                  required
                  min="1"
                  max="365"
                />
              </div>
              
              <button 
                type="submit"
                className="btn btn-primary w-full mt-6 disabled:opacity-50"
                disabled={allocating || !allocateForm.msmeId || !allocateForm.amount}
              >
                {allocating ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin mr-2" />
                    Allocating...
                  </>
                ) : (
                  'Allocate Tokens'
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  loading = false,
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'primary' | 'secondary' | 'warning' | 'alert';
  loading?: boolean;
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    warning: 'bg-warning-100 text-warning-600',
    alert: 'bg-alert-100 text-alert-600',
  };
  
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      {loading ? (
        <FiLoader className="w-6 h-6 animate-spin mb-1" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
