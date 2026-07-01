"use client";

import React, { useState } from "react";
import { useBooking, Booking } from "../context/BookingContext";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Layers, 
  Building, 
  SlidersHorizontal,
  Info
} from "lucide-react";

export default function CalendarView() {
  const { bookings, cabins } = useBooking();
  
  // View mode
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  
  // Navigation states
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-01")); // Base seed date
  
  // Filter states
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");
  const [filterCabin, setFilterCabin] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

  // Department Styling
  const deptBgColors = {
    Executive: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    IT: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800",
    HR: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    Finance: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-850",
    Marketing: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
    Sales: "bg-amber-100 text-amber-850 border-amber-200 dark:bg-amber-900/40 dark:text-amber-305 dark:border-amber-800",
  };

  // Helper date logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Filtered Bookings
  const getFilteredBookings = () => {
    return bookings.filter(b => {
      if (b.status === "cancelled") return false;
      const cabin = cabins.find(c => c.id === b.cabinId);
      if (!cabin) return false;

      if (filterBuilding !== "All" && cabin.building !== filterBuilding) return false;
      if (filterFloor !== "All" && cabin.floor !== filterFloor) return false;
      if (filterCabin !== "All" && cabin.name !== filterCabin) return false;
      if (filterDept !== "All" && b.department !== filterDept) return false;

      return true;
    });
  };

  const activeBookings = getFilteredBookings();

  // Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // RENDER MONTH VIEW
  const renderMonthView = () => {
    const totalDays = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty spaces before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[85px] border border-slate-100 bg-slate-50/30 dark:border-slate-800/40 dark:bg-slate-900/10" />);
    }

    // Days grid
    for (let day = 1; day <= totalDays; day++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
      
      const dayBookings = activeBookings.filter(b => b.date === dateStr);
      const isToday = dateStr === "2026-07-01"; // seeded current date

      days.push(
        <div 
          key={day} 
          className={`min-h-[85px] border border-slate-100 p-2 hover:bg-slate-50 dark:border-slate-800/40 dark:hover:bg-slate-800/20 flex flex-col justify-between transition-colors ${
            isToday ? "bg-blue-50/20 dark:bg-blue-950/10 border-blue-300/40" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ${
              isToday 
                ? "bg-blue-600 text-white" 
                : "text-slate-700 dark:text-slate-400"
            }`}>
              {day}
            </span>
          </div>

          {/* Bookings inside the day box */}
          <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px]">
            {dayBookings.slice(0, 3).map((b) => {
              const cabin = cabins.find(c => c.id === b.cabinId);
              const colorClass = deptBgColors[b.department as keyof typeof deptBgColors] || "bg-slate-100 text-slate-800";
              return (
                <div 
                  key={b.id} 
                  title={`${b.purpose} (${b.startTime}-${b.endTime}) - ${cabin?.name}`}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold border truncate ${colorClass}`}
                >
                  {b.startTime} {cabin?.name.split(" ").slice(-1)[0]}
                </div>
              );
            })}
            {dayBookings.length > 3 && (
              <p className="text-[8px] font-bold text-slate-400 text-center">+{dayBookings.length - 3} more</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border border-slate-200/80 rounded-xl overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-900/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div key={dayName} className="py-2 text-center text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            {dayName}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // RENDER WEEK VIEW
  const renderWeekView = () => {
    // Generate dates in current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      weekDays.push(dayDate);
    }

    return (
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-900/50">
        {/* Header grid */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
          <div className="py-2.5 px-3 text-[10px] font-bold bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/60 uppercase">
            Time
          </div>
          {weekDays.map((day, idx) => {
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const isToday = dateStr === "2026-07-01";
            return (
              <div 
                key={idx} 
                className={`py-2 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                  isToday ? "bg-blue-50/20 dark:bg-blue-950/25" : ""
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className={`text-xs font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${
                  isToday ? "bg-blue-600 text-white" : "text-slate-800 dark:text-slate-300"
                }`}>
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hour Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[50px]">
              {/* Hour cell */}
              <div className="p-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-100 dark:border-slate-800/60 flex items-center justify-center">
                {hour}
              </div>
              
              {/* Day slots */}
              {weekDays.map((day, idx) => {
                const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                
                // Bookings that match date and overlap this hour block
                const nextHourVal = parseInt(hour.split(":")[0]) + 1;
                const nextHour = `${String(nextHourVal).padStart(2, "0")}:00`;
                
                const slotBookings = activeBookings.filter(b => {
                  return b.date === dateStr && b.startTime < nextHour && b.endTime > hour;
                });

                return (
                  <div key={idx} className="p-1.5 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors">
                    {slotBookings.map((b) => {
                      const cabin = cabins.find(c => c.id === b.cabinId);
                      const colorClass = deptBgColors[b.department as keyof typeof deptBgColors] || "bg-slate-100 text-slate-800";
                      return (
                        <div 
                          key={b.id}
                          className={`p-1.5 rounded text-[8px] font-bold border ${colorClass} truncate mb-1 shadow-xs`}
                          title={`${b.purpose} - ${cabin?.name}`}
                        >
                          <p className="leading-none">{cabin?.name.split(" ").slice(0, 2).join(" ")}</p>
                          <p className="opacity-75 text-[7px] mt-0.5">{b.startTime}-{b.endTime}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // RENDER DAY VIEW
  const renderDayView = () => {
    const formattedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    const dayBookings = activeBookings.filter(b => b.date === formattedDateStr);

    return (
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-900/50">
        
        {/* Day Header */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-950/40 dark:text-blue-400">
            {dayBookings.length} Active Bookings
          </span>
        </div>

        {/* Hourly Breakdown list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto p-4 space-y-3">
          {dayBookings.length > 0 ? (
            dayBookings.map((b) => {
              const cabin = cabins.find(c => c.id === b.cabinId);
              const colorClass = deptBgColors[b.department as keyof typeof deptBgColors] || "bg-slate-100 text-slate-800";
              
              return (
                <div 
                  key={b.id} 
                  className={`p-4 rounded-xl border flex items-center justify-between shadow-xs transition-transform hover:translate-x-1 ${colorClass}`}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col justify-center items-center px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-white/50 dark:border-slate-800/40 min-w-[80px]">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Time</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{b.startTime} - {b.endTime}</span>
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-tight">{b.purpose}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] opacity-80">
                        <span className="font-semibold">{cabin?.name}</span>
                        <span>•</span>
                        <span>Capacity: {cabin?.capacity} seats</span>
                        <span>•</span>
                        <span>Building: {cabin?.building} • Floor {cabin?.floor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider">
                      {b.department}
                    </span>
                    <p className="text-[10px] opacity-75 mt-1">Host: {b.userName}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Info size={32} className="text-slate-300 dark:text-slate-700" />
              <p className="font-semibold">No bookings scheduled on this date.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Calendar Controls & Filters */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-5">
        
        {/* Navigation & View Toggles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <CalendarIcon size={18} />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              <h3 className="text-base font-bold text-slate-800 dark:text-white min-w-[140px] text-center">
                {viewMode === "month" && currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {viewMode === "week" && `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                {viewMode === "day" && currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h3>
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-850 p-1">
            {["month", "week", "day"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all
                  ${viewMode === mode 
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}
                `}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Filters collapse drawer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2 mb-3 text-slate-600 dark:text-slate-400">
            <SlidersHorizontal size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Search Filters</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs font-medium">
            
            {/* Building filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Building</label>
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              >
                <option value="All">All Buildings</option>
                <option value="Main HQ">Main HQ</option>
                <option value="West Wing">West Wing</option>
              </select>
            </div>

            {/* Floor filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Floor</label>
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              >
                <option value="All">All Floors</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
              </select>
            </div>

            {/* Cabin filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cabin/Room</label>
              <select
                value={filterCabin}
                onChange={(e) => setFilterCabin(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              >
                <option value="All">All Rooms</option>
                {cabins.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Department filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              >
                <option value="All">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid rendering based on mode */}
      <div className="space-y-4">
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>
    </div>
  );
}
