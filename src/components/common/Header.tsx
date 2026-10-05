import React, { useState } from 'react';
import { User, Role, NotificationItem } from '../../types';
import {
  Recycle,
  Bell,
  Shield,
  Truck,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  notifications: NotificationItem[];
  onOpenReportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  notifications,
  onOpenReportModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ROLE_CITIZEN':
        return { label: 'Citizen', icon: UserCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'ROLE_COLLECTOR':
        return { label: 'Collector', icon: Truck, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'ROLE_FACILITY':
        return { label: 'Facility', icon: Building2, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'ROLE_ADMIN':
        return { label: 'Admin', icon: Shield, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                WasteLoop
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Report • Collect • Recover
            </p>
          </div>
        </div>

        {/* Role Switcher (Interactive for reviewer testing) */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <span className="px-2 py-1 text-slate-400 text-[11px] uppercase tracking-wider hidden md:inline-block font-mono">
            Demo Role:
          </span>
          <button
            onClick={() => onSwitchRole('ROLE_CITIZEN')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentUser.role === 'ROLE_CITIZEN'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen</span>
          </button>
          <button
            onClick={() => onSwitchRole('ROLE_COLLECTOR')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentUser.role === 'ROLE_COLLECTOR'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collector</span>
          </button>
          <button
            onClick={() => onSwitchRole('ROLE_FACILITY')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentUser.role === 'ROLE_FACILITY'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Facility</span>
          </button>
          <button
            onClick={() => onSwitchRole('ROLE_ADMIN')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentUser.role === 'ROLE_ADMIN'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* Right Actions & Notifications */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'ROLE_CITIZEN' && onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl hover:brightness-110 transition-all shadow-md shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>+ REPORT WASTE</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              title="Real-time Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Real-Time Notifications</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notifications.length} Events
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50 p-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-800/50 rounded-xl ${
                          !notif.read ? 'bg-slate-800/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-200">{notif.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px] mb-1">
                          {notif.message}
                        </p>
                        {notif.reportId && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {notif.reportId}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-1.5 py-0.2 rounded-md ${badge.bg}`}>
                  <BadgeIcon className="w-2.5 h-2.5" />
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
