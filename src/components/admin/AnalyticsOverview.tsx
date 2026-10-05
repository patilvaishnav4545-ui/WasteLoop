import React from 'react';
import { BarChart3, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';

interface AnalyticsOverviewProps {
  categories: Record<string, number>;
  totalRecoveredKg: number;
  avgCollectionTimeMins: number;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  categories,
  totalRecoveredKg,
  avgCollectionTimeMins,
}) => {
  const maxCategoryVal = Math.max(...Object.values(categories), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Bar Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Waste Stream Breakdown</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Volume</span>
        </div>

        <div className="space-y-3 pt-2">
          {Object.entries(categories).map(([cat, count]) => {
            const percentage = Math.round((count / maxCategoryVal) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{cat} Waste</span>
                  <span className="text-emerald-400 font-mono">{count} reports</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Operational KPIs */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Circular Operational Performance</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Audit Verified</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Material Recovered</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{totalRecoveredKg} kg</p>
            <p className="text-[10px] text-slate-500">Recycled / Composting</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Avg Collection Velocity</span>
            <p className="text-2xl font-black text-teal-300 font-mono">{avgCollectionTimeMins} mins</p>
            <p className="text-[10px] text-slate-500">Report to Pickup</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Traceability Guarantee</span>
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            100% of reported municipal waste streams are tracked with complete digital audit logs from citizen capture to final processing plant.
          </p>
        </div>
      </div>
    </div>
  );
};
