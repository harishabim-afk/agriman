import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  Truck, 
  PackageCheck,
  ChevronDown,
  Info
} from 'lucide-react';

export const BuyerOrdersView = ({ onBrowseMore }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBuyerOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch buyer orders error:', err);
      setError('Failed to fetch your bulk purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending order? Reserved inventory will be returned to the seller.')) {
      return;
    }
    setCancellingId(orderId);
    try {
      await api.cancelOrder(orderId, 'Buyer requested cancellation from order dashboard');
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['pending', 'accepted', 'processing', 'shipped'].includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'delivered';
    if (statusFilter === 'cancelled') return ['cancelled', 'rejected'].includes(o.status);
    return true;
  });

  const getStepStatus = (currentStatus, stepIndex) => {
    const steps = ['pending', 'accepted', 'processing', 'shipped', 'delivered'];
    const curIdx = steps.indexOf(currentStatus);
    if (curIdx === -1) return 'inactive'; // e.g. cancelled
    if (curIdx > stepIndex) return 'complete';
    if (curIdx === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            Buyer Procurement Portal
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">My Bulk Commodity Orders</h1>
          <p className="text-xs text-stone-500">Track logistics status, inspection milestones, and escrow releases</p>
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
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
            <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-pulse space-y-3">
              <div className="h-5 bg-stone-200 rounded w-1/4" />
              <div className="h-12 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="text-base font-bold text-stone-800">No Orders in this View</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You have no orders matching the selected filter. Browse the marketplace to place fresh bulk orders for Paddy, Corn, or Peanuts.
          </p>
          {onBrowseMore && (
            <button
              onClick={onBrowseMore}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              Explore Produce Market
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const steps = [
              { key: 'pending', label: 'Placed' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'processing', label: 'Processing' },
              { key: 'shipped', label: 'In Transit' },
              { key: 'delivered', label: 'Delivered' },
            ];

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <CommodityBadge commodity={order.commodity} size="sm" />
                    <GradeBadge grade={order.grade} size="sm" />
                    <StatusBadge status={order.status} type="order" />
                  </div>

                  <div className="text-right text-xs text-stone-500">
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Main Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item and Quantity */}
                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 uppercase font-semibold">Commodity & Volume</span>
                    <p className="text-sm font-bold text-stone-900">
                      {order.quantity} {order.unit} • {order.commodity} ({order.grade})
                    </p>
                    <p className="text-xs text-stone-500">
                      Rate: ₹{Number(order.unitPrice).toLocaleString('en-IN')} / {order.unit}
                    </p>
                  </div>

                  {/* Supplier & Origin */}
                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 uppercase font-semibold">Producer / Supplier</span>
                    <p className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{order.seller?.companyName || order.seller?.name || 'Seller'}</span>
                      {order.seller?.verifiedSeller && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Producer" />
                      )}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</span>
                    </p>
                  </div>

                  {/* Price & Escrow Status */}
                  <div className="md:text-right space-y-1">
                    <span className="text-xs text-stone-400 uppercase font-semibold">Order Total</span>
                    <p className="text-xl font-black text-emerald-800">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.paymentStatus === 'refunded'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      Escrow: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Fulfillment Step Timeline Tracker (if not cancelled/rejected) */}
                {!['cancelled', 'rejected'].includes(order.status) && (
                  <div className="bg-stone-50/70 rounded-xl p-4 border border-stone-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-2">
                      <span>Fulfillment Pipeline</span>
                      <span className="text-stone-700 capitalize">{order.status} stage</span>
                    </div>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 z-0" />
                      {steps.map((step, idx) => {
                        const statusState = getStepStatus(order.status, idx);
                        const isComplete = statusState === 'complete';
                        const isCurrent = statusState === 'current';

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isComplete
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isComplete ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`mt-1.5 text-[11px] font-medium ${
                                isCurrent ? 'text-emerald-800 font-bold' : 'text-stone-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Actions & Timeline Expander */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 py-1"
                    >
                      <Info className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedOrder?._id === order._id ? 'Hide Timeline History' : 'View Audit Timeline'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${selectedOrder?._id === order._id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                    >
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>

                {/* Audit Timeline Details Accordion */}
                {selectedOrder?._id === order._id && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in text-xs">
                    <h5 className="font-bold text-stone-800">Order Audit Log & Notes</h5>
                    <div className="space-y-2">
                      {order.statusTimeline?.map((t, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-stone-200/60">
                          <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-stone-600">
                                {t.status}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {new Date(t.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-stone-700 mt-0.5">{t.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.deliveryNotes && (
                      <div className="pt-2 text-stone-600">
                        <span className="font-semibold text-stone-800 block">Buyer Delivery Instructions:</span>
                        <p className="bg-white p-2 rounded border border-stone-200/60 mt-1 italic">{order.deliveryNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
