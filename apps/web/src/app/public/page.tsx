'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  FiArrowLeft, FiSearch, FiExternalLink, FiTrendingUp, 
  FiUsers, FiCheckCircle, FiClock, FiMapPin, FiLoader, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { useDashboardStats, useMSMEList, useVendorList } from '../../hooks/useAPI';
import { walletAPI } from '../../lib/api';

export default function PublicPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'regions'>('dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  
  // Fetch real data from APIs
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: msmeData, loading: msmeLoading } = useMSMEList();
  const { data: vendorData, loading: vendorLoading } = useVendorList();

  // Calculate safe stat values
  const totalAllocated = statsData?.totalAllocated || 50000000;
  const totalSpent = statsData?.totalSpent || 32000000;

  // Calculate stats from real data
  const publicStats = {
    totalDisastersFunded: 2, // Would come from disaster-service
    totalMsmesSupported: msmeData?.msmes?.length || 0,
    totalVendors: vendorData?.vendors?.length || 0,
    totalFundsDisbursed: totalAllocated,
    utilizationRate: totalAllocated > 0 
      ? ((totalSpent / totalAllocated) * 100).toFixed(1)
      : 0,
    averageTimeToRelief: 2.3, // Would come from analytics
    vendorPayoutRate: 98.2, // Would come from settlement-service
  };

  // Mock category breakdown (would come from analytics API)
  const categoryBreakdown = [
    { category: 'Storage', amount: totalSpent * 0.36, percentage: 36, color: 'bg-primary-500' },
    { category: 'Transport', amount: totalSpent * 0.256, percentage: 25.6, color: 'bg-secondary-500' },
    { category: 'Repairs', amount: totalSpent * 0.224, percentage: 22.4, color: 'bg-warning-500' },
    { category: 'Wages', amount: totalSpent * 0.12, percentage: 12, color: 'bg-purple-500' },
    { category: 'Equipment', amount: totalSpent * 0.04, percentage: 4, color: 'bg-pink-500' },
  ];

  // Mock region stats (would come from analytics API with real MSME data)
  const regionStats = [
    { region: 'Gujarat', disbursed: (statsData?.totalAllocated || 0) * 0.36, beneficiaries: Math.floor((msmeData?.msmes?.length || 0) * 0.28), disasters: 1 },
    { region: 'Maharashtra', disbursed: (statsData?.totalAllocated || 0) * 0.28, beneficiaries: Math.floor((msmeData?.msmes?.length || 0) * 0.22), disasters: 1 },
    { region: 'Odisha', disbursed: (statsData?.totalAllocated || 0) * 0.20, beneficiaries: Math.floor((msmeData?.msmes?.length || 0) * 0.19), disasters: 0 },
    { region: 'Tamil Nadu', disbursed: (statsData?.totalAllocated || 0) * 0.16, beneficiaries: Math.floor((msmeData?.msmes?.length || 0) * 0.31), disasters: 0 },
  ];

  // Load transactions when tab changes
  const loadTransactions = async () => {
    if (transactions.length > 0) return;
    setTxnLoading(true);
    try {
      // Get transactions from all MSMEs
      const allTxns: any[] = [];
      if (msmeData?.msmes) {
        for (const msme of msmeData.msmes.slice(0, 3)) { // Limit for performance
          try {
            const result = await walletAPI.getTransactions(msme.id);
            if (result.data?.transactions) {
              allTxns.push(...result.data.transactions.map((t: any) => ({
                ...t,
                region: 'India',
                disasterName: t.disasterContext || 'General Relief',
              })));
            }
          } catch (e) {
            // Skip failed fetches
          }
        }
      }
      setTransactions(allTxns);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setTxnLoading(false);
    }
  };

  // Filter transactions by search
  const filteredTransactions = transactions.filter(txn =>
    txn.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.blockchainTxHash?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-neutral-800 to-neutral-700 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Public Transparency Portal</h1>
          <button 
            onClick={() => refetchStats()}
            className="text-white/80 hover:text-white"
            title="Refresh data"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Trust Banner */}
      <div className="bg-secondary-500 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            ✓ All transactions are recorded on Hyperledger blockchain for complete transparency
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <PublicStatCard
            icon={<FiTrendingUp className="w-6 h-6" />}
            label="Total Disbursed"
            value={publicStats.totalFundsDisbursed > 0 
              ? `₹${(publicStats.totalFundsDisbursed / 100000).toFixed(1)}L` 
              : '₹0'}
            loading={statsLoading}
          />
          <PublicStatCard
            icon={<FiUsers className="w-6 h-6" />}
            label="MSMEs Supported"
            value={publicStats.totalMsmesSupported.toLocaleString()}
            loading={msmeLoading}
          />
          <PublicStatCard
            icon={<FiCheckCircle className="w-6 h-6" />}
            label="Utilization Rate"
            value={`${publicStats.utilizationRate}%`}
            loading={statsLoading}
          />
          <PublicStatCard
            icon={<FiClock className="w-6 h-6" />}
            label="Avg. Relief Time"
            value={`${publicStats.averageTimeToRelief} days`}
            loading={false}
          />
          <PublicStatCard
            icon={<FiCheckCircle className="w-6 h-6" />}
            label="Active Vendors"
            value={publicStats.totalVendors.toString()}
            loading={vendorLoading}
          />
          <PublicStatCard
            icon={<FiMapPin className="w-6 h-6" />}
            label="Disasters Funded"
            value={publicStats.totalDisastersFunded.toString()}
            loading={false}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-200 rounded-xl p-1 mb-6">
          {(['dashboard', 'transactions', 'regions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'transactions') loadTransactions();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-neutral-800 shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold mb-4">Spending by Category</h3>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <span>₹{(cat.amount / 100000).toFixed(1)}L ({cat.percentage}%)</span>
                      </div>
                      <div className="bg-neutral-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${cat.color}`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blockchain Verification */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold mb-4">Blockchain Verification</h3>
              <div className="bg-neutral-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-neutral-600 mb-2">Every transaction is:</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <FiCheckCircle className="w-4 h-4 text-secondary-500 mr-2" />
                    Recorded on Hyperledger Fabric
                  </li>
                  <li className="flex items-center text-sm">
                    <FiCheckCircle className="w-4 h-4 text-secondary-500 mr-2" />
                    Immutable and tamper-proof
                  </li>
                  <li className="flex items-center text-sm">
                    <FiCheckCircle className="w-4 h-4 text-secondary-500 mr-2" />
                    Publicly verifiable (anonymized)
                  </li>
                  <li className="flex items-center text-sm">
                    <FiCheckCircle className="w-4 h-4 text-secondary-500 mr-2" />
                    Spending rules enforced by smart contracts
                  </li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-neutral-600 mb-2">API Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statsError ? 'bg-alert-500' : 'bg-secondary-500'} ${!statsError && 'animate-pulse'}`}></div>
                    <span className="text-xs">Wallet Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${msmeData ? 'bg-secondary-500' : 'bg-alert-500'} ${msmeData && 'animate-pulse'}`}></div>
                    <span className="text-xs">User Service</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="card md:col-span-2">
              <h3 className="text-lg font-display font-semibold mb-4">Live Platform Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-primary-600">
                    {msmeLoading ? <FiLoader className="w-6 h-6 animate-spin mx-auto" /> : msmeData?.msmes?.length || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Registered MSMEs</p>
                </div>
                <div className="bg-secondary-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-secondary-600">
                    {vendorLoading ? <FiLoader className="w-6 h-6 animate-spin mx-auto" /> : vendorData?.vendors?.length || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Verified Vendors</p>
                </div>
                <div className="bg-warning-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-warning-600">
                    {statsLoading ? <FiLoader className="w-6 h-6 animate-spin mx-auto" /> : `₹${((statsData?.totalAllocated || 0) / 100000).toFixed(0)}L`}
                  </p>
                  <p className="text-sm text-neutral-600">Total Allocated</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {statsLoading ? <FiLoader className="w-6 h-6 animate-spin mx-auto" /> : `₹${((statsData?.totalSpent || 0) / 100000).toFixed(0)}L`}
                  </p>
                  <p className="text-sm text-neutral-600">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-display font-semibold">Transaction Explorer</h3>
              <div className="relative w-full md:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by ID or blockchain hash..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {txnLoading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-neutral-500">Loading transactions from blockchain...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No transactions found</p>
                <p className="text-sm text-neutral-400 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Transactions will appear here after token spending'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((txn) => (
                  <div key={txn.id} className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-mono text-sm bg-neutral-200 px-2 py-0.5 rounded">
                            {txn.id.slice(0, 20)}...
                          </span>
                          <span className={`badge ${
                            txn.type === 'spend' ? 'badge-accepted' : 'badge-pending'
                          }`}>
                            {txn.type?.toUpperCase() || 'TRANSACTION'}
                          </span>
                          {txn.fraudScore >= 30 && (
                            <span className="badge badge-flagged">
                              Risk: {txn.fraudScore}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-neutral-600">
                          <p><strong>Category:</strong> {txn.category || 'General'}</p>
                          <p><strong>Amount:</strong> ₹{parseInt(txn.amount || 0).toLocaleString()}</p>
                          <p><strong>Region:</strong> {txn.region}</p>
                          <p><strong>Context:</strong> {txn.disasterName}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 mb-1">
                          {new Date(txn.createdAt).toLocaleString()}
                        </p>
                        {txn.blockchainTxHash && (
                          <a
                            href="#"
                            className="inline-flex items-center text-sm text-primary-600 hover:underline"
                          >
                            <span className="font-mono">{txn.blockchainTxHash.slice(0, 12)}...</span>
                            <FiExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTransactions.length > 0 && (
              <div className="mt-6 text-center">
                <button className="btn btn-outline" onClick={loadTransactions}>
                  Refresh Transactions
                </button>
              </div>
            )}
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="card">
            <h3 className="text-lg font-display font-semibold mb-6">Regional Breakdown</h3>
            
            {statsLoading || msmeLoading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-neutral-500">Loading regional data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="text-left py-4 px-4 rounded-l-lg">Region</th>
                      <th className="text-right py-4 px-4">Total Disbursed</th>
                      <th className="text-right py-4 px-4">Beneficiaries</th>
                      <th className="text-right py-4 px-4">Disasters</th>
                      <th className="text-right py-4 px-4 rounded-r-lg">Avg per MSME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {regionStats.map((region) => (
                      <tr key={region.region} className="hover:bg-neutral-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 text-neutral-400 mr-2" />
                            <span className="font-medium">{region.region}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          ₹{(region.disbursed / 100000).toFixed(1)}L
                        </td>
                        <td className="py-4 px-4 text-right">
                          {region.beneficiaries.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {region.disasters}
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-600">
                          {region.beneficiaries > 0 
                            ? `₹${Math.round(region.disbursed / region.beneficiaries).toLocaleString()}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 font-semibold">
                    <tr>
                      <td className="py-4 px-4 rounded-l-lg">Total</td>
                      <td className="py-4 px-4 text-right">
                        ₹{(regionStats.reduce((a, b) => a + b.disbursed, 0) / 100000).toFixed(1)}L
                      </td>
                      <td className="py-4 px-4 text-right">
                        {regionStats.reduce((a, b) => a + b.beneficiaries, 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {regionStats.reduce((a, b) => a + b.disasters, 0)}
                      </td>
                      <td className="py-4 px-4 text-right rounded-r-lg">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Download Reports */}
        <div className="mt-8 bg-neutral-100 rounded-xl p-6 text-center">
          <h4 className="font-display font-semibold mb-2">Download Public Reports</h4>
          <p className="text-neutral-600 text-sm mb-4">
            Access detailed PDF reports for auditing and compliance purposes
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn btn-outline py-2 px-4">
              Monthly Report (PDF)
            </button>
            <button className="btn btn-outline py-2 px-4">
              Transaction Ledger (CSV)
            </button>
            <button className="btn btn-outline py-2 px-4">
              Audit Certificate
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-400 text-sm">
            © 2026 GRUHA - Government of India | Ministry of MSME
          </p>
          <p className="text-neutral-500 text-xs mt-2">
            All data is anonymized to protect individual privacy while ensuring complete transparency
          </p>
        </div>
      </footer>
    </div>
  );
}

function PublicStatCard({ 
  icon, 
  label, 
  value,
  loading = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="card p-4 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-600">
        {icon}
      </div>
      {loading ? (
        <FiLoader className="w-6 h-6 animate-spin mx-auto mb-1" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
