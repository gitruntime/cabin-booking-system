"use client";

import {
  AlertTriangle,
  Building,
  FileText,
  HelpCircle,
  Layers,
  Projector,
  Tv,
  Video,
  Volume2,
  X
} from "lucide-react";
import React, { useState } from "react";
import { Cabin, useBooking } from "../context/BookingContext";
import { departments } from "../Data";

export default function FloorMapView() {
  const {
    cabins,
    addBooking,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor
  } = useBooking();

  const [hoveredCabin, setHoveredCabin] = useState<Cabin | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Quick Book modal
  const [bookingCabin, setBookingCabin] = useState<Cabin | null>(null);
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [attendees, setAttendees] = useState(4);
  const [dept, setDept] = useState<"HR" | "Finance" | "Executive" | "IT" | "Marketing" | "Sales">("IT");
  const [modalError, setModalError] = useState("");

  const filteredCabins = cabins.filter(
    c => c.building === selectedBuilding && c.floor === selectedFloor
  );

  // Status mapping
  const statusColors = {
    available: "fill-emerald-500/20 stroke-emerald-500 hover:fill-emerald-500/30",
    occupied: "fill-rose-500/20 stroke-rose-500 hover:fill-rose-500/30",
    reserved: "fill-amber-500/20 stroke-amber-500 hover:fill-amber-500/30",
    maintenance: "fill-slate-500/20 stroke-slate-400 hover:fill-slate-500/30",
  };

  const getStatusText = (status: Cabin["status"]) => {
    switch (status) {
      case "available": return "🟢 Available";
      case "occupied": return "🔴 Occupied (Active)";
      case "reserved": return "🟡 Reserved Soon";
      case "maintenance": return "⚫ Under Maintenance";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Get mouse coordinates relative to viewport
    setHoverPos({
      x: e.clientX + 15,
      y: e.clientY + 15
    });
  };

  const handleCabinClick = (cabin: Cabin) => {
    if (cabin.status === "maintenance") return;
    setBookingCabin(cabin);
    setAttendees(Math.min(4, cabin.capacity));
    setModalError("");
  };

  const handleQuickBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCabin) return;
    setModalError("");

    if (!purpose.trim()) {
      setModalError("Please specify meeting purpose.");
      return;
    }
    if (startTime >= endTime) {
      setModalError("Start time must be earlier than End time.");
      return;
    }

    const res = addBooking({
      cabinId: bookingCabin.id,
      userId: "u1",
      date: "2026-07-01", // Default today's date
      startTime,
      endTime,
      duration: 60,
      attendees,
      purpose,
      department: dept
    });

    if (res.success) {
      setBookingCabin(null);
      setPurpose("");
    } else {
      setModalError(res.error || "Overlap conflict detected.");
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case "TV": return <Tv size={12} />;
      case "Video Conference": return <Video size={12} />;
      case "Projector": return <Projector size={12} />;
      case "Whiteboard": return <FileText size={12} />;
      case "Audio System": return <Volume2 size={12} />;
      default: return <HelpCircle size={12} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Floor Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Building Select */}
          <div className="flex items-center gap-2">
            <Building size={16} className="text-slate-400" />
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
            >
              <option value="Main HQ">Main HQ Building</option>
              <option value="West Wing">West Wing Wing</option>
            </select>
          </div>

          {/* Floor Select */}
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-400" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
            >
              {selectedBuilding === "Main HQ" ? (
                <>
                  <option value="Ground Floor">Ground Floor (Exec Rooms)</option>
                  <option value="1st Floor">1st Floor (IT & HR Rooms)</option>
                  <option value="2nd Floor">2nd Floor (Marketing & Sales)</option>
                </>
              ) : (
                <option value="1st Floor">1st Floor (Meeting Zone)</option>
              )}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-rose-500/20 border border-rose-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-amber-500/20 border border-amber-500" />
            <span>Reserved Soon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-slate-500/20 border border-slate-400" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Map Area */}
      <div className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs flex justify-center items-center relative overflow-x-auto min-h-112.5">

        {/* SVG Container */}
        <div className="w-full max-w-200 aspect-800/500 relative bg-slate-50 border border-slate-100 rounded-xl dark:bg-slate-950/40 dark:border-slate-800/50">
          <svg viewBox="0 0 800 500" className="w-full h-full select-none">
            {/* Background Hallways / Grid outline */}
            <path d="M 0,250 L 800,250" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="square" className="dark:stroke-slate-900" opacity="0.3" />
            <path d="M 400,0 L 400,500" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="square" className="dark:stroke-slate-900" opacity="0.3" />

            {/* Static Non-Clickable Zones */}
            {selectedBuilding === "Main HQ" && selectedFloor === "Ground Floor" && (
              <>
                {/* Reception */}
                <rect x="340" y="210" width="120" height="80" rx="10" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="400" y="255" textAnchor="middle" className="fill-blue-500 dark:fill-blue-400 text-[11px] font-bold uppercase tracking-wider">Reception Desk</text>

                {/* Workstations Area */}
                <rect x="50" y="290" width="260" height="150" rx="10" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="180" y="375" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold uppercase tracking-wider">Workstations (A1 - A16)</text>

                {/* Washrooms */}
                <rect x="500" y="380" width="100" height="70" rx="6" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="550" y="420" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[9px] font-bold uppercase">Washrooms</text>

                {/* Cafeteria */}
                <rect x="620" y="290" width="130" height="160" rx="10" fill="#10b981" fillOpacity="0.04" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                <text x="685" y="375" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-500 text-[10px] font-bold uppercase tracking-wider">Cafeteria Bay</text>

                {/* Emergency exit */}
                <path d="M 780,240 L 780,260" stroke="#ef4444" strokeWidth="4" />
                <text x="770" y="235" textAnchor="end" className="fill-rose-500 text-[8px] font-bold uppercase">Exit</text>
              </>
            )}

            {selectedBuilding === "Main HQ" && selectedFloor === "1st Floor" && (
              <>
                {/* IT Workstations Desk block */}
                <rect x="50" y="290" width="580" height="160" rx="12" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="340" y="380" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[11px] font-bold uppercase tracking-wider">IT Operations Area & Workstations</text>

                {/* Washrooms */}
                <rect x="650" y="380" width="100" height="70" rx="6" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="700" y="420" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[9px] font-bold uppercase">Washrooms</text>

                {/* Exit */}
                <path d="M 780,240 L 780,260" stroke="#ef4444" strokeWidth="4" />
              </>
            )}

            {selectedBuilding === "Main HQ" && selectedFloor === "2nd Floor" && (
              <>
                {/* Marketing desk block */}
                <rect x="50" y="280" width="280" height="170" rx="12" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="190" y="370" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold uppercase tracking-wider">Marketing Desks</text>

                {/* Sales Desk block */}
                <rect x="360" y="280" width="280" height="170" rx="12" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="500" y="370" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold uppercase tracking-wider">Sales Desks</text>

                {/* Executive Washrooms */}
                <rect x="660" y="360" width="90" height="90" rx="6" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="705" y="410" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[9px] font-bold uppercase">Washrooms</text>
              </>
            )}

            {selectedBuilding === "West Wing" && (
              <>
                {/* West wing layout */}
                <rect x="50" y="270" width="560" height="180" rx="12" fill="#475569" fillOpacity="0.05" stroke="#94a3b8" strokeWidth="1" />
                <text x="330" y="370" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[11px] font-bold uppercase tracking-wider">West Wing Workstations & Huddles</text>

                <rect x="650" y="270" width="100" height="180" rx="8" fill="#10b981" fillOpacity="0.04" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" />
                <text x="700" y="365" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 text-[9px] font-bold uppercase">Breakout Zone</text>
              </>
            )}

            {/* Clickable Cabins */}
            {filteredCabins.map((cabin) => {
              // Convert coordinate percentages to actual SVG canvas pixels (width: 800, height: 500)
              const cx = (cabin.x / 100) * 800;
              const cy = (cabin.y / 100) * 500;
              const cw = (cabin.w / 100) * 800;
              const ch = (cabin.h / 100) * 500;

              const styleClass = statusColors[cabin.status];
              const isMaintenance = cabin.status === "maintenance";

              return (
                <g
                  key={cabin.id}
                  className={isMaintenance ? "cursor-not-allowed" : "cursor-pointer"}
                  onClick={() => handleCabinClick(cabin)}
                  onMouseEnter={(e) => setHoveredCabin(cabin)}
                  onMouseLeave={() => setHoveredCabin(null)}
                  onMouseMove={handleMouseMove}
                >
                  {/* Room base block */}
                  <rect
                    x={cx}
                    y={cy}
                    width={cw}
                    height={ch}
                    rx="8"
                    className={`${styleClass} transition-colors duration-200 stroke-2`}
                  />

                  {/* Room Name label */}
                  <text
                    x={cx + cw / 2}
                    y={cy + ch / 2 + 3}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold pointer-events-none truncate max-w-[90%]"
                  >
                    {cabin.name.split(" ").slice(-1)[0] === "Suite" || cabin.name.split(" ").slice(-1)[0] === "Room" || cabin.name.split(" ").slice(-1)[0] === "Hall"
                      ? cabin.name.split(" ").slice(-2).join(" ")
                      : cabin.name.split(" ").slice(0, 3).join(" ")}
                  </text>

                  {/* Mini capacity indicator */}
                  <text
                    x={cx + cw / 2}
                    y={cy + ch / 2 + 15}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 text-[8px] font-medium pointer-events-none"
                  >
                    Cap: {cabin.capacity}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Hover Card */}
        {hoveredCabin && (
          <div
            className="fixed z-50 p-4 rounded-xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-2.5 max-w-xs pointer-events-none animate-enter"
            style={{
              left: `${hoverPos.x}px`,
              top: `${hoverPos.y}px`
            }}
          >
            <div>
              <span className="text-[8px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">
                {hoveredCabin.building} • {hoveredCabin.floor}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{hoveredCabin.name}</h4>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">Type: {hoveredCabin.type}</p>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Capacity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{hoveredCabin.capacity} seats</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Status</span>
                <span className="font-bold">{getStatusText(hoveredCabin.status)}</span>
              </div>
            </div>

            <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Facilities</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {hoveredCabin.facilities.map((fac, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-semibold">
                    {getFacilityIcon(fac)}
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Booking Modal */}
      {bookingCabin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-enter">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-wide">{bookingCabin.building} • {bookingCabin.floor}</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quick Book: {bookingCabin.name}</h3>
              </div>
              <button
                onClick={() => setBookingCabin(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickBookSubmit} className="space-y-4 text-xs">

              {modalError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px]">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Attendees & Dept */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Attendees (Max: {bookingCabin.capacity})</label>
                  <input
                    type="number"
                    min="1"
                    max={bookingCabin.capacity}
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Department</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {
                      departments.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Purpose</label>
                <input
                  type="text"
                  placeholder="Meeting Agenda / Project Sync"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              {/* Book button */}
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/10 transition-colors"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
