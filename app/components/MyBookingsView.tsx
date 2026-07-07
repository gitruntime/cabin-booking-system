"use client";

import {
  AlertCircle,
  AlertTriangle,
  Bookmark,
  Calendar,
  Clock,
  Edit3,
  History,
  Trash2,
  UserCheck,
  X
} from "lucide-react";
import React, { useState } from "react";
import { Booking, useBooking } from "../context/BookingContext";

export default function MyBookingsView() {
  const { bookings, cabins, cancelBooking, checkInBooking, editBooking, currentUser } = useBooking();

  // Reschedule Modal
  const [rescheduleItem, setRescheduleItem] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [editError, setEditError] = useState("");

  // Cancel Modal
  const [cancelItem, setCancelItem] = useState<Booking | null>(null);

  // Active user's bookings
  const myBookings = bookings.filter(b => b.userId === currentUser.id);
  const activeBookings = myBookings.filter(b => b.status !== "cancelled");
  const pastBookings = myBookings.filter(b => b.status === "cancelled");

  const handleEditClick = (booking: Booking) => {
    setRescheduleItem(booking);
    setNewDate(booking.date);
    setNewStart(booking.startTime);
    setNewEnd(booking.endTime);
    setEditError("");
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleItem) return;
    setEditError("");

    if (newStart >= newEnd) {
      setEditError("Start time must be earlier than End time.");
      return;
    }

    const res = editBooking(rescheduleItem.id, {
      date: newDate,
      startTime: newStart,
      endTime: newEnd
    });

    if (res.success) {
      setRescheduleItem(null);
    } else {
      setEditError(res.error || "Conflict detected.");
    }
  };

  const handleCancelClick = (booking: Booking) => {
    setCancelItem(booking);
  };

  const confirmCancel = () => {
    if (cancelItem) {
      cancelBooking(cancelItem.id);
      setCancelItem(null);
    }
  };

  const renderStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold dark:bg-blue-950/40 dark:text-blue-300">Confirmed</span>;
      case "checked-in":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold dark:bg-emerald-950/40 dark:text-emerald-300">Checked In</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-400">Cancelled</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Active Bookings Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bookmark size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Active Bookings</h3>
        </div>

        {activeBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => {
              const cabin = cabins.find(c => c._id === b.cabinId);

              // Enable check in button only for today's bookings starting soon/active, and not yet checked-in
              const isToday = b.date === "2026-07-01";
              const showCheckIn = isToday && b.status === "confirmed";

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/30 transition-all dark:border-slate-800/60 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">{cabin?.building} • {cabin?.floor}</span>
                      {renderStatusBadge(b.status)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{b.purpose}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">{cabin?.name || "Deleted Space"}</p>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>{b.startTime} - {b.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 justify-end">

                    {showCheckIn && (
                      <button
                        onClick={() => checkInBooking(b.id)}
                        className="mr-auto flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors"
                      >
                        <UserCheck size={12} />
                        <span>Check In</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(b)}
                      className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Edit3 size={12} />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => handleCancelClick(b)}
                      className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold transition-all dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <Trash2 size={12} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            You don't have any active cabin bookings.
          </div>
        )}
      </div>

      {/* History / Cancelled Bookings */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <History size={18} className="text-slate-500" />
          <h3 className="font-bold text-slate-700 dark:text-slate-350 text-sm">Past or Cancelled Logs</h3>
        </div>

        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastBookings.map((b, i) => {
              const cabin = cabins.find(c => c._id === b.cabinId);
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800/40 dark:bg-slate-900/10 flex items-center justify-between opacity-60"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{cabin?.building}</p>
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{b.purpose}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cabin?.name} • {b.date} ({b.startTime} - {b.endTime})</p>
                  </div>
                  {renderStatusBadge(b.status)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No booking cancellation history found.
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-enter">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Reschedule: {rescheduleItem.purpose}</h3>
              <button
                onClick={() => setRescheduleItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">

              {editError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Meeting Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/10 transition-colors"
              >
                Save Rescheduled Times
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 text-center space-y-4 animate-enter">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-650 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Cancel Booking?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Are you sure you want to release this cabin? This action will free up the room and cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setCancelItem(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                No, Keep
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
