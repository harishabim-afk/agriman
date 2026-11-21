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
import { SEOHead, organizationJsonLd, websiteJsonLd } from './components/SEOHead';

export const App = () => {
  const { user, role, loading } = useAuth();
  const [currentView, setCurrentView] = useState('marketplace');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  /** Returns SEO props based on the current view */
  const getSeoProps = () => {
    const viewSeoMap = {
      marketplace: {
        title: null, // Uses default title
        description:
          'Browse wholesale Paddy, Corn & Peanuts listings from verified Indian cooperatives. Filter by grade, moisture, price & origin. Transparent INR pricing with escrow protection.',
        canonicalPath: '/',
        keywords:
          'buy paddy online, wholesale corn India, peanuts groundnut bulk, agricultural marketplace, farm produce, INR grain prices, mandi rates',
        jsonLd: { ...websiteJsonLd },
      },
      'buyer-orders': {
        title: 'My Orders',
        description:
          'Track your bulk agricultural orders on AgroHarvest. View order status, shipment updates, and payment details for Paddy, Corn & Peanuts purchases.',
        canonicalPath: '/?view=buyer-orders',
        noIndex: true,
      },
      'seller-inventory': {
        title: 'Seller Inventory',
        description:
          'Manage your agricultural produce listings on AgroHarvest. Create, edit and track Paddy, Corn & Peanuts listings with real-time inventory management.',
        canonicalPath: '/?view=seller-inventory',
        noIndex: true,
      },
      'seller-orders': {
        title: 'Seller Orders',
        description:
          'Manage incoming orders and fulfillment for your agricultural produce on AgroHarvest.',
        canonicalPath: '/?view=seller-orders',
        noIndex: true,
      },
      'admin-overview': {
        title: 'Admin Dashboard',
        description: 'AgroHarvest admin dashboard – platform statistics and management.',
        canonicalPath: '/?view=admin-overview',
        noIndex: true,
      },
      'admin-users': {
        title: 'User Management',
        description: 'Manage users, verify sellers, and oversee accounts on AgroHarvest.',
        canonicalPath: '/?view=admin-users',
        noIndex: true,
      },
      'admin-listings': {
        title: 'Listings Management',
        description: 'Moderate and manage all agricultural produce listings on AgroHarvest.',
        canonicalPath: '/?view=admin-listings',
        noIndex: true,
      },
      'admin-orders': {
        title: 'Orders Management',
        description: 'Oversee all platform orders and transactions on AgroHarvest.',
        canonicalPath: '/?view=admin-orders',
        noIndex: true,
      },
      login: {
        title: 'Sign In',
        description:
          'Sign in to AgroHarvest to buy or sell Paddy, Corn & Peanuts on India\'s wholesale agricultural commodity marketplace.',
        canonicalPath: '/?view=login',
        keywords: 'AgroHarvest login, agri marketplace sign in, farmer login',
      },
      register: {
        title: 'Create Account',
        description:
          'Register as a Buyer or Seller on AgroHarvest – India\'s wholesale agricultural marketplace for Paddy, Corn & Peanuts. Free verified seller accounts.',
        canonicalPath: '/?view=register',
        keywords: 'AgroHarvest register, create seller account, agri marketplace signup',
      },
    };
    return viewSeoMap[currentView] || viewSeoMap.marketplace;
  };

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
      {/* Dynamic SEO Meta Tags */}
      <SEOHead {...getSeoProps()} />

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
