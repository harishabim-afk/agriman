import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MarketplaceView } from './pages/MarketplaceView';
import { BuyerOrdersView } from './pages/BuyerOrdersView';
import { SellerInventoryView } from './pages/SellerInventoryView';
import { SellerOrdersView } from './pages/SellerOrdersView';
import { AdminOverviewView } from './pages/AdminOverviewView';
import { AdminUsersView } from './pages/AdminUsersView';
import { AdminListingsView } from './pages/AdminListingsView';
import { AdminOrdersView } from './pages/AdminOrdersView';
import { AuthView } from './pages/AuthView';
import { CreateListingModal } from './components/CreateListingModal';

export const App = () => {
  const { user, role, loading } = useAuth();
  const [currentView, setCurrentView] = useState('marketplace');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Sync initial view when user role changes
  useEffect(() => {
    if (role === 'seller' && (currentView === 'marketplace' || currentView === 'login' || currentView === 'register')) {
      setCurrentView('seller-inventory');
    } else if (role === 'admin' && (currentView === 'marketplace' || currentView === 'login' || currentView === 'register')) {
      setCurrentView('admin-overview');
    } else if (role === 'buyer' && (currentView === 'seller-inventory' || currentView === 'admin-overview')) {
      setCurrentView('marketplace');
    }
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">Connecting to AgroHarvest Exchange...</p>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'marketplace':
        return <MarketplaceView onNavigateToOrders={() => setCurrentView('buyer-orders')} />;

      case 'buyer-orders':
        return <BuyerOrdersView onBrowseMore={() => setCurrentView('marketplace')} />;

      case 'seller-inventory':
        return (
          <SellerInventoryView
            onOpenCreate={() => {
              setEditingListing(null);
              setCreateModalOpen(true);
            }}
            onEditListing={(listing) => {
              setEditingListing(listing);
              setCreateModalOpen(true);
            }}
          />
        );

      case 'seller-orders':
        return <SellerOrdersView />;

      case 'admin-overview':
        return <AdminOverviewView onNavigateTab={(tab) => setCurrentView(tab)} />;

      case 'admin-users':
        return <AdminUsersView />;

      case 'admin-listings':
        return <AdminListingsView />;

      case 'admin-orders':
        return <AdminOrdersView />;

      case 'login':
        return (
          <AuthView
            initialMode="login"
            onSuccess={() => {
              setCurrentView(role === 'seller' ? 'seller-inventory' : role === 'admin' ? 'admin-overview' : 'marketplace');
            }}
          />
        );

      case 'register':
        return (
          <AuthView
            initialMode="register"
            onSuccess={() => {
              setCurrentView(role === 'seller' ? 'seller-inventory' : role === 'admin' ? 'admin-overview' : 'marketplace');
            }}
          />
        );

      default:
        return <MarketplaceView onNavigateToOrders={() => setCurrentView('buyer-orders')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openCreateModal={() => {
          setEditingListing(null);
          setCreateModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {renderMainContent()}
      </main>

      {/* Global Listing Create/Edit Modal for Sellers */}
      {createModalOpen && (
        <CreateListingModal
          listing={editingListing}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingListing(null);
          }}
          onSaved={() => {
            setCreateModalOpen(false);
            setEditingListing(null);
            // Refresh view
            if (currentView === 'seller-inventory') {
              setCurrentView('seller-inventory');
            }
          }}
        />
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
