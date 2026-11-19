import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { OrderModal } from '../components/OrderModal';
import { 
  Search, 
  Filter, 
  MapPin, 
  Droplets, 
  Layers, 
  ArrowUpDown, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export const MarketplaceView = ({ onNavigateToOrders }) => {
  const { user, role, quickLogin } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxMoisture, setMaxMoisture] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Selected listing for ordering
  const [activeOrderListing, setActiveOrderListing] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getListings({
        commodity: selectedCommodity,
        grade: selectedGrade,
        search: searchQuery,
        location: locationQuery,
        minPrice,
        maxPrice,
        maxMoisture,
        sortBy,
      });
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch listings failed:', err);
      setError('Unable to load produce listings. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCommodity, selectedGrade, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setSelectedCommodity('');
    setSelectedGrade('');
    setSearchQuery('');
    setLocationQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMaxMoisture('');
    setSortBy('latest');
  };

  const handleOrderClick = async (listing) => {
    if (!user) {
      // Auto login as buyer demo for convenience
      await quickLogin('buyer');
    }
    setActiveOrderListing(listing);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Hero Banner with Agricultural Ticker */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10 text-9xl">
          🌾🌽🥜
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            National Bulk Grain & Oilseed Exchange
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Direct Farm Sourcing for <span className="text-amber-300">Paddy</span>, <span className="text-amber-200">Corn</span> & <span className="text-amber-300">Peanuts</span>
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Verified producer cooperatives, standardized moisture lab certification, transparent wholesale prices, and secure escrow settlement.
          </p>
          
          {/* Commodity Quick Filters */}
          <div className="pt-2 flex flex-wrap gap-2">
            {[
              { id: '', label: 'All Commodities' },
              { id: 'Paddy', label: '🌾 Paddy Rice' },
              { id: 'Corn', label: '🌽 Yellow Corn' },
              { id: 'Peanuts', label: '🥜 Peanuts / Groundnut' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommodity(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCommodity === c.id
                    ? 'bg-amber-400 text-stone-900 shadow-lg shadow-amber-400/20 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search variety, title, origin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="State or District (e.g. Punjab, Gujarat)..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50 font-medium text-stone-700"
            >
              <option value="">All Quality Grades</option>
              <option value="Grade A">Grade A (Premium / Export)</option>
              <option value="Grade B">Grade B (Standard Milling)</option>
              <option value="Grade C">Grade C (Feed / Industrial)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50 font-medium text-stone-700"
            >
              <option value="latest">Sort: Recently Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="moisture_asc">Moisture: Lowest First</option>
              <option value="quantity_desc">Quantity: High Volume</option>
            </select>
          </div>
        </form>

        {/* Secondary Filters: Price & Moisture */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Fine Filters:
            </span>

            {/* Price Inputs */}
            <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
              <span>Price: ₹</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-16 bg-transparent outline-none text-stone-800"
              />
              <span>- ₹</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-16 bg-transparent outline-none text-stone-800"
              />
            </div>

            {/* Max Moisture Input */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Max Moisture:</span>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 12"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(e.target.value)}
                className="w-12 bg-transparent outline-none text-stone-800 font-semibold"
              />
              <span>%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-stone-500 hover:text-stone-800 font-medium transition-colors"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={fetchListings}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm animate-pulse space-y-4">
              <div className="h-40 bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="h-8 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-center space-y-2">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchListings}
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            🌾
          </div>
          <h3 className="text-lg font-bold text-stone-800">No Produce Listings Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try adjusting your commodity selection, moisture ceiling, or price ranges to view other available harvest consignments.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const isMoistureOptimal = listing.moisturePercentage <= 12.5;

            return (
              <div
                key={listing._id}
                className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Produce Image & Top Badges */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/20" />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <CommodityBadge commodity={listing.commodity} size="sm" />
                    <GradeBadge grade={listing.grade} size="sm" />
                  </div>

                  {/* Moisture Gauge Pill */}
                  <div
                    className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-sm flex items-center gap-1 ${
                      isMoistureOptimal
                        ? 'bg-emerald-950/70 text-emerald-200 border-emerald-400/40'
                        : 'bg-amber-950/70 text-amber-200 border-amber-400/40'
                    }`}
                  >
                    <Droplets className="w-3 h-3 text-cyan-300" />
                    <span>Moisture: {listing.moisturePercentage}%</span>
                  </div>

                  {/* Minimum Order Tag */}
                  <div className="absolute bottom-3 right-3 text-[11px] bg-black/60 backdrop-blur-md text-stone-200 px-2 py-0.5 rounded-md font-medium">
                    MOQ: {listing.minimumOrderQuantity} {listing.unit}
                  </div>
                </div>

                {/* Content Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {listing.title}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-1">
                      Variety: <span className="font-semibold text-stone-700">{listing.variety}</span> • Packaging: {listing.packagingType}
                    </p>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {listing.description || 'Verified grain lot stored under regulated temperature and moisture guidelines.'}
                    </p>
                  </div>

                  {/* Origin & Seller */}
                  <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{listing.origin?.district}, {listing.origin?.state}</span>
                      </span>
                      <span className="font-semibold text-stone-700">
                        {listing.quantity} {listing.unit} left
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <span className="font-medium truncate max-w-[170px]">
                          {listing.seller?.companyName || listing.seller?.name || 'Verified Cooperative'}
                        </span>
                        {listing.seller?.verifiedSeller && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Producer" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Wholesale Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-700">₹{Number(listing.unitPrice).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-stone-500 font-medium">/ {listing.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOrderClick(listing)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Place Bulk Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Order Modal */}
      {activeOrderListing && (
        <OrderModal
          listing={activeOrderListing}
          onClose={() => setActiveOrderListing(null)}
          onOrderPlaced={(newOrder) => {
            fetchListings();
            if (onNavigateToOrders) onNavigateToOrders();
          }}
        />
      )}
    </div>
  );
};
