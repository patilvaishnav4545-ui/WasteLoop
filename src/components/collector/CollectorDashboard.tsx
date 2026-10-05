import React, { useState } from 'react';
import { WasteReport, ReportStatus, Facility } from '../../types';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  ArrowRight,
  X,
  Building2,
  Check,
  Navigation,
  FileCheck,
} from 'lucide-react';
import { SAMPLE_WASTE_PHOTOS } from '../../data/mockData';

interface CollectorDashboardProps {
  collectorName: string;
  reports: WasteReport[];
  facilities: Facility[];
  onUpdateStatus: (
    reportId: string,
    status: ReportStatus,
    proofData?: {
      beforeImageUrl?: string;
      afterImageUrl?: string;
      collectedKg?: number;
      notes?: string;
      targetFacilityId?: string;
    }
  ) => Promise<void>;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  collectorName,
  reports,
  facilities,
  onUpdateStatus,
}) => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);

  // Proof form state
  const [beforeImg, setBeforeImg] = useState<string>('');
  const [afterImg, setAfterImg] = useState<string>(SAMPLE_WASTE_PHOTOS.AfterCollected);
  const [collectedKg, setCollectedKg] = useState<number>(100);
  const [notes, setNotes] = useState<string>('Site cleared completely and packaged for facility transit.');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'fac-1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tasks filter
  const myAssignedTasks = reports.filter(
    (r) => ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED'].includes(r.status)
  );
  const completedTasks = reports.filter((r) =>
    ['COLLECTED', 'RECEIVED_AT_FACILITY', 'SORTING', 'PROCESSING', 'COMPLETED'].includes(r.status)
  );

  const handleOpenProofModal = (report: WasteReport) => {
    setSelectedReport(report);
    setBeforeImg(report.points[0]?.imageUrl || SAMPLE_WASTE_PHOTOS.Plastic);
    setShowProofModal(true);
  };

  const handleSubmitProof = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(selectedReport.id, 'COLLECTED', {
        beforeImageUrl: beforeImg,
        afterImageUrl: afterImg,
        collectedKg,
        notes,
        targetFacilityId: selectedFacilityId,
      });
      setShowProofModal(false);
      setSelectedReport(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Collector Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Truck className="w-4 h-4" />
            <span>Collector Dispatch Center</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Collector Dashboard — {collectorName}
          </h1>
          <p className="text-xs text-slate-400">
            Accept collection assignments, track routes, and upload proof of waste collection.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Active Tasks</span>
            <p className="text-xl font-extrabold text-amber-400 font-mono">{myAssignedTasks.length}</p>
          </div>
          <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Completed</span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Active Collection Tasks Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
          Assigned Tasks ({myAssignedTasks.length})
        </h2>

        {myAssignedTasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-300 font-bold">All collection tasks cleared!</p>
            <p className="text-[11px] text-slate-500">Waiting for Admin to dispatch new reports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedTasks.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-400 text-sm">{report.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold uppercase">
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <img
                      src={report.points[0]?.imageUrl}
                      alt={report.id}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{report.location.address}</span>
                      </p>
                      <p className="text-slate-400">Category: <span className="text-slate-200 font-semibold">{report.primaryCategory} Waste</span></p>
                      <p className="text-slate-400">Reporter: <span className="text-slate-300">{report.citizenName}</span></p>
                    </div>
                  </div>
                </div>

                {/* Pipeline Controls */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                  {report.status === 'ASSIGNED' && (
                    <button
                      onClick={() => onUpdateStatus(report.id, 'ACCEPTED')}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Task</span>
                    </button>
                  )}

                  {report.status === 'ACCEPTED' && (
                    <button
                      onClick={() => onUpdateStatus(report.id, 'ON_THE_WAY')}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>On The Way</span>
                    </button>
                  )}

                  {report.status === 'ON_THE_WAY' && (
                    <button
                      onClick={() => onUpdateStatus(report.id, 'ARRIVED')}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Arrived at Site</span>
                    </button>
                  )}

                  {report.status === 'ARRIVED' && (
                    <button
                      onClick={() => handleOpenProofModal(report)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Mark Collected + Proof</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Collections List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono">
          Completed Collections ({completedTasks.length})
        </h2>

        <div className="space-y-2">
          {completedTasks.map((report) => (
            <div
              key={report.id}
              className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white font-mono">{report.id}</span>
                  <p className="text-slate-400 text-[11px]">{report.location.address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold font-mono">
                  {report.collectionProof?.collectedKg || 100} kg
                </span>
                <p className="text-[10px] text-slate-500">{report.facilityName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Proof Modal */}
      {showProofModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-8">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Upload Collection Proof — {selectedReport.id}</h3>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Before & After Photo Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Before Photo:</span>
                  <img src={beforeImg} alt="Before" className="w-full h-28 object-cover rounded-xl border border-slate-800" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400">After Cleared Photo:</span>
                  <img src={afterImg} alt="After" className="w-full h-28 object-cover rounded-xl border border-slate-800" />
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200">Collected Quantity (Measured kg):</label>
                <input
                  type="number"
                  value={collectedKg}
                  onChange={(e) => setCollectedKg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-sm"
                />
              </div>

              {/* Target Facility Dropdown */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200">Transfer Waste To Facility:</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200">Collection Notes:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <button
                onClick={handleSubmitProof}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-xl shadow-emerald-500/20"
              >
                {isSubmitting ? 'Recording Collection...' : 'MARK AS COLLECTED & TRANSFER TO FACILITY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
