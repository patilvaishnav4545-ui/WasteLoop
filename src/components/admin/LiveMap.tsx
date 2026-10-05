import React, { useEffect, useRef } from 'react';
import { WasteReport, ReportStatus } from '../../types';
import L from 'leaflet';

interface LiveMapProps {
  reports: WasteReport[];
  onSelectReport: (report: WasteReport) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ reports, onSelectReport }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);

  const getMarkerColor = (status: ReportStatus) => {
    switch (status) {
      case 'REPORTED':
      case 'VERIFIED':
        return '#f43f5e'; // Red 🔴
      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'ON_THE_WAY':
      case 'ARRIVED':
        return '#f59e0b'; // Yellow 🟡
      case 'COLLECTED':
        return '#3b82f6'; // Blue 🔵
      case 'RECEIVED_AT_FACILITY':
      case 'SORTING':
      case 'PROCESSING':
        return '#a855f7'; // Purple 🟣
      case 'COMPLETED':
        return '#10b981'; // Green 🟢
      default:
        return '#64748b';
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      // Default center around Shirpur coordinates
      leafletMap.current = L.map(mapRef.current, {
        center: [21.354, 74.88],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMap.current);

      markersGroup.current = L.layerGroup().addTo(leafletMap.current);
    }

    // Refresh markers
    if (markersGroup.current) {
      markersGroup.current.clearLayers();

      reports.forEach((report) => {
        const color = getMarkerColor(report.status);
        const circleMarker = L.circleMarker([report.location.lat, report.location.lng], {
          radius: 9,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        const popupHtml = `
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong style="color: ${color};">${report.id} — ${report.status}</strong><br/>
            <b>${report.primaryCategory} Waste</b><br/>
            <span>${report.location.address}</span><br/>
            <small style="color: #64748b;">Reporter: ${report.citizenName}</small>
          </div>
        `;

        circleMarker.bindPopup(popupHtml);
        circleMarker.on('click', () => {
          onSelectReport(report);
        });

        markersGroup.current?.addLayer(circleMarker);
      });
    }
  }, [reports, onSelectReport]);

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-[10px] font-semibold text-slate-300 shadow-xl space-y-1 z-[1000] hidden sm:block">
        <p className="font-bold text-white uppercase tracking-wider mb-1 font-mono">Live Pins Legend</p>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />🔴 Reported / Verified</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />🟡 Collector Assigned</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />🔵 Collected</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />🟣 Facility Recovery</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />🟢 Completed</div>
      </div>
    </div>
  );
};
