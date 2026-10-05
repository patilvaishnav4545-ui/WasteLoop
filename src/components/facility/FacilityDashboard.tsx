import React, { useState } from 'react';
import { WasteReport, WasteCategory, Facility } from '../../types';
import {
  Factory,
  Scale,
  Boxes,
  Recycle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  X,
  Building2,
  Info,
} from 'lucide-react';

interface FacilityDashboardProps {
  operatorName: string;
  reports: WasteReport[];
  facilityInfo: Facility;
  onReceiveBatch: (reportId: string, receivedKg: number) => Promise<void>;
  onSortBatch: (reportId: string, sortingBreakdown: Record<WasteCategory, number>) => Promise<void>;
  onProcessBatch: (
    reportId: string,
    processingDestinations: Array<{ category: WasteCategory; quantityKg: number; destination: string; method: string }>
  ) => Promise<void>;
}

export const FacilityDashboard: React.FC<FacilityDashboardProps> = ({
  operatorName,
  reports,
  facilityInfo,
  onReceiveBatch,
  onSortBatch,
  onProcessBatch,
}) => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [activeModal, setActiveModal] = useState<'RECEIVE' | 'SORT' | 'PROCESS' | null>(null);

  // Modal forms state
  const [measuredGrossKg, setMeasuredGrossKg] = useState<number>(100);

  const [sortingValues, setSortingValues] = useState<Record<WasteCategory, number>>({
    Plastic: 30,
    Paper: 20,
    Metal: 10,
    Glass: 5,
    Organic: 25,
    'E-Waste': 0,
    Mixed: 0,
    Other: 10,
  });

  const [destinations, setDestinations] = useState([
    { category: 'Plastic' as WasteCategory, quantityKg: 30, destination: 'EcoPlastic Granulation Plant', method: 'Mechanical Recycling' },
    { category: 'Organic' as WasteCategory, quantityKg: 25, destination: 'Shirpur Bio-Compost Facility', method: 'Anaerobic Digestion & Compost' },
    { category: 'Paper' as WasteCategory, quantityKg: 20, destination: 'Shirpur Paper Mills', method: 'Pulping' },
    { category: 'Other' as WasteCategory, quantityKg: 10, destination: 'Municipal RDF Disposal', method: 'Refuse Derived Fuel' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter batches for facility
  const incomingBatches = reports.filter((r) => r.status === 'COLLECTED');
  const receivedBatches = reports.filter((r) => r.status === 'RECEIVED_AT_FACILITY');
  const sortingBatches = reports.filter((r) => r.status === 'SORTING');
  const completedBatches = reports.filter((r) => r.status === 'COMPLETED');

  const handleOpenReceive = (report: WasteReport) => {
    setSelectedReport(report);
    setMeasuredGrossKg(report.collectionProof?.collectedKg || 100);
    setActiveModal('RECEIVE');
  };

  const handleOpenSort = (report: WasteReport) => {
    setSelectedReport(report);
    const initialKg = report.facilityProcessing?.receivedKg || 100;
    setSortingValues({
      Plastic: report.primaryCategory === 'Plastic' ? Math.round(initialKg * 0.6) : 10,
      Paper: report.primaryCategory === 'Paper' ? Math.round(initialKg * 0.6) : 10,
      Metal: report.primaryCategory === 'Metal' ? Math.round(initialKg * 0.6) : 5,
      Glass: report.primaryCategory === 'Glass' ? Math.round(initialKg * 0.6) : 5,
      Organic: report.primaryCategory === 'Organic' ? Math.round(initialKg * 0.6) : 15,
      'E-Waste': report.primaryCategory === 'E-Waste' ? Math.round(initialKg * 0.6) : 5,
      Mixed: 0,
      Other: 10,
    });
    setActiveModal('SORT');
  };

  const handleOpenProcess = (report: WasteReport) => {
    setSelectedReport(report);
    setActiveModal('PROCESS');
  };

  const submitReceive = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onReceiveBatch(selectedReport.id, measuredGrossKg);
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSort = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onSortBatch(selectedReport.id, sortingValues);
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProcess = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onProcessBatch(selectedReport.id, destinations);
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Factory className="w-4 h-4" />
            <span>Facility Operations Hub</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {facilityInfo.name}
          </h1>
          <p className="text-xs text-slate-400">
            Operator: <span className="text-slate-200 font-bold">{operatorName}</span> · Registered Type: <span className="text-indigo-300 font-semibold">{facilityInfo.type}</span>
          </p>
        </div>

        {/* Capacity Stat */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Daily Capacity</span>
            <p className="text-xl font-extrabold text-indigo-400 font-mono">{facilityInfo.capacityKgPerDay} kg/day</p>
          </div>
          <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Processed Batches</span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">{completedBatches.length}</p>
          </div>
        </div>
      </div>

      {/* Pipeline Columns / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COLUMN 1: INCOMING BATCHES */}
        <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Incoming Batches ({incomingBatches.length})</span>
            </span>
          </div>

          <div className="space-y-3">
            {incomingBatches.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No incoming collector trucks right now.</p>
            ) : (
              incomingBatches.map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold text-white">
                    <span>{r.id}</span>
                    <span className="text-amber-400">{r.collectionProof?.collectedKg || 100} kg</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Driver: {r.collectorName}</p>
                  <p className="text-[11px] text-slate-500">{r.location.address}</p>
                  <button
                    onClick={() => handleOpenReceive(r)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Confirm Receipt & Weigh</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: RECEIVED & SORTING */}
        <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-indigo-400 uppercase font-mono flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              <span>Physical Sorting ({receivedBatches.length + sortingBatches.length})</span>
            </span>
          </div>

          <div className="space-y-3">
            {[...receivedBatches, ...sortingBatches].length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No batches currently on sorting conveyor.</p>
            ) : (
              [...receivedBatches, ...sortingBatches].map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold text-white">
                    <span>{r.id}</span>
                    <span className="text-indigo-300">{r.facilityProcessing?.receivedKg || 100} kg Received</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Primary: {r.primaryCategory}</p>

                  {r.status === 'RECEIVED_AT_FACILITY' ? (
                    <button
                      onClick={() => handleOpenSort(r)}
                      className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Enter Physical Sorting Stream</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenProcess(r)}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Recycle className="w-3.5 h-3.5" />
                      <span>Assign Material Recovery Destinations</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED CIRCULAR OUTCOMES */}
        <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({completedBatches.length})</span>
            </span>
          </div>

          <div className="space-y-3">
            {completedBatches.map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/20 space-y-1 text-xs">
                <div className="flex justify-between font-mono font-bold text-white">
                  <span>{r.id}</span>
                  <span className="text-emerald-400">
                    🌱 {r.facilityProcessing?.recoveredKg} kg Recovered
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Residual: {r.facilityProcessing?.residualKg} kg</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: RECEIVE & WEIGH */}
      {activeModal === 'RECEIVE' && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Weigh & Confirm Receipt — {selectedReport.id}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-200">Facility Scale Weight (Measured kg):</label>
              <input
                type="number"
                value={measuredGrossKg}
                onChange={(e) => setMeasuredGrossKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold text-emerald-400"
              />
              <p className="text-[10px] text-slate-400">Collector reported {selectedReport.collectionProof?.collectedKg || 100} kg on truck weighbridge.</p>
            </div>

            <button
              onClick={submitReceive}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              CONFIRM RECEIPT AT FACILITY
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PHYSICAL SORTING BREAKDOWN */}
      {activeModal === 'SORT' && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Physical Sorting Stream Breakdown — {selectedReport.id}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
              💡 Physical scale entry records actual measured material weights separated during conveyor sorting.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(['Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste', 'Other'] as WasteCategory[]).map((cat) => (
                <div key={cat} className="space-y-1">
                  <label className="font-semibold text-slate-300 text-[11px]">{cat} (kg):</label>
                  <input
                    type="number"
                    value={sortingValues[cat] || 0}
                    onChange={(e) => setSortingValues({ ...sortingValues, [cat]: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={submitSort}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs"
            >
              RECORD PHYSICAL SORTING BREAKDOWN
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: PROCESS & RECOVERY DESTINATIONS */}
      {activeModal === 'PROCESS' && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Assign Material Recovery Destinations — {selectedReport.id}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {destinations.map((dest, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>{dest.category} Stream</span>
                    <span className="text-emerald-400 font-mono">{dest.quantityKg} kg</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Destination: <span className="text-slate-200">{dest.destination}</span></p>
                  <p className="text-[10px] text-slate-500">Method: {dest.method}</p>
                </div>
              ))}
            </div>

            <button
              onClick={submitProcess}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
            >
              COMPLETE MATERIAL RECOVERY LIFE CYCLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
