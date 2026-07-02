"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBooking } from "../context/BookingContext";
import { Bell, Clock, ChevronDown, Check, UserCircle } from "lucide-react";

export default function Header() {
  const {
    currentTab,
    setCurrentTab,
    currentUser,
    notifications,
    markNotificationsAsRead
  } = useBooking();

  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Time simulator starting at July 1, 2026 13:43:41 PM
  useEffect(() => {
    // We'll advance a mock clock based on real elapsed time
    const baseTime = new Date("2026-07-01T13:43:41").getTime();
    const startTime = Date.now();

    const updateTime = () => {
      const elapsed = Date.now() - startTime;
      const currentSimulated = new Date(baseTime + elapsed);

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      setTimeStr(timeFormatter.format(currentSimulated));
      setDateStr(dateFormatter.format(currentSimulated));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close drop-downs when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case "dashboard":
        return "Dashboard";
      case "book-cabin":
        return "Book Cabin or Room";
      case "office-map":
        return "Interactive Floor Map";
      case "calendar":
        return "Calendar Scheduler";
      case "my-bookings":
        return "My Bookings";
      case "notifications":
        return "All Notifications";
      case "profile":
        return "My Profile Settings";
      case "admin-panel":
        return "Admin Control Panel";
      default:
        return "Workspace";
    }
  };

  const recentNotifications = notifications.slice(0, 4);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between px-6 border-b border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-md z-30">
      {/* Breadcrumb Title */}
      <div className="pl-12 md:pl-0">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{getBreadcrumbTitle()}</h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-blue-500 dark:text-blue-400 capitalize">{currentTab.replace("-", " ")}</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-medium text-xs">
          <Clock size={14} className="text-blue-500 dark:text-blue-400 animate-spin-slow" />
          <span className="tabular-nums">{timeStr}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{dateStr}</span>
        </div>

        {/* Notifications Quick-Peek */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className={`
              relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:text-slate-300
              ${notifOpen ? "ring-2 ring-blue-500/20 bg-slate-50 dark:bg-slate-800" : ""}
            `}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick-Peek Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Recent Alerts</span>
                <button
                  onClick={() => { setCurrentTab("notifications"); setNotifOpen(false); }}
                  className="text-xs text-blue-500 hover:text-blue-600 hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' :
                        n.type === 'warning' ? 'bg-amber-500' :
                          n.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'
                        }`} />
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick User-Switch Profile */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
          >
            {currentUser.avatar ? <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover"
            /> :
              <UserCircle size={28} className="text-slate-400 dark:text-slate-500" />
            }
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{currentUser.name}</p>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 capitalize">{currentUser.role}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
