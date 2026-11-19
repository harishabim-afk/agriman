import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingBag, 
  UserCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const AdminOverviewView = ({ onNavigateTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Fetch admin stats failed:', err);
        setError('Failed to aggregate platform analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-stone-200" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
        {error || 'No statistics available.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Platform Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-stone-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Platform Governance & Analytics
          </div>
          <h1 className="text-3xl font-black">AgroHarvest Exchange Oversight</h1>
          <p className="text-purple-200 text-xs sm:text-sm">
            Real-time macroeconomic telemetry across Paddy, Corn, and Peanuts. Supervise seller credentials, oversee escrow flows, and enforce quality grading standards.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            ₹{stats.orders?.totalGMV?.toLocaleString('en-IN') || '0'}
          </p>
          <span className="text-[11px] text-stone-500">Across settled & in-transit trades</span>
        </div>

        {/* Registered Users */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Participants</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {stats.users?.total}
          </p>
          <span className="text-[11px] text-stone-500">
            {stats.users?.sellers} Sellers ({stats.users?.verifiedSellers} verified) • {stats.users?.buyers} Buyers
          </span>
        </div>

        {/* Active Produce Lots */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Produce Listings</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {stats.listings?.active} / {stats.listings?.total}
          </p>
          <span className="text-[11px] text-stone-500">
            {stats.listings?.delisted} lots currently delisted for moderation
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bulk Contracts</span>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {stats.orders?.total} orders
          </p>
          <span className="text-[11px] text-stone-500">Transacted on AgroHarvest</span>
        </div>
      </div>

      {/* Commodity Volumes Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-sm">Active Market Volume by Commodity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Paddy', 'Corn', 'Peanuts'].map((crop) => {
            const cropStat = stats.commodities?.find((c) => c._id === crop) || {
              count: 0,
              totalQuantity: 0,
              avgPrice: 0,
            };

            const colors = {
              Paddy: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
              Corn: 'border-amber-200 bg-amber-50/50 text-amber-900',
              Peanuts: 'border-orange-200 bg-orange-50/50 text-orange-950',
            };

            const icons = {
              Paddy: '🌾',
              Corn: '🌽',
              Peanuts: '🥜',
            };

            return (
              <div
                key={crop}
                className={`p-4 rounded-xl border ${colors[crop]} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <span>{icons[crop]}</span>
                    <span>{crop}</span>
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border">
                    {cropStat.count} active lots
                  </span>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-500 block">Available Supply</span>
                    <span className="text-xl font-extrabold">{cropStat.totalQuantity.toLocaleString()} Tons</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-stone-500 block">Avg Rate</span>
                    <span className="text-sm font-bold">₹{Math.round(cropStat.avgPrice || 0).toLocaleString('en-IN')}/Ton</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fast Admin Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <button
          onClick={() => onNavigateTab('admin-users')}
          className="p-4 rounded-xl bg-white border border-stone-200 hover:border-purple-300 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="text-left space-y-1">
            <span className="font-bold text-stone-900 block group-hover:text-purple-700">Verify & Manage Sellers</span>
            <span className="text-stone-500">Review new seller documents & credentials</span>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigateTab('admin-listings')}
          className="p-4 rounded-xl bg-white border border-stone-200 hover:border-purple-300 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="text-left space-y-1">
            <span className="font-bold text-stone-900 block group-hover:text-purple-700">Produce Moderation</span>
            <span className="text-stone-500">Delist non-compliant or high moisture lots</span>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigateTab('admin-orders')}
          className="p-4 rounded-xl bg-white border border-stone-200 hover:border-purple-300 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="text-left space-y-1">
            <span className="font-bold text-stone-900 block group-hover:text-purple-700">Audit Orders & Escrow</span>
            <span className="text-stone-500">Oversee all active and fulfilled contracts</span>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
