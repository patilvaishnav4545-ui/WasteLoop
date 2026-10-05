import React, { useState } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { WasteCategory, WasteReport, WastePoint } from '../../types';
import { SAMPLE_WASTE_PHOTOS } from '../../data/mockData';

interface ReportWasteModalProps {
  onClose: () => void;
  onSubmitReport: (newReportData: any) => Promise<void>;
  citizenName: string;
}

export const ReportWasteModal: React.FC<ReportWasteModalProps> = ({
  onClose,
  onSubmitReport,
  citizenName,
}) => {
  // Step State
  // 1: Photo, 2: Preview, 3: Location, 4: AI Analysis, 5: Duplicate Check, 6: Multi-Point / Review, 7: Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [wastePoints, setWastePoints] = useState<
    Array<{
      id: string;
      imageUrl: string;
      category: WasteCategory;
      confidence: number;
      aiReasoning: string;
    }>
  >([]);

  // Current active point being added/edited
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<WasteCategory>('Plastic');
  const [currentConfidence, setCurrentConfidence] = useState<number>(0.92);
  const [currentReasoning, setCurrentReasoning] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // Location State
  const [location, setLocation] = useState({
    address: 'College Road, near Main Gate, Shirpur',
    lat: 21.3562,
    lng: 74.8789,
    cityArea: 'College Road',
    timestamp: new Date().toLocaleTimeString(),
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Duplicate Check State
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean;
    message?: string;
    duplicateReport?: WasteReport;
    distanceMeters?: number;
  }>({ isDuplicate: false });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string>('');

  // Handle Photo Choice or Upload
  const handleSelectImage = (imgUrl: string, suggestedCat: WasteCategory) => {
    setCurrentImage(imgUrl);
    setCurrentCategory(suggestedCat);
    setStep(2); // Preview step
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCurrentImage(base64);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm photo -> Step 3 (Location) -> Step 4 (AI Analysis)
  const handleConfirmPhoto = async () => {
    setStep(3);
    setIsDetectingLocation(true);

    // Simulate GPS detection
    setTimeout(async () => {
      setIsDetectingLocation(false);
      setStep(4);
      setAiAnalyzing(true);

      // Call AI endpoint `/api/ai/analyze-image`
      try {
        const res = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
            imageCategoryHint: currentCategory,
          }),
        });
        const data = await res.json();
        setCurrentCategory(data.predictedCategory || currentCategory);
        setCurrentConfidence(data.confidence || 0.92);
        setCurrentReasoning(data.reasoning || 'AI identified waste material signatures.');
      } catch (e) {
        console.error('AI analysis error', e);
      } finally {
        setAiAnalyzing(false);
      }
    }, 1000);
  };

  // Confirm AI Classification -> Step 5 (Duplicate Check)
  const handleConfirmAI = async () => {
    setStep(5);
    setIsCheckingDuplicate(true);

    try {
      const res = await fetch('/api/reports/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          category: currentCategory,
        }),
      });
      const data = await res.json();
      setDuplicateCheck(data);
    } catch (e) {
      console.error('Duplicate check error', e);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Save current point into waste points list and proceed to Review/Submit (Step 6)
  const handleSaveWastePoint = () => {
    const newPt = {
      id: `pt-${Date.now()}`,
      imageUrl: currentImage,
      category: currentCategory,
      confidence: currentConfidence,
      aiReasoning: currentReasoning,
    };
    setWastePoints([...wastePoints, newPt]);
    setStep(6);
  };

  // Add another waste point (Multiple Waste Points / Area Cleanup Request)
  const handleAddAnotherPoint = () => {
    setCurrentImage('');
    setStep(1);
  };

  // Final submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const allPoints = wastePoints.map((pt, idx) => ({
        id: pt.id,
        imageUrl: pt.imageUrl,
        lat: location.lat + idx * 0.0003, // slightly offset for multi-point
        lng: location.lng + idx * 0.0003,
        address: `${location.address} (Point ${idx + 1})`,
        predictedCategory: pt.category,
        confidence: pt.confidence,
      }));

      const primaryCat = wastePoints[0]?.category || 'Plastic';

      const payload = {
        citizenName,
        primaryCategory: primaryCat,
        points: allPoints,
        aiValidation: {
          isValid: true,
          confidence: wastePoints[0]?.confidence || 0.92,
          reasoning: wastePoints[0]?.aiReasoning || 'AI verified waste image',
          isDuplicateRisk: duplicateCheck.isDuplicate,
        },
        location,
      };

      await onSubmitReport(payload);
      setSubmittedReportId(`WR-${1026 + Math.floor(Math.random() * 10)}`);
      setStep(7);
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-8">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              WR
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Report Waste Spot</h2>
              <p className="text-[10px] text-slate-400">Step {step} of 6 — AI-Assisted Waste Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Camera / Upload / Preset Selection */}
          {step === 1 && (
            <div className="space-y-5 text-center">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Step 1 — Capture Waste Photo</h3>
                <p className="text-xs text-slate-400">
                  Take a clear photo or select a sample image of the dumped waste.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <label className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 text-center group">
                  <Camera className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-200">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 text-center group">
                  <Upload className="w-7 h-7 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-200">Gallery Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono">
                  <span className="bg-slate-900 px-3 text-slate-500">Or pick sample test photo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-left">
                {[
                  { label: 'Plastic Dump', cat: 'Plastic' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Plastic },
                  { label: 'Cardboard Box', cat: 'Paper' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Paper },
                  { label: 'Organic Food', cat: 'Organic' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Organic },
                  { label: 'Circuit Boards', cat: 'E-Waste' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Ewaste },
                  { label: 'Scrap Metal', cat: 'Metal' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Metal },
                  { label: 'Mixed Litter', cat: 'Mixed' as WasteCategory, img: SAMPLE_WASTE_PHOTOS.Mixed },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => handleSelectImage(sample.img, sample.cat)}
                    className="group border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden bg-slate-950 transition-all text-left"
                  >
                    <img src={sample.img} alt={sample.label} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-1.5 text-[10px] font-semibold text-slate-300 truncate">
                      {sample.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Photo Preview */}
          {step === 2 && (
            <div className="space-y-5 text-center">
              <h3 className="text-base font-bold text-white">Step 2 — Waste Photo Preview</h3>

              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-w-md mx-auto shadow-xl">
                <img src={currentImage} alt="Waste preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>High Resolution</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleConfirmPhoto}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Detecting Location */}
          {step === 3 && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-bounce">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Detecting Automatic GPS Location...</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Capturing precise latitude, longitude and timestamp for report verification.
              </p>
            </div>
          )}

          {/* STEP 4: AI Validation & Category Confirmation */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Waste Classification</span>
                </div>
                <h3 className="text-base font-bold text-white">Analysis & Validation</h3>
              </div>

              {aiAnalyzing ? (
                <div className="p-8 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 mx-auto border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Running Gemini AI visual analysis...</p>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  {/* Photo + Details */}
                  <div className="flex gap-4 items-center">
                    <img src={currentImage} alt="Analysis" className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ✓ Image accepted
                        </span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">AI Confidence: </span>
                        <span className="font-bold text-white font-mono">{Math.round(currentConfidence * 100)}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        "{currentReasoning}"
                      </p>
                    </div>
                  </div>

                  {/* Category Picker */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 flex justify-between">
                      <span>Predicted Category:</span>
                      <span className="text-emerald-400 font-semibold">{currentCategory} Waste</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                      {(['Plastic', 'Paper', 'Organic', 'E-Waste', 'Metal', 'Glass', 'Mixed', 'Other'] as WasteCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCurrentCategory(cat)}
                          className={`p-2 rounded-xl text-center transition-all ${
                            currentCategory === cat
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Info Card */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{location.address}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · Captured: {location.timestamp}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmAI}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Duplicate Check Result */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <h3 className="text-base font-bold text-white">Step 5 — Spatial Duplicate Check</h3>

              {isCheckingDuplicate ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Scanning nearby reports in 100m radius...</p>
                </div>
              ) : duplicateCheck.isDuplicate ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>⚠️ Similar Report Already Exists Nearby!</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {duplicateCheck.message}
                  </p>
                  {duplicateCheck.duplicateReport && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/20 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>Report ID: {duplicateCheck.duplicateReport.id}</span>
                        <span className="text-amber-400">{duplicateCheck.duplicateReport.status}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{duplicateCheck.duplicateReport.location.address}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 italic">
                    You can still submit if this is a separate distinct waste pile.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveWastePoint}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                    >
                      Continue Submission
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
                    >
                      View Existing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Duplicate Requests Detected</h4>
                  <p className="text-xs text-slate-300">
                    Location is clear. Your report will be sent to Admin and nearby Collectors in real time.
                  </p>
                  <button
                    onClick={handleSaveWastePoint}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Proceed to Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Review & Multi-Point Support */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Step 6 — Final Review</h3>
                  <p className="text-xs text-slate-400">
                    {wastePoints.length > 1
                      ? `Area Cleanup Request (${wastePoints.length} Waste Points)`
                      : 'Single Waste Report'}
                  </p>
                </div>
                <button
                  onClick={handleAddAnotherPoint}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Point</span>
                </button>
              </div>

              {/* Waste Points List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {wastePoints.map((pt, index) => (
                  <div
                    key={pt.id}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs"
                  >
                    <img src={pt.imageUrl} alt={`Point ${index + 1}`} className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">Point {index + 1}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-200">
                          {pt.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">{location.address}</p>
                      <p className="text-[10px] text-slate-500">AI Confidence: {Math.round(pt.confidence * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Reporter:</span>
                  <span className="text-slate-200 font-bold">{citizenName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Area:</span>
                  <span className="text-slate-200 font-bold">{location.cityArea}</span>
                </div>
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting to Admin Dashboard...</span>
                ) : (
                  <>
                    <span>SUBMIT REPORT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 7: Report Submitted Successfully */}
          {step === 7 && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Report Submitted ✓</h3>
                <p className="text-xs text-slate-400">Report ID: <span className="text-emerald-400 font-mono font-bold">{submittedReportId}</span></p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Real-Time Broadcast Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Admin has received real-time notification on their dashboard. A nearby collector will be assigned shortly.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
              >
                Return to Citizen Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
