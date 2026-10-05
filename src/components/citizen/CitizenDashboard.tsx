import React, { useState } from 'react';
import { WasteReport, ReportStatus } from '../../types';
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Recycle,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  X,
  FileCheck2,
} from 'lucide-react';

interface CitizenDashboardProps {
  userName: string;
  reports: WasteReport[];
  onOpenReportModal: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  userName,
  reports,
  onOpenReportModal,
}) => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // Status counters
  const pendingCount = reports.filter((r) => ['REPORTED', 'VERIFIED'].includes(r.status)).length;
  const inProgressCount = reports.filter((r) =>
    ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'COLLECTED', 'RECEIVED_AT_FACILITY', 'SORTING', 'PROCESSING'].includes(
      r.status
    )
  ).length;
  const completedCount = reports.filter((r) => r.status === 'COMPLETED').length;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'REPORTED':
      case 'VERIFIED':
        return { label: 'Pending Verification', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'ON_THE_WAY':
      case 'ARRIVED':
        return { label: 'Collector Dispatched', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'COLLECTED':
      case 'RECEIVED_AT_FACILITY':
      case 'SORTING':
      case 'PROCESSING':
        return { label: 'In Facility Recovery', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'COMPLETED':
        return { label: 'Fully Processed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300' };
    }
  };

  // Full lifecycle stages check
  const lifecycleStages = [
    { key: 'REPORTED', title: '1. Report Created', desc: 'Citizen submitted waste photo & GPS location' },
    { key: 'VERIFIED', title: '2. Admin Verified', desc: 'Report verified and duplicate check cleared' },
    { key: 'ASSIGNED', title: '3. Collector Assigned', desc: 'Driver dispatched to waste site' },
    { key: 'COLLECTED', title: '4. Waste Collected', desc: 'Proof uploaded and dispatched to facility' },
    { key: 'RECEIVED_AT_FACILITY', title: '5. Facility Received', desc: 'Material weighed at facility scale' },
    { key: 'SORTING', title: '6. Physical Sorting', desc: 'Separated into Plastic, Paper, Metal streams' },
    { key: 'PROCESSING', title: '7. Material Processing', desc: 'Sent to registered recycling/composting plants' },
    { key: 'COMPLETED', title: '8. Circular Outcome', desc: 'Final recovery and residual stats logged' },
  ];

  const getStageIndex = (status: ReportStatus) => {
    const order: ReportStatus[] = [
      'REPORTED',
      'VERIFIED',
      'ASSIGNED',
      'ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'COLLECTED',
      'RECEIVED_AT_FACILITY',
      'SORTING',
      'PROCESSING',
      'COMPLETED',
    ];
    return order.indexOf(status);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Greeting */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Citizen Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hello, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Report dumped municipal waste, track real-time collector pickup, and follow your waste's journey through facility sorting and material recovery.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenReportModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>+ REPORT WASTE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports Status Summary */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
          My Reports & Eco-Impact Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Pending Verification</span>
              </span>
              <p className="text-2xl font-black text-white font-mono">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>In Progress</span>
              </span>
              <p className="text-2xl font-black text-white font-mono">{inProgressCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </span>
              <p className="text-2xl font-black text-white font-mono">{completedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Eco Impact Gamification Stat */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between shadow-lg shadow-emerald-500/10">
            <div className="space-y-1">
              <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Est. CO₂ Offset</span>
              </span>
              <p className="text-2xl font-black text-emerald-300 font-mono">
                {completedCount * 42} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
              Eco Hero
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
            Recent Reports ({reports.length})
          </h2>
          <span className="text-xs text-slate-500">Click any report to view lifecycle track</span>
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
              <Recycle className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No waste reports submitted yet.</p>
              <button
                onClick={onOpenReportModal}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                + Report Waste Now
              </button>
            </div>
          ) : (
            reports.map((report) => {
              const badge = getStatusBadge(report.status);
              const pointImg = report.points[0]?.imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="group p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={pointImg}
                      alt={report.id}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm font-mono">
                          {report.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-xs">{report.location.address}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Category: <span className="text-slate-300 font-semibold">{report.primaryCategory}</span> · {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Track Lifecycle</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report Lifecycle Tracking Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-8">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Waste Report Lifecycle Tracking</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedReport.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Summary Header */}
              <div className="flex gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <img
                  src={selectedReport.points[0]?.imageUrl}
                  alt={selectedReport.id}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white text-sm">{selectedReport.location.address}</p>
                  <p className="text-slate-400">Category: <span className="text-emerald-400 font-semibold">{selectedReport.primaryCategory}</span></p>
                  <p className="text-slate-400">Reporter: <span className="text-slate-200">{selectedReport.citizenName}</span></p>
                  {selectedReport.collectorName && (
                    <p className="text-slate-400">Collector: <span className="text-amber-300 font-semibold">{selectedReport.collectorName}</span></p>
                  )}
                  {selectedReport.facilityName && (
                    <p className="text-slate-400">Facility: <span className="text-indigo-300 font-semibold">{selectedReport.facilityName}</span></p>
                  )}
                </div>
              </div>

              {/* Lifecycle Progress Pipeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Full Circular Journey
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {lifecycleStages.map((stage) => {
                    const activeIdx = getStageIndex(selectedReport.status);
                    const stageIdx = getStageIndex(stage.key as ReportStatus);
                    const isPassed = activeIdx >= stageIdx && stageIdx !== -1;
                    const isCurrent = activeIdx === stageIdx;

                    return (
                      <div key={stage.key} className="relative flex items-start gap-3 text-xs">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border ${
                            isPassed
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          {isPassed ? '✓' : ''}
                        </div>

                        <div>
                          <p className={`font-bold ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                            {stage.title}
                          </p>
                          <p className="text-[11px] text-slate-400">{stage.desc}</p>

                          {/* Stage details if present */}
                          {stage.key === 'COLLECTED' && selectedReport.collectionProof && (
                            <div className="mt-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                              <p className="text-emerald-400 font-bold">✓ Collected Weight: {selectedReport.collectionProof.collectedKg} kg</p>
                              {selectedReport.collectionProof.notes && (
                                <p className="text-slate-400">Notes: {selectedReport.collectionProof.notes}</p>
                              )}
                            </div>
                          )}

                          {stage.key === 'COMPLETED' && selectedReport.facilityProcessing && (
                            <div className="mt-2 p-2.5 bg-slate-950 rounded-xl border border-emerald-500/30 text-[11px] space-y-1">
                              <p className="text-emerald-400 font-bold">🌱 Recovered Materials: {selectedReport.facilityProcessing.recoveredKg} kg</p>
                              <p className="text-slate-400">Residual: {selectedReport.facilityProcessing.residualKg} kg</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
