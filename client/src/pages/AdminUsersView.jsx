import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Building2,
  Mail,
  MapPin
} from 'lucide-react';

export const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminUsers({
        role: roleFilter,
        status: statusFilter,
        search,
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Fetch admin users failed:', err);
      setError('Failed to fetch platform participants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleVerify = async (user) => {
    setActionLoadingId(user._id);
    try {
      const nextVerified = !user.verifiedSeller;
      const res = await api.verifySeller(user._id, nextVerified);
      setUsers(users.map((u) => (u._id === user._id ? res.user : u)));
    } catch (err) {
      alert(err.message || 'Failed to update seller verification.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuspend = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const confirmMsg = user.status === 'suspended'
      ? `Reactivate ${user.name}'s account?`
      : `Are you sure you want to suspend ${user.name}? They will be blocked from logging in.`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(user._id);
    try {
      const res = await api.updateUserStatus(user._id, nextStatus);
      setUsers(users.map((u) => (u._id === user._id ? res.user : u)));
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            <Users className="w-3.5 h-3.5" />
            Platform Directory & Access Control
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">Sellers, Buyers & Administrators</h1>
          <p className="text-xs text-stone-500">Authorize certified agricultural cooperatives and moderate suspicious activity</p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: '', label: 'All Users' },
            { id: 'seller', label: '🚜 Sellers' },
            { id: 'buyer', label: '🌾 Buyers' },
            { id: 'admin', label: '🛡️ Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-stone-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-stone-50/50 font-medium"
        >
          <option value="">All Account Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="pending_verification">Pending Verification</option>
          <option value="suspended">Suspended Accounts</option>
        </select>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-colors whitespace-nowrap"
        >
          Search Directory
        </button>
      </form>

      {/* Users Table */}
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
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
          <p className="font-bold text-stone-800 text-base">No Users Match Criteria</p>
          <p className="text-xs text-stone-500">Try modifying your query or role filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {users.map((u) => {
                  const isActionActive = actionLoadingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Email & Company */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            {u.name}
                            {u.verifiedSeller && (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified Producer" />
                            )}
                          </p>
                          <p className="text-stone-500 flex items-center gap-1 text-[11px]">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{u.email}</span>
                          </p>
                          {u.companyName && (
                            <p className="text-stone-600 flex items-center gap-1 text-[11px] font-medium">
                              <Building2 className="w-3 h-3 text-stone-400" />
                              <span>{u.companyName}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'seller'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-stone-600">
                        {u.location?.city || u.location?.state ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{[u.location?.city, u.location?.state].filter(Boolean).join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Verification Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === 'seller' ? (
                          u.verifiedSeller ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-medium">
                              Unverified
                            </span>
                          )
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.status} type="user" />
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Seller Verification Toggle */}
                          {u.role === 'seller' && (
                            <button
                              onClick={() => handleToggleVerify(u)}
                              disabled={isActionActive}
                              className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                                u.verifiedSeller
                                  ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {u.verifiedSeller ? 'Revoke Verification' : 'Verify Seller'}
                            </button>
                          )}

                          {/* Account Suspension Toggle (Admins cannot suspend other admins) */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleSuspend(u)}
                              disabled={isActionActive}
                              className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                                u.status === 'suspended'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
