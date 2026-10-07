import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'healthy' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false
}) => {
  const variantStyles = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${variant === 'healthy' ? 'live-pulse-dot' : 'animate-ping'}`} />
      )}
      {children}
    </span>
  );
};
