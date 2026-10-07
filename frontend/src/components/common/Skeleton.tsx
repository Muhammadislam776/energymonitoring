import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 shadow-card ${height} flex flex-col justify-between`}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex-1 flex items-end gap-3 pt-4">
        {[40, 65, 85, 30, 95, 50, 70, 60, 80, 45].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t-md animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};
