import React, { useEffect, useState } from 'react';
import { Recycle, ArrowRight, ShieldCheck, Truck, Factory, UserCheck, Sparkles } from 'lucide-react';
import { Role } from '../../types';

interface SplashScreenProps {
  onStart: (role: Role) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8">
        {/* Animated Icon */}
        <div className="inline-flex relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-1 shadow-2xl shadow-emerald-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Recycle className="w-12 h-12 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-lg font-bold text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ready</span>
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            WasteLoop
          </h1>
          <p className="text-lg font-semibold text-emerald-400 tracking-wide flex items-center justify-center gap-2">
            <span>Report</span>
            <span className="text-slate-600">·</span>
            <span>Collect</span>
            <span className="text-slate-600">·</span>
            <span>Recover</span>
          </p>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Real-time municipal waste reporting, automated AI classification, collector dispatch, facility sorting & circular material recovery.
          </p>
        </div>

        {loading ? (
          <div className="pt-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">
              Initializing WasteLoop Platform...
            </p>
          </div>
        ) : (
          <div className="pt-4 space-y-4 animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Select Your Role to Enter Platform:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
              <button
                onClick={() => onStart('ROLE_CITIZEN')}
                className="group p-4 bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/10 flex items-center gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300">
                    Citizen
                  </h3>
                  <p className="text-[11px] text-slate-400">Report dumped waste with GPS & photo</p>
                </div>
              </button>

              <button
                onClick={() => onStart('ROLE_COLLECTOR')}
                className="group p-4 bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all shadow-lg hover:shadow-amber-500/10 flex items-center gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300">
                    Collector
                  </h3>
                  <p className="text-[11px] text-slate-400">Accept tasks & upload collection proof</p>
                </div>
              </button>

              <button
                onClick={() => onStart('ROLE_FACILITY')}
                className="group p-4 bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300">
                    Facility Operator
                  </h3>
                  <p className="text-[11px] text-slate-400">Record sorting & material recovery</p>
                </div>
              </button>

              <button
                onClick={() => onStart('ROLE_ADMIN')}
                className="group p-4 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/10 flex items-center gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-rose-300">
                    Admin
                  </h3>
                  <p className="text-[11px] text-slate-400">Live map, verification & analytics</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
