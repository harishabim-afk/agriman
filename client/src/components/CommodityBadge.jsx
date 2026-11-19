import React from 'react';

export const CommodityBadge = ({ commodity, size = 'md' }) => {
  const configs = {
    Paddy: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: '🌾',
      label: 'Paddy Rice',
    },
    Corn: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: '🌽',
      label: 'Yellow Corn',
    },
    Peanuts: {
      bg: 'bg-orange-50 text-orange-900 border-orange-200',
      dot: 'bg-orange-500',
      icon: '🥜',
      label: 'Peanuts / Groundnut',
    },
  };

  const config = configs[commodity] || {
    bg: 'bg-stone-100 text-stone-800 border-stone-200',
    dot: 'bg-stone-500',
    icon: '🌱',
    label: commodity || 'Grain',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}
    >
      <span className="text-sm leading-none">{config.icon}</span>
      <span>{commodity}</span>
    </span>
  );
};
