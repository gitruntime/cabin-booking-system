"use client";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle,
  Info,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteAllNotification,
  getNotification,
  readAllNotification,
  readIndividualNotification
} from "../http";

export default function NotificationsPanel() {
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotification();
      const list = res.data?.notifications || res.data?.data || res.data || [];
      setNotificationsList(list);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await readAllNotification();
      if (res.status === 200 || res.data?.success) {
        setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await deleteAllNotification();
      if (res.status === 200 || res.data?.success) {
        setNotificationsList([]);
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const handleMarkIndividualRead = async (id: string) => {
    try {
      const res = await readIndividualNotification(id);
      if (res.status === 200 || res.data?.success) {
        setNotificationsList(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatTime = (timeVal: any) => {
    if (!timeVal) return "";
    if (typeof timeVal === 'string' && timeVal.includes('ago')) return timeVal;
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return timeVal;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + d.toLocaleDateString();
    } catch {
      return timeVal;
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle size={16} />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
            <AlertTriangle size={16} />
          </div>
        );
      case "alert":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <Bell size={16} />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <Info size={16} />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-5">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Notifications Log</h3>
              <p className="text-xs text-slate-400">System alerts and scheduling updates</p>
            </div>
          </div>

          <div className="flex gap-2">
            {notificationsList.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-semibold dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-350 transition-colors"
                >
                  <CheckCheck size={14} />
                  <span>Mark all as read</span>
                </button>

                <button
                  onClick={handleClearNotifications}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 text-red-650 text-xs font-semibold dark:border-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Clear history</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
          {loading ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <span className="inline-block animate-pulse">Loading notifications log...</span>
            </div>
          ) : notificationsList.length > 0 ? (
            notificationsList.map((n, idx) => (
              <div
                key={n._id || n.id || idx}
                onClick={() => !(n.isRead ?? n.read) && handleMarkIndividualRead(n._id || n.id)}
                className={`
                  p-4 rounded-xl flex gap-3.5 transition-colors pt-4 cursor-pointer
                  ${!(n.isRead ?? n.read)
                    ? "bg-blue-50/15 dark:bg-blue-950/5 border-l-2 border-blue-500"
                    : "bg-slate-50/30 dark:bg-slate-900/10 border-l-2 border-transparent"}
                `}
              >
                {getNotifIcon(n.type)}

                <div className="overflow-hidden flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${!(n.isRead ?? n.read) ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                      {n.title}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium tabular-nums">{formatTime(n.time || n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <CalendarDays size={40} className="text-slate-300 dark:text-slate-700" />
              <p className="font-semibold">No notifications on file.</p>
              <p className="text-[10px] opacity-75">Alerts will trigger here when bookings are created or status changes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
