import React, { useState, useEffect } from 'react';
import { User, Role, WasteReport, Facility, Hotspot, NotificationItem, AuditLog } from './types';
import { INITIAL_USERS } from './data/mockData';
import { Header } from './components/common/Header';
import { SplashScreen } from './components/common/SplashScreen';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { ReportWasteModal } from './components/citizen/ReportWasteModal';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { FacilityDashboard } from './components/facility/FacilityDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeRole, setActiveRole] = useState<Role>('ROLE_CITIZEN');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Data State
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      const [reportsRes, facilitiesRes, hotspotsRes, logsRes, notifsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/facilities'),
        fetch('/api/hotspots'),
        fetch('/api/audit-logs'),
        fetch('/api/notifications'),
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (facilitiesRes.ok) setFacilities(await facilitiesRes.json());
      if (hotspotsRes.ok) setHotspots(await hotspotsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
    } catch (e) {
      console.error('Data fetch error', e);
    }
  };

  useEffect(() => {
    fetchData();

    // SSE Real-Time Listener
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'REPORT_CREATED') {
          setReports((prev) => [data.payload, ...prev]);
        } else if (data.type === 'REPORT_UPDATED') {
          setReports((prev) =>
            prev.map((r) => (r.id === data.payload.id ? data.payload : r))
          );
        } else if (data.type === 'NOTIFICATION_ADDED') {
          setNotifications((prev) => [data.payload, ...prev]);
        } else if (data.type === 'AUDIT_LOG_ADDED') {
          setAuditLogs((prev) => [data.payload, ...prev]);
        }
      } catch (err) {
        console.error('SSE Error', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Switch Active Role
  const handleSwitchRole = (role: Role) => {
    setActiveRole(role);
    const userForRole = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(userForRole);
  };

  const handleStartFromSplash = (role: Role) => {
    handleSwitchRole(role);
    setShowSplash(false);
  };

  // Submit Report
  const handleSubmitReport = async (reportData: any) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reportData,
        citizenId: currentUser.id,
        citizenName: currentUser.name,
      }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  // Admin Actions
  const handleVerifyReport = async (
    reportId: string,
    action: 'VERIFY' | 'REJECT' | 'MARK_DUPLICATE' | 'FLAG',
    note?: string
  ) => {
    const res = await fetch(`/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note, adminName: currentUser.name }),
    });
    if (res.ok) fetchData();
  };

  const handleAssignCollector = async (reportId: string, collectorId: string) => {
    const res = await fetch(`/api/reports/${reportId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectorId, adminName: currentUser.name }),
    });
    if (res.ok) fetchData();
  };

  // Collector Actions
  const handleCollectorUpdateStatus = async (
    reportId: string,
    status: any,
    proofData?: any
  ) => {
    const res = await fetch(`/api/reports/${reportId}/collector-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        ...proofData,
        collectorName: currentUser.name,
      }),
    });
    if (res.ok) fetchData();
  };

  // Facility Actions
  const handleReceiveBatch = async (reportId: string, receivedKg: number) => {
    const res = await fetch(`/api/reports/${reportId}/facility-receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receivedKg, operatorName: currentUser.name }),
    });
    if (res.ok) fetchData();
  };

  const handleSortBatch = async (reportId: string, sortingBreakdown: any) => {
    const res = await fetch(`/api/reports/${reportId}/facility-sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sortingBreakdown, operatorName: currentUser.name }),
    });
    if (res.ok) fetchData();
  };

  const handleProcessBatch = async (reportId: string, processingDestinations: any) => {
    const res = await fetch(`/api/reports/${reportId}/facility-process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processingDestinations, operatorName: currentUser.name }),
    });
    if (res.ok) fetchData();
  };

  if (showSplash) {
    return <SplashScreen onStart={handleStartFromSplash} />;
  }

  const collectorsList = INITIAL_USERS.filter((u) => u.role === 'ROLE_COLLECTOR');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar with Role Switcher */}
      <Header
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onOpenReportModal={() => setShowReportModal(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {activeRole === 'ROLE_CITIZEN' && (
          <CitizenDashboard
            userName={currentUser.name}
            reports={reports}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeRole === 'ROLE_COLLECTOR' && (
          <CollectorDashboard
            collectorName={currentUser.name}
            reports={reports}
            facilities={facilities}
            onUpdateStatus={handleCollectorUpdateStatus}
          />
        )}

        {activeRole === 'ROLE_FACILITY' && (
          <FacilityDashboard
            operatorName={currentUser.name}
            reports={reports}
            facilityInfo={facilities[0] || {
              id: 'fac-1',
              name: 'Central Green MRF & Sorting Hub',
              type: 'Material Recovery Facility',
              location: { address: 'Industrial Area', lat: 21.352, lng: 74.885 },
              acceptedMaterials: ['Plastic', 'Paper', 'Metal', 'Glass', 'Mixed'],
              capacityKgPerDay: 5000,
              currentStockKg: 1240,
              operatorName: currentUser.name,
            }}
            onReceiveBatch={handleReceiveBatch}
            onSortBatch={handleSortBatch}
            onProcessBatch={handleProcessBatch}
          />
        )}

        {activeRole === 'ROLE_ADMIN' && (
          <AdminDashboard
            adminName={currentUser.name}
            reports={reports}
            collectors={collectorsList}
            hotspots={hotspots}
            auditLogs={auditLogs}
            onVerifyReport={handleVerifyReport}
            onAssignCollector={handleAssignCollector}
          />
        )}
      </main>

      {/* Report Waste Modal */}
      {showReportModal && (
        <ReportWasteModal
          citizenName={currentUser.name}
          onClose={() => setShowReportModal(false)}
          onSubmitReport={handleSubmitReport}
        />
      )}
    </div>
  );
}
