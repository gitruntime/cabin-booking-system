"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  CheckCircle,
  CheckSquare,
  Laptop,
  Map,
  Plus,
  TrendingUp
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { calenderData } from "../http";

export default function DashboardView() {
  const {
    currentUser,
    cabinList,
    bookings,
    buildingList,
    facilities,
    departments,
    types,
    setCurrentTab,
    setSelectedBuilding,
    setSelectedFloor
  } = useBooking();

  const getBuildingName = (cabin: any) => {
    if (!cabin) return "";
    if (typeof cabin.building === "string") return cabin.building;
    if (cabin.building?.name) return cabin.building.name;
    const bldId = cabin.buildingId?._id || cabin.buildingId || cabin.building?._id || cabin.building;
    const found = buildingList?.find((b: any) => b._id === bldId);
    return found ? found.name : "";
  };

  const getFloorName = (cabin: any) => {
    if (!cabin) return "";
    if (typeof cabin.floor === "string") return cabin.floor;
    if (cabin.floor?.name) return cabin.floor.name;
    const flrId = cabin.floorId?._id || cabin.floorId || cabin.floor?._id || cabin.floor;
    const bldId = cabin.buildingId?._id || cabin.buildingId || cabin.building?._id || cabin.building;
    const foundBld = buildingList?.find((b: any) => b._id === bldId);
    const foundFloor = foundBld?.floors?.find((f: any) => f._id === flrId);
    return foundFloor ? foundFloor.name : "";
  };

  const [todaysBookings, setTodaysBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  useEffect(() => {
    const fetchTodaysBookings = async () => {
      setLoadingBookings(true);
      try {
        const response = await calenderData({
          startDate: "2026-07-01",
          endDate: "2026-07-01"
        });
        if (response?.data?.success) {
          const fetchedBookings = response.data.bookings || response.data.data || [];
          const filtered = fetchedBookings
            .filter((b: any) => b.status !== "cancelled")
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
          setTodaysBookings(filtered);
        }
      } catch (error) {
        console.error("Error fetching today's bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchTodaysBookings();
  }, [bookings]);

  // Count stats
  const totalRooms = cabinList.length;
  const availableNow = cabinList.filter(c => c.status === "available").length;
  const activeNow = todaysBookings.filter(b => b.status === "checked-in").length;
  const maintenanceCount = cabinList.filter(c => c.status === "maintenance").length;

  // // Calculate cabin type distribution for micro chart
  // const cabinTypes = cabins.reduce((acc, cabin) => {
  //   acc[cabin.type] = (acc[cabin.type] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);

  const getDeptName = (b: any) => {
    let name = "";
    if (typeof b.departmentId === "object" && b.departmentId?.name) {
      name = b.departmentId.name;
    } else if (b.departmentId) {
      const found = departments?.find((d: any) => d._id === b.departmentId);
      name = found?.name || "";
    } else {
      name = b.department || "";
    }

    const upper = name.toUpperCase();
    if (upper === "IT" || upper === "INFORMATION TECHNOLOGY") return "IT";
    if (upper === "HR" || upper === "HUMAN RESOURCES") return "HR";
    if (upper === "EXECUTIVE" || upper === "EXEC") return "Executive";
    if (upper === "FINANCE") return "Finance";
    if (upper === "MARKETING") return "Marketing";
    if (upper === "SALES") return "Sales";

    return name || "Other";
  };

  // Department booking metrics for visual chart
  const deptBookings = todaysBookings.reduce((acc, b) => {
    if (b.status !== "cancelled") {
      const deptName = getDeptName(b);
      acc[deptName] = (acc[deptName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const deptColorsPalette = [
    "bg-blue-600 dark:bg-blue-500",
    "bg-cyan-500 dark:bg-cyan-400",
    "bg-indigo-500 dark:bg-indigo-400",
    "bg-emerald-500 dark:bg-emerald-400",
    "bg-purple-500 dark:bg-purple-400",
    "bg-amber-500 dark:bg-amber-400",
    "bg-rose-500 dark:bg-rose-400",
    "bg-pink-500 dark:bg-pink-400",
    "bg-violet-500 dark:bg-violet-400",
    "bg-teal-500 dark:bg-teal-400",
    "bg-orange-500 dark:bg-orange-400"
  ];

  const getDeptColor = (deptName: string) => {
    if (!deptName) return deptColorsPalette[0];
    let hash = 0;
    for (let i = 0; i < deptName.length; i++) {
      hash = deptName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % deptColorsPalette.length;
    return deptColorsPalette[index];
  };

  const departmentNames = Array.from(new Set([
    ...(departments?.map((d: any) => d.name) || []),
    ...Object.keys(deptBookings)
  ])).filter(Boolean);

  const totalDeptBookings = departmentNames.reduce((a, dept) => a + (deptBookings[dept] || 0), 0) || 1;

  const getTypeName = (cabin: any) => {
    if (!cabin) return "Other";
    if (typeof cabin.type === "string") return cabin.type;
    if (cabin.type?.name) return cabin.type.name;
    const rawType = cabin.typeId?._id || cabin.typeId || cabin.type?._id || cabin.type;
    const found = types?.find((t: any) => t._id === rawType);
    return found ? found.name : "Other";
  };

  const typeCounts = cabinList.reduce((acc, cabin) => {
    const typeName = getTypeName(cabin);
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRoomsCount = cabinList.length || 1;

  const typeColorsPalette = [
    "#2563eb", // Blue
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#3b82f6"  // Light Blue
  ];

  const getTypeColor = (index: number) => {
    return typeColorsPalette[index % typeColorsPalette.length];
  };

  const roomAllocationMix = Object.entries(typeCounts).map(([name, count], index) => {
    const percentage = Math.round((count / totalRoomsCount) * 100);
    return {
      name,
      count,
      percentage,
      color: getTypeColor(index)
    };
  }).sort((a, b) => b.count - a.count);

  let cumulativeOffset = 0;
  const svgSegments = roomAllocationMix.map((segment) => {
    const dashArray = `${segment.percentage} ${100 - segment.percentage}`;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += segment.percentage;
    return {
      ...segment,
      dashArray,
      dashOffset
    };
  });

  const hourlyBlocks = [
    { label: "9a", start: "09:00", end: "10:00" },
    { label: "10a", start: "10:00", end: "11:00" },
    { label: "11a", start: "11:00", end: "12:00" },
    { label: "12p", start: "12:00", end: "13:00" },
    { label: "1p", start: "13:00", end: "14:00" },
    { label: "2p", start: "14:00", end: "15:00" },
    { label: "3p", start: "15:00", end: "16:00" },
    { label: "4p", start: "16:00", end: "17:00" },
    { label: "5p", start: "17:00", end: "18:00" }
  ];

  const hourlyPeakDemands = hourlyBlocks.map((block) => {
    const occupiedCabinIds = new Set(
      todaysBookings
        .filter((b) => b.startTime < block.end && b.endTime > block.start)
        .map((b) => typeof b.cabinId === "object" ? b.cabinId?._id : b.cabinId)
        .filter(Boolean)
    );
    const val = Math.round((occupiedCabinIds.size / totalRoomsCount) * 100);
    return {
      hour: block.label,
      val: Math.min(100, val)
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Welcome back, {currentUser?.name}!</h1>
          <p className="text-xs text-blue-100 mt-1 opacity-90">
            You are logged in as <span className="font-semibold">{currentUser?.role === 'admin' ? 'Administrator' : 'Standard User'}</span>. Manage your bookings and find cabins instantly.
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

            <div className="space-y-3 max-h-87.5 overflow-y-auto pr-1">
              {loadingBookings ? (
                <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p className="font-medium mt-1">Loading schedule...</p>
                </div>
              ) : todaysBookings.length > 0 ? (
                todaysBookings.map((b) => {
                  const cabinIdStr = typeof b.cabinId === "object" ? b.cabinId?._id : b.cabinId;
                  const cabin = cabinList.find(c => c._id === cabinIdStr);
                  const cabinName = typeof b.cabinId === "object" ? b.cabinId?.name : cabin?.name || "Space";

                  const bldId = typeof b.buildingId === "object" ? b.buildingId?._id : b.buildingId;
                  const foundBld = buildingList?.find((x: any) => x._id === bldId);
                  const bldName = typeof b.buildingId === "object" ? b.buildingId?.name : foundBld?.name || "";

                  const flrId = typeof b.floorId === "object" ? b.floorId?._id : b.floorId;
                  const flrName = typeof b.floorId === "object" ? b.floorId?.name : (foundBld?.floors?.find((f: any) => f._id === flrId)?.name || "");

                  const bldDisplay = bldName || getBuildingName(cabin);
                  const flrDisplay = flrName || getFloorName(cabin);

                  const userName = typeof b.userId === "object" ? b.userId?.name : b.userName || "Guest";
                  const isCheckedIn = b.status === "checked-in";
                  const purposeDisplay = b.meetingPurpose || b.purpose || "Meeting";

                  return (
                    <div
                      key={b._id || b.id}
                      className={`
                        p-3.5 rounded-xl border flex items-center justify-between transition-colors
                        ${isCheckedIn
                          ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 dark:bg-slate-800/30 dark:border-slate-800/60 dark:hover:bg-slate-800/60"}
                      `}
                    >
                      <div className="flex gap-3">
                        {/* Time block badge */}
                        <div className="flex flex-col justify-center items-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-20">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Time</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{b.startTime} - {b.endTime}</span>
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{purposeDisplay}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 dark:text-slate-500 items-center font-medium">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{cabinName}</span>
                            <span>•</span>
                            <span>Building: {bldDisplay} • Floor: {flrDisplay}</span>
                            <span>•</span>
                            <span>By: {userName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCheckedIn
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
              {cabinList.filter(c => c.status === "available").slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/30 transition-all flex flex-col justify-between dark:border-slate-800/60 dark:bg-slate-800/20 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{getBuildingName(c)} • {getFloorName(c)}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Capacity: {c.capacity} attendees</p>

                    {/* Facilities badges */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {c.facilities.slice(0, 2).map((fac, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-200/50 text-slate-500 rounded dark:bg-slate-700/50 dark:text-slate-400">
                          {facilities?.find((f: any) => f._id === fac)?.name}
                        </span>
                      ))}
                      {c.facilities.length > 2 && (
                        <span className="px-1 py-0.5 text-[9px] font-medium text-slate-400">+{c.facilities.length - 2}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBuilding(getBuildingName(c) as any);
                      setSelectedFloor(getFloorName(c) as any);
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
              {departmentNames.map((dept) => {
                const count = deptBookings[dept] || 0;
                const percentage = Math.round((count / totalDeptBookings) * 100) || 0;
                const color = getDeptColor(dept);

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

                  {/* Dynamic Segments */}
                  {svgSegments.map((segment, idx) => (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.91"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="3"
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-lg font-bold leading-none text-slate-800 dark:text-white">{totalRooms}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Rooms</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 max-h-28 overflow-y-auto pr-1">
                {roomAllocationMix.map((segment, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                      <span className="truncate max-w-28">{segment.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{segment.count} ({segment.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Peak Booking Hours (Interactive SVG Bar Chart) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Hourly Peak Demands</h3>

            <div className="space-y-2">
              <div className="flex items-end justify-between h-28 px-2 pt-4 border-b border-slate-100 dark:border-slate-800">
                {hourlyPeakDemands.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Hover Tooltip */}
                      <span className="absolute -top-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {bar.val}% Occupied
                      </span>
                      {/* Bar fill */}
                      <div
                        className="w-4.5 rounded-t-sm bg-blue-500/20 group-hover:bg-blue-500 dark:bg-blue-400/20 dark:group-hover:bg-blue-400 transition-all duration-300"
                        style={{ height: `${Math.max(3, bar.val * 0.8)}px` }}
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
