import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Sprout, AlertCircle } from 'lucide-react';

export const CreateListingModal = ({ listing, onClose, onSaved }) => {
  const isEditing = !!listing;
  const [formData, setFormData] = useState({
    title: '',
    commodity: 'Paddy',
    variety: '',
    grade: 'Grade A',
    moisturePercentage: 11.5,
    quantity: 50,
    unit: 'Metric Tons',
    minimumOrderQuantity: 5,
    unitPrice: 28000,
    packagingType: '50kg Jute Bags',
    description: '',
    origin: {
      state: '',
      district: '',
      farmLocation: '',
      pincode: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        commodity: listing.commodity || 'Paddy',
        variety: listing.variety || '',
        grade: listing.grade || 'Grade A',
        moisturePercentage: listing.moisturePercentage || 12,
        quantity: listing.quantity || 1,
        unit: listing.unit || 'Metric Tons',
        minimumOrderQuantity: listing.minimumOrderQuantity || 1,
        unitPrice: listing.unitPrice || 100,
        packagingType: listing.packagingType || '50kg Jute Bags',
        description: listing.description || '',
        origin: {
          state: listing.origin?.state || '',
          district: listing.origin?.district || '',
          farmLocation: listing.origin?.farmLocation || '',
          pincode: listing.origin?.pincode || '',
        },
      });
    }
  }, [listing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.origin.state || !formData.origin.district) {
      setError('Title, state, and district are mandatory.');
      return;
    }

    setLoading(true);
    try {
      let saved;
      if (isEditing) {
        saved = await api.updateListing(listing._id, formData);
      } else {
        saved = await api.createListing(formData);
      }
      if (onSaved) onSaved(saved.listing);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {isEditing ? 'Edit Produce Listing' : 'Post New Agricultural Produce'}
              </h3>
              <p className="text-xs text-stone-500">List Paddy, Corn, or Peanuts directly on the wholesale exchange</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Commodity Selector (Paddy, Corn, Peanuts) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Commodity Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Paddy', label: 'Paddy Rice', icon: '🌾' },
                { id: 'Corn', label: 'Yellow Corn', icon: '🌽' },
                { id: 'Peanuts', label: 'Peanuts / Groundnut', icon: '🥜' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setFormData({ ...formData, commodity: c.id })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.commodity === c.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Listing Headline Title *</label>
              <input
                type="text"
                placeholder="e.g. Export Basmati 1121 Paddy (Long Grain)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Crop Variety</label>
              <input
                type="text"
                placeholder="e.g. Basmati 1121, Sona Masoori, Yellow Dent..."
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Grade & Moisture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Quality Grade *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="Grade A">Grade A (Export / Top Quality)</option>
                <option value="Grade B">Grade B (Standard Commercial Milling)</option>
                <option value="Grade C">Grade C (Feed / Industrial Grade)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Moisture Content (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="40"
                  value={formData.moisturePercentage}
                  onChange={(e) => setFormData({ ...formData, moisturePercentage: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-stone-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Quantity, Unit, Price, MOQ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Total Quantity *</label>
              <input
                type="number"
                min="1"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="Metric Tons">Metric Tons</option>
                <option value="Quintals">Quintals</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="Bags (50kg)">Bags (50kg)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Unit Price (₹) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  required
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-emerald-800"
                />
                <span className="absolute left-2.5 top-2 text-stone-500 font-bold">₹</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Min Order (MOQ) *</label>
              <input
                type="number"
                min="1"
                step="any"
                value={formData.minimumOrderQuantity}
                onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Origin Location */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">Produce Origin & Storage</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="State (e.g. Punjab, Gujarat) *"
                value={formData.origin.state}
                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, state: e.target.value } })}
                required
                className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="District (e.g. Amritsar) *"
                value={formData.origin.district}
                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, district: e.target.value } })}
                required
                className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Farm / Silo Location"
                value={formData.origin.farmLocation}
                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, farmLocation: e.target.value } })}
                className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Packaging (e.g. Jute Bags)"
                value={formData.packagingType}
                onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
                className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Produce Specifications & Milling Description</label>
            <textarea
              rows="3"
              placeholder="Detail testing parameters, pest management, harvest date, silo aeration..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              {loading ? 'Saving Produce...' : isEditing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
