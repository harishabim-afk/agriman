import React from 'react';

export const StatusBadge = ({ status, type = 'order' }) => {
  const orderConfigs = {
    pending: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Pending Review',
    },
    accepted: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Accepted by Seller',
    },
    processing: {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      dot: 'bg-purple-500',
      label: 'Processing & Bagging',
    },
    shipped: {
      bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      dot: 'bg-cyan-500',
      label: 'In Transit / Shipped',
    },
    delivered: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Delivered',
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Cancelled',
    },
    rejected: {
      bg: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Declined',
    },
  };

  const userConfigs = {
    active: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Active',
    },
    suspended: {
      bg: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Suspended',
    },
    pending_verification: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Verification Pending',
    },
  };

  const listingConfigs = {
    active: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Active in Market',
    },
    sold_out: {
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      dot: 'bg-stone-400',
      label: 'Stock Exhausted',
    },
    delisted_by_admin: {
      bg: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Moderated / Delisted',
    },
    archived: {
      bg: 'bg-stone-100 text-stone-600 border-stone-200',
      dot: 'bg-stone-400',
      label: 'Archived',
    },
  };

  const configMap = type === 'user' ? userConfigs : type === 'listing' ? listingConfigs : orderConfigs;
  const config = configMap[status] || {
    bg: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-400',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
