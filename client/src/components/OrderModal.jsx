import React, { useState } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from './CommodityBadge';
import { GradeBadge } from './GradeBadge';
import { X, ShieldCheck, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export const OrderModal = ({ listing, onClose, onOrderPlaced }) => {
  const [quantity, setQuantity] = useState(listing?.minimumOrderQuantity || 1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: listing?.origin?.state || '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
  });
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!listing) return null;

  const totalAmount = Number((quantity * listing.unitPrice).toFixed(2));
  const isQtyValid = quantity >= listing.minimumOrderQuantity && quantity <= listing.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isQtyValid) {
      setError(`Quantity must be between ${listing.minimumOrderQuantity} and ${listing.quantity} ${listing.unit}`);
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      setError('Please provide complete delivery address fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createOrder({
        listingId: listing._id,
        quantity: Number(quantity),
        deliveryAddress,
        deliveryNotes,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onOrderPlaced) onOrderPlaced(res.order);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to place bulk order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <CommodityBadge commodity={listing.commodity} size="sm" />
            <GradeBadge grade={listing.grade} size="sm" />
            <span className="text-xs text-stone-500 font-medium">Bulk Purchase Request</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Order Placed Successfully!</h3>
            <p className="text-sm text-stone-600">
              Your bulk order for <span className="font-semibold text-stone-900">{quantity} {listing.unit}</span> has been transmitted to the seller. Funds are secured in escrow hold.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Listing Summary */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
              <h4 className="font-bold text-stone-900 text-base leading-snug">{listing.title}</h4>
              <p className="text-xs text-stone-500 mt-0.5">Variety: {listing.variety}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-200/60 text-xs">
                <div>
                  <span className="text-stone-500 block">Unit Price</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{Number(listing.unitPrice).toLocaleString('en-IN')} / {listing.unit}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Moisture Level</span>
                  <span className="font-semibold text-stone-800">{listing.moisturePercentage}%</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Stock Available</span>
                  <span className="font-semibold text-stone-800">{listing.quantity} {listing.unit}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Minimum Order</span>
                  <span className="font-semibold text-stone-800">{listing.minimumOrderQuantity} {listing.unit}</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Origin: {listing.origin.district}, {listing.origin.state}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Quantity Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-stone-700">Order Quantity ({listing.unit}) *</label>
                <span className="text-stone-500">
                  Min: {listing.minimumOrderQuantity} | Max: {listing.quantity} {listing.unit}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={listing.minimumOrderQuantity}
                  max={listing.quantity}
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-semibold text-stone-800"
                />
                <span className="absolute right-3.5 top-3 text-xs font-medium text-stone-400">
                  {listing.unit}
                </span>
              </div>
              {!isQtyValid && (
                <p className="text-[11px] text-rose-600">
                  Quantity must be between {listing.minimumOrderQuantity} and {listing.quantity} {listing.unit}.
                </p>
              )}
            </div>

            {/* Total Calculation Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-900 font-medium block">Total Payable (Escrow Protected)</span>
                <span className="text-xs text-emerald-700">
                  {quantity} {listing.unit} × ₹{Number(listing.unitPrice).toLocaleString('en-IN')}/{listing.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-800">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">Destination Delivery Address</h5>
              <div className="space-y-2.5 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Street Address / Warehouse Silo Gate *"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    required
                    className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                    required
                    className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Pincode / ZIP *"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                    required
                    className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Receiver Name"
                    value={deliveryAddress.contactPerson}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, contactPerson: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact Receiver Phone"
                    value={deliveryAddress.contactPhone}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, contactPhone: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <textarea
                  rows="2"
                  placeholder="Special unloading instructions, rail siding number, moisture testing specifications..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
                />
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="flex items-center gap-2 text-stone-500 text-xs bg-stone-100 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                AgroHarvest Escrow Guarantee: Payment is withheld until consignment delivery and quality clearance.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isQtyValid}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                {loading ? 'Submitting Order...' : `Confirm Bulk Order (₹${totalAmount.toLocaleString('en-IN')})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
