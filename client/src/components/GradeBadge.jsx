import React from 'react';

export const GradeBadge = ({ grade, size = 'md' }) => {
  const configs = {
    'Grade A': {
      bg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
      icon: '★',
      label: 'Grade A (Export/Premium)',
    },
    'Grade B': {
      bg: 'bg-blue-100/90 text-blue-900 border-blue-300',
      icon: '◆',
      label: 'Grade B (Standard Mill)',
    },
    'Grade C': {
      bg: 'bg-stone-200/90 text-stone-800 border-stone-300',
      icon: '●',
      label: 'Grade C (Feed/Industrial)',
    },
  };

  const config = configs[grade] || {
    bg: 'bg-stone-100 text-stone-700 border-stone-200',
    icon: '•',
    label: grade,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border tracking-wide uppercase ${config.bg} ${sizeClasses}`}
      title={config.label}
    >
      <span className="text-[10px]">{config.icon}</span>
      <span>{grade}</span>
    </span>
  );
};
