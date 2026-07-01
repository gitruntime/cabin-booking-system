"use client";

import React from "react";
import { useBooking } from "../context/BookingContext";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Map, 
  Plus, 
  TrendingUp, 
  Users, 
  Activity, 
  Laptop, 
  CheckSquare 
} from "lucide-react";

export default function DashboardView() {
  const { 
    currentUser, 
    cabins, 
    bookings, 
    setCurrentTab, 
    setSelectedBuilding, 
    setSelectedFloor 
  } = useBooking();

  // Filter today's bookings (2026-07-01)
  const todaysBookings = bookings
    .filter(b => b.date === "2026-07-01" && b.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Count stats
  const totalRooms = cabins.length;
  const availableNow = cabins.filter(c => c.status === "available").length;
  const activeNow = bookings.filter(b => b.date === "2026-07-01" && b.status === "checked-in").length;
  const maintenanceCount = cabins.filter(c => c.status === "maintenance").length;
  
  // Calculate cabin type distribution for micro chart
  const cabinTypes = cabins.reduce((acc, cabin) => {
    acc[cabin.type] = (acc[cabin.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Department booking metrics for visual chart
  const deptBookings = bookings.reduce((acc, b) => {
    if (b.status !== "cancelled") {
      acc[b.department] = (acc[b.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const deptColors = {
    Executive: "bg-blue-600 dark:bg-blue-500",
    IT: "bg-cyan-500 dark:bg-cyan-400",
    HR: "bg-indigo-500 dark:bg-indigo-400",
    Finance: "bg-emerald-500 dark:bg-emerald-400",
    Marketing: "bg-purple-500 dark:bg-purple-400",
    Sales: "bg-amber-500 dark:bg-amber-400",
  };

  const totalDeptBookings = Object.values(deptBookings).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Welcome back, {currentUser.name}!</h1>
          <p className="text-xs text-blue-100 mt-1 opacity-90">
            You are logged in as <span className="font-semibold">{currentUser.role === 'admin' ? 'Administrator' : 'Standard User'}</span>. Manage your bookings and find cabins instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentTab("book-cabin")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold text-xs hover:bg-blue-50 shadow-sm active:scale-[0.98] transition-all"
          >
            <Plus size={14} />
            <span>Quick Book</span>
          </button>
          <button 
            onClick={() => setCurrentTab("office-map")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800/40 text-white border border-blue-500/30 font-semibold text-xs hover:bg-blue-800/60 shadow-sm active:scale-[0.98] transition-all"
          >
            <Map size={14} />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Laptop size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cabins</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{totalRooms}</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Rooms</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{availableNow}</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Meetings</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{activeNow}</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilization Rate</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">76.4%</p>
          </div>
        </div>
      </div>

      {/* Main Section split: Left for bookings, Right for stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Bookings schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Today's Schedule</h3>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/30 dark:text-blue-400 uppercase">
                {todaysBookings.length} Bookings
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {todaysBookings.length > 0 ? (
                todaysBookings.map((b) => {
                  const cabin = cabins.find(c => c.id === b.cabinId);
                  const isCheckedIn = b.status === "checked-in";
                  
                  return (
                    <div 
                      key={b.id} 
                      className={`
                        p-3.5 rounded-xl border flex items-center justify-between transition-colors
                        ${isCheckedIn 
                          ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50" 
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 dark:bg-slate-800/30 dark:border-slate-800/60 dark:hover:bg-slate-800/60"}
                      `}
                    >
                      <div className="flex gap-3">
                        {/* Time block badge */}
                        <div className="flex flex-col justify-center items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-[70px]">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Time</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{b.startTime}</span>
                        </div>
                        
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{b.purpose}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 dark:text-slate-500 items-center font-medium">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{cabin?.name || "Deleted Cabin"}</span>
                            <span>•</span>
                            <span>Building: {cabin?.building} • Floor {cabin?.floor}</span>
                            <span>•</span>
                            <span>By: {b.userName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCheckedIn 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}>
                          {isCheckedIn ? "Checked In" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                  <CheckSquare size={36} className="text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold">No bookings scheduled for today.</p>
                  <button 
                    onClick={() => setCurrentTab("book-cabin")}
                    className="text-xs text-blue-500 font-bold hover:underline mt-1"
                  >
                    Schedule the first meeting
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Cabin Booking Assistant (Available Cabins list) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Available Cabins Today</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {cabins.filter(c => c.status === "available").slice(0, 4).map((c) => (
                <div 
                  key={c.id} 
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/30 transition-all flex flex-col justify-between dark:border-slate-800/60 dark:bg-slate-800/20 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{c.building} • {c.floor}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Capacity: {c.capacity} attendees</p>
                    
                    {/* Facilities badges */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {c.facilities.slice(0, 2).map((fac, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-200/50 text-slate-500 rounded dark:bg-slate-700/50 dark:text-slate-400">
                          {fac}
                        </span>
                      ))}
                      {c.facilities.length > 2 && (
                        <span className="px-1 py-0.5 text-[9px] font-medium text-slate-400">+{c.facilities.length - 2}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBuilding(c.building);
                      setSelectedFloor(c.floor);
                      setCurrentTab("book-cabin");
                    }}
                    className="w-full mt-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] transition-colors dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    Book Instantly
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts/Analytics */}
        <div className="space-y-6">
          
          {/* Chart 1: Bookings by Department */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Bookings by Department</h3>
            
            <div className="space-y-3">
              {Object.keys(deptColors).map((dept) => {
                const count = deptBookings[dept as any] || 0;
                const percentage = Math.round((count / totalDeptBookings) * 100) || 0;
                const color = deptColors[dept as keyof typeof deptColors];
                
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">{dept}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{count} ({percentage}%)</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Room Type Distribution (SVG Donut Chart) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Room Allocation Mix</h3>
            
            <div className="flex items-center gap-6 justify-center py-2">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="2.5" className="dark:stroke-slate-800" />
                  
                  {/* Executive Board Rooms (approx 20%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="0" />
                  {/* Conference Halls (approx 25%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-20" />
                  {/* Meeting Rooms (approx 35%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="35 65" strokeDashoffset="-45" />
                  {/* Individual Cabins/Pods (approx 20%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-80" />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-lg font-bold leading-none text-slate-800 dark:text-white">{totalRooms}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Rooms</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Executive Boardrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>Conference Halls</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span>Meeting Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Cabins & Pods</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Peak Booking Hours (Interactive SVG Bar Chart) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Hourly Peak Demands</h3>
            
            <div className="space-y-2">
              <div className="flex items-end justify-between h-28 px-2 pt-4 border-b border-slate-100 dark:border-slate-800">
                {[
                  { hour: "9a", val: 30 },
                  { hour: "10a", val: 75 },
                  { hour: "11a", val: 90 },
                  { hour: "12p", val: 40 },
                  { hour: "1p", val: 20 },
                  { hour: "2p", val: 80 },
                  { hour: "3p", val: 95 },
                  { hour: "4p", val: 65 },
                  { hour: "5p", val: 25 },
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Hover Tooltip */}
                      <span className="absolute -top-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.val}%
                      </span>
                      {/* Bar fill */}
                      <div 
                        className="w-4.5 rounded-t-sm bg-blue-500/20 group-hover:bg-blue-500 dark:bg-blue-400/20 dark:group-hover:bg-blue-400 transition-all duration-300"
                        style={{ height: `${bar.val * 0.7}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{bar.hour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
