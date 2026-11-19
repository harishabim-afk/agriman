import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { 
  SlidersHorizontal, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  Droplets, 
  Eye
} from 'lucide-react';

export const AdminListingsView = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  
  // Moderation Modal
  const [modalListing, setModalListing] = useState(null);
  const [targetStatus, setTargetStatus] = useState('delisted_by_admin');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminListings({
        status: statusFilter,
        commodity: commodityFilter,
      });
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch admin listings error:', err);
      setError('Failed to fetch platform listings for moderation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter, commodityFilter]);

  const openModerationModal = (listing, action) => {
    setModalListing(listing);
    setTargetStatus(action === 'relist' ? 'active' : 'delisted_by_admin');
    setAdminNote(listing.adminNotes || '');
  };

  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    if (!modalListing) return;

    setUpdating(true);
    try {
      const res = await api.moderateListing(modalListing._id, targetStatus, adminNote);
      setListings(listings.map((l) => (l._id === modalListing._id ? res.listing : l)));
      setModalListing(null);
    } catch (err) {
      alert(err.message || 'Failed to moderate listing.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Produce Quality & Compliance
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">Listing Moderation Desk</h1>
          <p className="text-xs text-stone-500">Delist non-compliant consignments, inspect moisture levels, and protect buyers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-stone-50 font-medium"
          >
            <option value="">All Commodities</option>
            <option value="Paddy">🌾 Paddy</option>
            <option value="Corn">🌽 Corn</option>
            <option value="Peanuts">🥜 Peanuts</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-stone-50 font-medium"
          >
            <option value="">All Listing States</option>
            <option value="active">Active Market Lots</option>
            <option value="delisted_by_admin">Delisted by Admin</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-stone-200 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
          <p className="font-bold text-stone-800 text-base">No Listings Found</p>
          <p className="text-xs text-stone-500">Try adjusting the commodity or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div
              key={l._id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-3 ${
                l.status === 'delisted_by_admin'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CommodityBadge commodity={l.commodity} size="sm" />
                    <GradeBadge grade={l.grade} size="sm" />
                    <StatusBadge status={l.status} type="listing" />
                    <span className="text-xs text-stone-500">
                      Seller: <strong className="text-stone-800">{l.seller?.companyName || l.seller?.name}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 mt-1">{l.title}</h3>
                  <p className="text-xs text-stone-500">
                    Variety: {l.variety} • Origin: {l.origin?.district}, {l.origin?.state}
                  </p>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-6 text-xs text-right">
                  <div>
                    <span className="text-stone-400 block">Rate</span>
                    <span className="text-lg font-black text-emerald-700">₹{Number(l.unitPrice).toLocaleString('en-IN')}</span>
                    <span className="text-stone-500">/{l.unit}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Stock</span>
                    <span className="text-lg font-bold text-stone-800">{l.quantity}</span>
                    <span className="text-stone-500"> {l.unit}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Moisture</span>
                    <span className={`text-lg font-bold ${l.moisturePercentage > 14 ? 'text-rose-600' : 'text-blue-700'}`}>
                      {l.moisturePercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Moderation Note (if present) */}
              {l.adminNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Moderation Notice:</span> {l.adminNotes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400">
                  Listed {new Date(l.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {l.status === 'delisted_by_admin' ? (
                    <button
                      onClick={() => openModerationModal(l, 'relist')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                    >
                      Relist Produce Lot
                    </button>
                  ) : (
                    <button
                      onClick={() => openModerationModal(l, 'delist')}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition-colors"
                    >
                      Delist from Marketplace
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Reason Modal */}
      {modalListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in">
            <h4 className="font-bold text-stone-900 text-base">
              {targetStatus === 'active' ? 'Relist Produce' : 'Delist Produce Listing'}
            </h4>
            <p className="text-xs text-stone-500">
              Listing: <strong className="text-stone-800">{modalListing.title}</strong>
            </p>

            <form onSubmit={handleModerateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Reason / Moderation Note</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Moisture percentage exceeds permissible threshold (16.5% > 14%). Suspended pending re-drying lab report."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalListing(null)}
                  className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-4 py-2 rounded-xl text-white font-bold transition-colors ${
                    targetStatus === 'active'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {updating ? 'Saving...' : targetStatus === 'active' ? 'Relist to Market' : 'Confirm Delisting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
