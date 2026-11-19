import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, User, Building, MapPin, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthView = ({ initialMode = 'login', onSuccess }) => {
  const { login, register, quickLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          companyName,
          phone,
          location: { state, city },
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (targetRole) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(targetRole);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-6 text-white text-center space-y-2">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <Sprout className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black tracking-tight">
          Agro<span className="text-emerald-400">Harvest</span> Portal
        </h2>
        <p className="text-xs text-emerald-100/80">
          {isLogin ? 'Sign in to access bulk commodity exchange' : 'Create your agricultural trader account'}
        </p>
      </div>

      {/* Demo Fast Login Buttons */}
      <div className="p-5 bg-stone-50 border-b border-stone-200/80 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block text-center">
          ⚡ One-Click Test Accounts
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoLogin('buyer')}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-stone-800 font-bold transition-all shadow-sm text-center"
          >
            <span className="block text-base">🌾</span>
            <span>Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('seller')}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-stone-800 font-bold transition-all shadow-sm text-center"
          >
            <span className="block text-base">🚜</span>
            <span>Seller</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-purple-400 hover:bg-purple-50/50 text-stone-800 font-bold transition-all shadow-sm text-center"
          >
            <span className="block text-base">🛡️</span>
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Toggle Login / Register Tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2 rounded-lg transition-all ${
              isLogin ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2 rounded-lg transition-all ${
              !isLogin ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Register Fields */}
        {!isLogin && (
          <div className="space-y-3 animate-in fade-in text-xs">
            {/* Account Role Selector */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Account Role *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    role === 'buyer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  🌾 Buyer / Mill
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    role === 'seller'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  🚜 Producer / Seller
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. David Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Company / Cooperative Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. Sterling Food Mills Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">State *</label>
                <input
                  type="text"
                  placeholder="e.g. Punjab / Iowa"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">City</label>
                <input
                  type="text"
                  placeholder="e.g. Amritsar"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Email & Password */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In to AgroHarvest' : 'Create Trader Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
