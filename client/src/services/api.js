const RAW_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_URL
  ? (RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`)
  : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('agroharvest_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    }).then(handleResponse),

  // Listings (Marketplace)
  getListings: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        searchParams.append(key, val);
      }
    });
    return fetch(`${API_BASE}/listings?${searchParams.toString()}`).then(handleResponse);
  },

  getListingById: (id) =>
    fetch(`${API_BASE}/listings/${id}`).then(handleResponse),

  getSellerListings: () =>
    fetch(`${API_BASE}/listings/seller/my-listings`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createListing: (listingData) =>
    fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    }).then(handleResponse),

  updateListing: (id, listingData) =>
    fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    }).then(handleResponse),

  deleteListing: (id) =>
    fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Orders
  createOrder: (orderData) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    }).then(handleResponse),

  getBuyerOrders: () =>
    fetch(`${API_BASE}/orders/buyer/my-orders`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getSellerOrders: () =>
    fetch(`${API_BASE}/orders/seller/my-orders`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getOrderById: (id) =>
    fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateOrderStatus: (id, status, note = '') =>
    fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    }).then(handleResponse),

  cancelOrder: (id, reason = '') =>
    fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAdminUsers: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetch(`${API_BASE}/admin/users?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },

  verifySeller: (userId, verified) =>
    fetch(`${API_BASE}/admin/users/${userId}/verify-seller`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verified }),
    }).then(handleResponse),

  updateUserStatus: (userId, status) =>
    fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getAdminListings: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetch(`${API_BASE}/admin/listings?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },

  moderateListing: (listingId, status, adminNotes = '') =>
    fetch(`${API_BASE}/admin/listings/${listingId}/moderate`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    }).then(handleResponse),

  getAdminOrders: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetch(`${API_BASE}/admin/orders?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
};
