import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Package, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Droplets, 
  MapPin, 
  AlertCircle,
  TrendingUp,
  Layers,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const SellerInventoryView = ({ onOpenCreate, onEditListing }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');

  const fetchSellerListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getSellerListings();
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch seller listings failed:', err);
      setError('Failed to fetch your inventory listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerListings();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove listing "${title}"?`)) return;
    try {
      await api.deleteListing(id);
      setListings(listings.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleToggleSoldOut = async (listing) => {
    const nextStatus = listing.status === 'sold_out' ? 'active' : 'sold_out';
    try {
      const res = await api.updateListing(listing._id, { status: nextStatus });
      setListings(listings.map((l) => (l._id === listing._id ? res.listing : l)));
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const filteredListings = listings.filter((l) => {
    if (!commodityFilter) return true;
    return l.commodity === commodityFilter;
  });

  // Calculate summary metrics
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const totalStockVolume = listings
    .filter((l) => l.status === 'active')
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalStockValue = listings
    .filter((l) => l.status === 'active')
    .reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Metrics */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Package className="w-3.5 h-3.5" />
              Seller Inventory Management
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">Farm Harvest Listings</h1>
            <p className="text-xs text-stone-500">Manage commodity quantities, test specs, and wholesale pricing</p>
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Produce</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <span className="text-xs font-medium text-stone-500">Active Market Lots</span>
            <p className="text-2xl font-black text-stone-900 mt-1">{activeCount} listings</p>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100">
            <span className="text-xs font-medium text-amber-900">Total Available Volume</span>
            <p className="text-2xl font-black text-amber-800 mt-1">{totalStockVolume.toLocaleString()} Tons</p>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
            <span className="text-xs font-medium text-emerald-900">Active Inventory Valuation</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">₹{totalStockValue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Commodity Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: '', label: 'All Crops' },
          { id: 'Paddy', label: '🌾 Paddy Rice' },
          { id: 'Corn', label: '🌽 Yellow Corn' },
          { id: 'Peanuts', label: '🥜 Peanuts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCommodityFilter(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              commodityFilter === tab.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Items */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
          {error}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <h3 className="text-base font-bold text-stone-800">No Listings in this Category</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click "Post New Produce" above to create wholesale listings for Paddy, Corn, or Peanuts.
          </p>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow transition-all space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CommodityBadge commodity={listing.commodity} size="sm" />
                    <GradeBadge grade={listing.grade} size="sm" />
                    <StatusBadge status={listing.status} type="listing" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{listing.title}</h3>
                  <p className="text-xs text-stone-500">
                    Variety: <span className="font-semibold text-stone-700">{listing.variety}</span> • Origin: {listing.origin?.district}, {listing.origin?.state}
                  </p>
                </div>

                {/* Pricing & Stock Stats */}
                <div className="flex items-center gap-6 text-xs text-right">
                  <div>
                    <span className="text-stone-400 block">Unit Price</span>
                    <span className="text-lg font-black text-emerald-700">₹{Number(listing.unitPrice).toLocaleString('en-IN')}</span>
                    <span className="text-stone-500"> / {listing.unit}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Stock Available</span>
                    <span className="text-lg font-black text-stone-800">{listing.quantity}</span>
                    <span className="text-stone-500"> {listing.unit}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-stone-400 block">Moisture %</span>
                    <span className="text-lg font-bold text-blue-700">{listing.moisturePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-2 text-stone-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{listing.origin?.farmLocation || 'Silo Storage'}</span>
                  <span>• MOQ: {listing.minimumOrderQuantity} {listing.unit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSoldOut(listing)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                  >
                    {listing.status === 'sold_out' ? 'Mark Active' : 'Mark Sold Out'}
                  </button>
                  <button
                    onClick={() => onEditListing(listing)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(listing._id, listing.title)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
