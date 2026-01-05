'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiRefreshCw, FiFilter, FiArrowDownLeft, 
  FiArrowUpRight, FiCheckCircle, FiClock, FiAlertTriangle,
  FiLoader
} from 'react-icons/fi';
import { useMSMEList, useMSMEWallet } from '../../../hooks/useAPI';
import { walletAPI } from '../../../lib/api';

const categoryColors: Record<string, string> = {
  STORAGE: 'bg-primary-100 text-primary-700',
  TRANSPORT: 'bg-secondary-100 text-secondary-700',
  REPAIRS: 'bg-warning-100 text-warning-700',
  WAGES: 'bg-purple-100 text-purple-700',
  EQUIPMENT: 'bg-pink-100 text-pink-700',
  MATERIALS: 'bg-orange-100 text-orange-700',
  Storage: 'bg-primary-100 text-primary-700',
  Transport: 'bg-secondary-100 text-secondary-700',
  Repairs: 'bg-warning-100 text-warning-700',
  'Raw Materials': 'bg-orange-100 text-orange-700',
};

export default function WalletPage() {
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [tokenFilter, setTokenFilter] = useState<'all' | 'RESILIENCE_CREDIT' | 'RELIEF_TOKEN'>('all');
  const [selectedMsmeId, setSelectedMsmeId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  // Fetch MSME list to get current user's MSME
  const { data: msmeListData, loading: msmeLoading } = useMSMEList();
  
  // Set first MSME as selected
  useEffect(() => {
    if (msmeListData?.msmes && msmeListData.msmes.length > 0 && !selectedMsmeId) {
      setSelectedMsmeId(msmeListData.msmes[0].id);
    }
  }, [msmeListData, selectedMsmeId]);

  // Fetch wallet data for selected MSME
  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useMSMEWallet(selectedMsmeId);

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      if (!selectedMsmeId) return;
      setTxnLoading(true);
      try {
        const result = await walletAPI.getTransactions(selectedMsmeId);
        setTransactions(result.data.transactions || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setTxnLoading(false);
      }
    }
    fetchTransactions();
  }, [selectedMsmeId]);

  const filteredTransactions = transactions.filter(txn => {
    const direction = txn.type === 'ALLOCATION' ? 'in' : 'out';
    const matchesDirection = filter === 'all' || direction === filter;
    const matchesToken = tokenFilter === 'all' || txn.tokenType === tokenFilter;
    return matchesDirection && matchesToken;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-secondary-500" />;
      case 'pending':
        return <FiClock className="w-4 h-4 text-warning-500" />;
      case 'flagged':
        return <FiAlertTriangle className="w-4 h-4 text-alert-500" />;
      default:
        return <FiClock className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Loading state
  if (msmeLoading || walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading wallet data from API...</p>
        </div>
      </div>
    );
  }

  // Parse balance values
  const balance = walletData?.balance || { resilienceCredits: '0', reliefTokens: '0', total: '0' };
  const resilienceCredits = parseFloat(balance.resilienceCredits) || 0;
  const reliefTokens = parseFloat(balance.reliefTokens) || 0;
  const activeAllocations = walletData?.activeAllocations || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/msme" className="flex items-center space-x-2 text-white/80 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-xl font-display font-semibold">Wallet & History</h1>
          <button 
            onClick={() => refetchWallet()}
            className="text-white/80 hover:text-white"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* API Status */}
        <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-secondary-700 font-medium">✓ Live Data from Wallet Service API</span>
          </div>
          <span className="text-xs text-secondary-600 font-mono">{selectedMsmeId?.slice(0, 25)}...</span>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <p className="text-primary-100 text-sm">Resilience Credits</p>
            <p className="text-3xl font-bold">₹{resilienceCredits.toLocaleString()}</p>
            <p className="text-xs text-primary-200 mt-1">For pre-disaster protection</p>
          </div>
          
          <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <p className="text-secondary-100 text-sm">Relief Tokens</p>
            <p className="text-3xl font-bold">₹{reliefTokens.toLocaleString()}</p>
            <p className="text-xs text-secondary-200 mt-1">For post-disaster recovery</p>
          </div>
          
          <div className="card bg-neutral-100">
            <p className="text-neutral-500 text-sm">Total Balance</p>
            <p className="text-3xl font-bold text-neutral-800">₹{(resilienceCredits + reliefTokens).toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">Combined token balance</p>
          </div>
        </div>

        {/* Active Allocations */}
        {activeAllocations.length > 0 && (
          <div className="card mb-6">
            <h3 className="font-semibold text-lg mb-4">Active Allocations (Real Data)</h3>
            <div className="space-y-3">
              {activeAllocations.map((alloc: any) => (
                <div key={alloc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-200">
                  <div>
                    <p className="font-medium text-lg">{alloc.tokenType}</p>
                    <p className="text-sm text-neutral-500">
                      Expires: {new Date(alloc.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alloc.categories?.map((cat: string) => (
                        <span key={cat} className={`text-xs px-2 py-1 rounded-full ${categoryColors[cat] || 'bg-neutral-100 text-neutral-700'}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-secondary-600">₹{parseFloat(alloc.remaining).toLocaleString()}</p>
                    <p className="text-sm text-neutral-500">of ₹{parseFloat(alloc.amount).toLocaleString()} allocated</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card p-4 border-l-4 border-primary-500">
            <h4 className="font-semibold text-primary-600 mb-2">About Resilience Credits</h4>
            <p className="text-sm text-neutral-600">
              Pre-disaster credits for preventive actions. Use for storage and transport BEFORE 
              disaster strikes. Expires within 7 days of allocation.
            </p>
          </div>
          <div className="card p-4 border-l-4 border-secondary-500">
            <h4 className="font-semibold text-secondary-600 mb-2">About Relief Tokens</h4>
            <p className="text-sm text-neutral-600">
              Post-disaster tokens for recovery. Can be spent on storage, transport, repairs, 
              equipment, and up to 30% on wages. Valid for 30 days.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(['all', 'in', 'out'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === f 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'in' ? 'Received' : 'Spent'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'RESILIENCE_CREDIT', 'RELIEF_TOKEN'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTokenFilter(t)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    tokenFilter === t 
                      ? t === 'RESILIENCE_CREDIT' ? 'bg-primary-500 text-white' 
                        : t === 'RELIEF_TOKEN' ? 'bg-secondary-500 text-white'
                        : 'bg-neutral-700 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {t === 'all' ? 'All Tokens' : t === 'RESILIENCE_CREDIT' ? 'Resilience' : 'Relief'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Transaction History</h3>
          
          {txnLoading ? (
            <div className="text-center py-8">
              <FiLoader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
              <p className="text-neutral-500">Loading transactions from API...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl">
              <FiClock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium">No transactions yet</p>
              <p className="text-sm text-neutral-500 mt-1">Transactions will appear here after token allocations and spending</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((txn) => {
                const isIncoming = txn.type === 'ALLOCATION';
                return (
                  <div 
                    key={txn.id} 
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isIncoming ? 'bg-secondary-100' : 'bg-alert-100'
                      }`}>
                        {isIncoming 
                          ? <FiArrowDownLeft className="w-5 h-5 text-secondary-600" />
                          : <FiArrowUpRight className="w-5 h-5 text-alert-600" />
                        }
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{txn.description || (isIncoming ? 'Token Allocation' : 'Token Spend')}</p>
                          {getStatusIcon(txn.status)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            txn.tokenType === 'RESILIENCE_CREDIT' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-secondary-100 text-secondary-700'
                          }`}>
                            {txn.tokenType === 'RESILIENCE_CREDIT' ? 'Resilience' : 'Relief'}
                          </span>
                          {txn.category && (
                            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[txn.category] || 'bg-neutral-100'}`}>
                              {txn.category}
                            </span>
                          )}
                          <span className="text-xs text-neutral-400">
                            {formatDate(txn.createdAt)}
                          </span>
                        </div>
                        {txn.vendorId && (
                          <p className="text-xs text-neutral-500 mt-1">Vendor: {txn.vendorId}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isIncoming ? 'text-secondary-600' : 'text-alert-600'}`}>
                        {isIncoming ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString()}
                      </p>
                      {txn.blockchainTxHash && (
                        <p className="text-xs text-neutral-400 font-mono">
                          {txn.blockchainTxHash.slice(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spending Rules */}
        <div className="card mt-6">
          <h3 className="text-lg font-display font-semibold mb-4">Spending Rules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
              <p className="text-2xl font-bold text-primary-600">100%</p>
              <p className="text-sm text-neutral-600">Storage</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
              <p className="text-2xl font-bold text-secondary-600">100%</p>
              <p className="text-sm text-neutral-600">Transport</p>
            </div>
            <div className="p-4 bg-warning-50 rounded-xl border border-warning-200">
              <p className="text-2xl font-bold text-warning-600">100%</p>
              <p className="text-sm text-neutral-600">Repairs</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">≤30%</p>
              <p className="text-sm text-neutral-600">Wages</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
