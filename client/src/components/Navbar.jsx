import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  Store, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Users, 
  PlusCircle, 
  LogOut, 
  UserCheck, 
  ChevronDown, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, openCreateModal }) => {
  const { user, role, logout, quickLogin } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleQuickSwitch = async (targetRole) => {
    try {
      await quickLogin(targetRole);
      setShowDemoMenu(false);
      if (targetRole === 'buyer') setCurrentView('marketplace');
      if (targetRole === 'seller') setCurrentView('seller-inventory');
      if (targetRole === 'admin') setCurrentView('admin-overview');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView(role === 'seller' ? 'seller-inventory' : role === 'admin' ? 'admin-overview' : 'marketplace')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                  Agro<span className="text-emerald-600">Harvest</span>
                </span>
                <span className="hidden sm:block text-[10px] font-semibold tracking-wider uppercase text-stone-400">
                  Bulk Agricultural Exchange
                </span>
              </div>
            </button>

            {/* Role Badge Indicator */}
            {user && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : role === 'seller'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {role} mode
              </span>
            )}
          </div>

          {/* Navigation Links based on active role */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Buyer Links */}
            {(role === 'buyer' || !user) && (
              <>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'marketplace'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Produce Market
                </button>
                {user && (
                  <button
                    onClick={() => setCurrentView('buyer-orders')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'buyer-orders'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Bulk Orders
                  </button>
                )}
              </>
            )}

            {/* Seller Links */}
            {role === 'seller' && (
              <>
                <button
                  onClick={() => setCurrentView('seller-inventory')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'seller-inventory'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  My Produce Listings
                </button>
                <button
                  onClick={() => setCurrentView('seller-orders')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'seller-orders'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Incoming Orders
                </button>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Produce
                </button>
              </>
            )}

            {/* Admin Links */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('admin-overview')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin-overview'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Platform Analytics
                </button>
                <button
                  onClick={() => setCurrentView('admin-users')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin-users'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Sellers & Users
                </button>
                <button
                  onClick={() => setCurrentView('admin-listings')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin-listings'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Listing Moderation
                </button>
                <button
                  onClick={() => setCurrentView('admin-orders')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin-orders'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  All Orders
                </button>
              </>
            )}
          </nav>

          {/* Right Action Menu: Fast Demo Switcher + Account */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 shadow-sm transition-all"
                title="Switch demo persona for testing"
              >
                <span>⚡ Test Roles</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showDemoMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowDemoMenu(false)}
                >
                  <div className="px-3 py-1.5 font-semibold text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-100">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('buyer')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 transition-colors ${
                      role === 'buyer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🌾</span>
                      <span>Buyer (Grain Mill)</span>
                    </span>
                    {role === 'buyer' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('seller')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 transition-colors ${
                      role === 'seller' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🚜</span>
                      <span>Seller (Cooperative)</span>
                    </span>
                    {role === 'seller' && <span className="text-amber-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 transition-colors ${
                      role === 'admin' ? 'bg-purple-50 text-purple-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>Admin (Platform)</span>
                    </span>
                    {role === 'admin' && <span className="text-purple-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Profile or Login Actions */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-semibold text-stone-800 line-clamp-1 flex items-center gap-1">
                      {user.name}
                      {user.verifiedSeller && (
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified Seller" />
                      )}
                    </p>
                    <p className="text-stone-500 text-[10px] capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900">{user.name}</p>
                      <p className="text-stone-500 text-[11px] truncate">{user.email}</p>
                      {user.companyName && (
                        <p className="text-emerald-700 font-medium text-[10px] mt-0.5">{user.companyName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        setCurrentView('marketplace');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
