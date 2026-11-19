import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck, 
  XCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const SellerOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getSellerOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch seller orders error:', err);
      setError('Failed to fetch incoming orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openStatusUpdate = (order, newStatus) => {
    setStatusModalOrder(order);
    setTargetStatus(newStatus);
    setStatusNote('');
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalOrder || !targetStatus) return;

    setUpdating(true);
    try {
      await api.updateOrderStatus(statusModalOrder._id, targetStatus, statusNote);
      await fetchOrders();
      setStatusModalOrder(null);
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return o.status === 'pending';
    if (statusFilter === 'active') return ['accepted', 'processing', 'shipped'].includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            Seller Fulfillment Desk
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">Incoming Purchase Orders</h1>
          <p className="text-xs text-stone-500">Review buyer bids, dispatch shipments, and complete bulk orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Needs Acceptance' },
            { id: 'active', label: 'In Dispatch' },
            { id: 'delivered', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            📋
          </div>
          <h3 className="text-base font-bold text-stone-800">No Orders in this View</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When buyers place bulk procurement requests for your grain consignments, they will appear here for review and dispatch.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-5"
            >
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <CommodityBadge commodity={order.commodity} size="sm" />
                  <GradeBadge grade={order.grade} size="sm" />
                  <StatusBadge status={order.status} type="order" />
                </div>

                <div className="text-right text-xs text-stone-500">
                  <span>Received on {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Order Info & Buyer Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Volume & Revenue */}
                <div className="space-y-1">
                  <span className="text-stone-400 font-semibold uppercase">Volume & Agreed Rate</span>
                  <p className="text-sm font-bold text-stone-900">
                    {order.quantity} {order.unit} @ ₹{Number(order.unitPrice).toLocaleString('en-IN')}/{order.unit}
                  </p>
                  <p className="text-base font-extrabold text-emerald-700">
                    Total: ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Buyer Company & Location */}
                <div className="space-y-1">
                  <span className="text-stone-400 font-semibold uppercase">Procuring Buyer</span>
                  <p className="text-sm font-bold text-stone-900">
                    {order.buyer?.companyName || order.buyer?.name}
                  </p>
                  <p className="text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</span>
                  </p>
                  <p className="text-stone-500">
                    Contact: {order.deliveryAddress?.contactPerson || order.buyer?.name} ({order.deliveryAddress?.contactPhone || order.buyer?.phone || 'No phone'})
                  </p>
                </div>

                {/* Delivery Notes */}
                <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-stone-400 font-semibold uppercase block">Delivery Instructions</span>
                  <p className="text-stone-700 italic">
                    {order.deliveryNotes || 'Standard door-to-silo delivery requested.'}
                  </p>
                  <p className="text-stone-400 text-[11px] pt-1">
                    Address: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-2 text-stone-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Escrow: <strong className="capitalize text-stone-700">{order.paymentStatus}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openStatusUpdate(order, 'rejected')}
                        className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                      >
                        Decline Order
                      </button>
                      <button
                        onClick={() => openStatusUpdate(order, 'accepted')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-colors"
                      >
                        Accept Order
                      </button>
                    </>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => openStatusUpdate(order, 'processing')}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                    >
                      Mark Bagging & Processing
                    </button>
                  )}

                  {order.status === 'processing' && (
                    <button
                      onClick={() => openStatusUpdate(order, 'shipped')}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-colors"
                    >
                      Mark Shipped / In Transit
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => openStatusUpdate(order, 'delivered')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                    >
                      Confirm Delivery
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-4 h-4" /> Consignment Fulfilled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fulfillment Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in">
            <h4 className="font-bold text-stone-900 text-base">
              Update Order to <span className="capitalize text-amber-700">"{targetStatus}"</span>
            </h4>
            <p className="text-xs text-stone-500">
              Order: <span className="font-mono font-bold text-stone-800">{statusModalOrder.orderNumber}</span> ({statusModalOrder.quantity} {statusModalOrder.unit} {statusModalOrder.commodity})
            </p>

            <form onSubmit={handleConfirmStatusUpdate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Dispatch / Status Note (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Weighbridge certificate #9421 attached. Railway rake #89 loaded and departing station."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  {updating ? 'Updating...' : `Confirm ${targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
