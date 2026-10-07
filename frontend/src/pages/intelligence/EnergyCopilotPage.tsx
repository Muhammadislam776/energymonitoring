import React from 'react';
import { EnergyCopilotWidget } from '../../components/copilot/EnergyCopilotWidget';

export const EnergyCopilotPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
          Conversational Energy Intelligence
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Energy Copilot Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions about building power trends, floor consumption anomalies, and ROI efficiency opportunities backed by measured data.
        </p>
      </div>

      {/* Main Interactive Copilot Reasoning Canvas */}
      <EnergyCopilotWidget />
    </div>
  );
};
