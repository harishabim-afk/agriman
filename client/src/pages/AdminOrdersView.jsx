import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommodityBadge } from '../components/CommodityBadge';
import { GradeBadge } from '../components/GradeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { 
  FileText, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpDown
} from 'lucide-react';

export const AdminOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminOrders({
        status: statusFilter,
        commodity: commodityFilter,
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch admin orders failed:', err);
      setError('Failed to fetch platform orders registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, commodityFilter]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            <FileText className="w-3.5 h-3.5" />
            Platform Transaction Registry
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">Global Agricultural Contracts</h1>
          <p className="text-xs text-stone-500">Oversee bulk order fulfillment, delivery milestones, and escrow clearing</p>
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
            <option value="">All Fulfillment Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-stone-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
          <p className="font-bold text-stone-800 text-base">No Orders Found</p>
          <p className="text-xs text-stone-500">Try clearing filters to inspect all platform activity.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Contract #</th>
                  <th className="py-3.5 px-4">Commodity</th>
                  <th className="py-3.5 px-4">Buyer Entity</th>
                  <th className="py-3.5 px-4">Seller Entity</th>
                  <th className="py-3.5 px-4">Volume & Total</th>
                  <th className="py-3.5 px-4">Escrow Status</th>
                  <th className="py-3.5 px-4 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Contract Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      <div>
                        <span>{o.orderNumber}</span>
                        <span className="block text-[10px] text-stone-400 font-sans">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Commodity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <CommodityBadge commodity={o.commodity} size="sm" />
                        <GradeBadge grade={o.grade} size="sm" />
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-900">{o.buyer?.companyName || o.buyer?.name}</p>
                      <p className="text-stone-400 text-[11px]">{o.deliveryAddress?.city}, {o.deliveryAddress?.state}</p>
                    </td>

                    {/* Seller */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-900 flex items-center gap-1">
                        <span>{o.seller?.companyName || o.seller?.name}</span>
                        {o.seller?.verifiedSeller && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                        )}
                      </p>
                    </td>

                    {/* Volume & Value */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block">{o.quantity} {o.unit}</span>
                      <span className="text-emerald-700 font-extrabold">₹{Number(o.totalAmount).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Escrow Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.paymentStatus === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={o.status} type="order" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
