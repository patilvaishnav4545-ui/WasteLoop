import React, { useState } from 'react';
import { WasteReport, User, Hotspot, AuditLog, ReportStatus } from '../../types';
import { LiveMap } from './LiveMap';
import { HotspotAnalytics } from './HotspotAnalytics';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AuditLogsModal } from './AuditLogsModal';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  History,
  Check,
  X,
  MapPin,
  Sparkles,
  UserCheck,
  Layers,
  Building2,
  Boxes,
} from 'lucide-react';

interface AdminDashboardProps {
  adminName: string;
  reports: WasteReport[];
  collectors: User[];
  hotspots: Hotspot[];
  auditLogs: AuditLog[];
  onVerifyReport: (reportId: string, action: 'VERIFY' | 'REJECT' | 'MARK_DUPLICATE' | 'FLAG', note?: string) => Promise<void>;
  onAssignCollector: (reportId: string, collectorId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminName,
  reports,
  collectors,
  hotspots,
  auditLogs,
  onVerifyReport,
  onAssignCollector,
}) => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const [selectedCollectorId, setSelectedCollectorId] = useState<string>(collectors[0]?.id || 'u-2');
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metrics
  const totalReports = reports.length + 1240; // Total system historical
  const pending = reports.filter((r) => r.status === 'REPORTED').length;
  const verified = reports.filter((r) => r.status === 'VERIFIED').length;
  const assigned = reports.filter((r) => r.status === 'ASSIGNED').length;
  const collected = reports.filter((r) =>
    ['COLLECTED', 'RECEIVED_AT_FACILITY', 'SORTING', 'PROCESSING', 'COMPLETED'].includes(r.status)
  ).length;
  const processing = reports.filter((r) =>
    ['RECEIVED_AT_FACILITY', 'SORTING', 'PROCESSING'].includes(r.status)
  ).length;
  const completed = reports.filter((r) => r.status === 'COMPLETED').length;
  const suspicious = reports.filter((r) => ['SUSPICIOUS', 'DUPLICATE', 'REJECTED'].includes(r.status)).length;

  const handleOpenVerify = (report: WasteReport) => {
    setSelectedReport(report);
    setShowVerifyModal(true);
  };

  const handleOpenAssign = (report: WasteReport) => {
    setSelectedReport(report);
    setShowAssignModal(true);
  };

  const handleVerifyAction = async (action: 'VERIFY' | 'REJECT' | 'MARK_DUPLICATE' | 'FLAG') => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onVerifyReport(selectedReport.id, action, rejectionNote);
      setShowVerifyModal(false);
      setSelectedReport(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAction = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onAssignCollector(selectedReport.id, selectedCollectorId);
      setShowAssignModal(false);
      setSelectedReport(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category counts
  const categoriesCount: Record<string, number> = {
    Plastic: 0,
    Paper: 0,
    Metal: 0,
    Glass: 0,
    Organic: 0,
    'E-Waste': 0,
    Mixed: 0,
    Other: 0,
  };
  reports.forEach((r) => {
    categoriesCount[r.primaryCategory] = (categoriesCount[r.primaryCategory] || 0) + 1;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Municipal Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            WasteLoop Admin Console — {adminName}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time municipal report verification, collector dispatching, spatial map tracking & audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowAuditModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 self-start md:self-center"
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>View Audit Trail</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Reports', val: totalReports, color: 'text-white' },
          { label: 'Pending', val: pending, color: 'text-rose-400' },
          { label: 'Verified', val: verified, color: 'text-amber-400' },
          { label: 'Assigned', val: assigned, color: 'text-cyan-400' },
          { label: 'Collected', val: collected, color: 'text-blue-400' },
          { label: 'Processing', val: processing, color: 'text-purple-400' },
          { label: 'Completed', val: completed, color: 'text-emerald-400' },
          { label: 'Suspicious', val: suspicious, color: 'text-slate-400' },
        ].map((item) => (
          <div key={item.label} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase truncate block">{item.label}</span>
            <p className={`text-lg font-black font-mono ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Live Spatial Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
            Live City Waste Map
          </h2>
          <span className="text-xs text-slate-500">Click any pin on map to inspect report</span>
        </div>
        <LiveMap reports={reports} onSelectReport={(r) => setSelectedReport(r)} />
      </div>

      {/* Unverified / Action Required Queue */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
          Pending Verification & Dispatch Queue ({reports.filter((r) => ['REPORTED', 'VERIFIED'].includes(r.status)).length})
        </h2>

        <div className="space-y-3">
          {reports
            .filter((r) => ['REPORTED', 'VERIFIED'].includes(r.status))
            .map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={report.points[0]?.imageUrl}
                    alt={report.id}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">{report.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.status === 'REPORTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">
                        AI: {Math.round(report.aiValidation.confidence * 100)}% {report.primaryCategory}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{report.location.address}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Reporter: {report.citizenName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {report.status === 'REPORTED' ? (
                    <button
                      onClick={() => handleOpenVerify(report)}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenAssign(report)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Assign Collector</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Hotspots Section */}
      <HotspotAnalytics hotspots={hotspots} />

      {/* Analytics Overview */}
      <AnalyticsOverview
        categories={categoriesCount}
        totalRecoveredKg={1850}
        avgCollectionTimeMins={42}
      />

      {/* MODAL 1: REPORT VERIFICATION */}
      {showVerifyModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Verify Report — {selectedReport.id}</h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <img src={selectedReport.points[0]?.imageUrl} alt="Verification" className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-white">{selectedReport.location.address}</p>
                <p className="text-slate-400">Category: <span className="text-emerald-400 font-semibold">{selectedReport.primaryCategory}</span></p>
                <p className="text-slate-400">AI Confidence: <span className="text-white font-mono">{Math.round(selectedReport.aiValidation.confidence * 100)}%</span></p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Rejection / Flag Note (Optional):</label>
              <input
                type="text"
                placeholder="Reason if rejecting or marking duplicate..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleVerifyAction('VERIFY')}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                ✓ VERIFY REPORT
              </button>
              <button
                onClick={() => handleVerifyAction('REJECT')}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500 hover:text-slate-950"
              >
                ❌ REJECT
              </button>
              <button
                onClick={() => handleVerifyAction('MARK_DUPLICATE')}
                disabled={isSubmitting}
                className="py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs"
              >
                MARK DUPLICATE
              </button>
              <button
                onClick={() => handleVerifyAction('FLAG')}
                disabled={isSubmitting}
                className="py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs"
              >
                FLAG SUSPICIOUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN COLLECTOR */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Assign Collector — {selectedReport.id}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-200">Select Available Collector:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {collectors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCollectorId(c.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedCollectorId === c.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px]">
                      {c.activeTasksCount || 0} active tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAssignAction}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              DISPATCH TASK TO COLLECTOR
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDIT LOGS */}
      {showAuditModal && <AuditLogsModal logs={auditLogs} onClose={() => setShowAuditModal(false)} />}
    </div>
  );
};
