import React from 'react';
import { Hotspot } from '../../types';
import { Flame, MapPin, AlertCircle, Sparkles } from 'lucide-react';

interface HotspotAnalyticsProps {
  hotspots: Hotspot[];
}

export const HotspotAnalytics: React.FC<HotspotAnalyticsProps> = ({ hotspots }) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Waste Hotspots Analysis</h3>
            <p className="text-[11px] text-slate-400">High-frequency dumping locations over past 30 days</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase font-mono">
          Spatial Clustering
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotspots.map((hs) => (
          <div
            key={hs.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/30 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate max-w-[140px]">{hs.locationName}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {hs.reportCount30Days} Reports
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400">Top Category: <span className="text-emerald-400 font-bold">{hs.topCategory} Waste</span></p>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-snug">
                <strong className="text-amber-400 block mb-0.5 font-mono text-[10px] uppercase">Recommendation:</strong>
                {hs.recommendedAction}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
