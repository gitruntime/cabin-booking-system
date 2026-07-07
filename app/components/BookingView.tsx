"use client";

import {
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  DoorOpen,
  Hash,
  Layers,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { BuildingType, CabinType, FloorType } from "../Types/Cabin";
import { bookCabin, getBookingsByCabinId } from "../http";

export default function BookingView() {
  const {
    cabinList,
    getAIRecommendations,
    buildingList,
    departments,
    setCurrentTab,
    facilities
  } = useBooking();


  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>();
  const [selectedFloor, setSelectedFloor] = useState<FloorType>();
  const [isBuildingDropdownOpen, setIsBuildingDropdownOpen] = useState(false);
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);
  const buildingDropdownRef = useRef(null)
  const floorDropdownRef = useRef(null)
  const [floorList, setFloorList] = useState<FloorType[]>();
  // Form states
  const [cabinId, setCabinId] = useState("");
  const [date, setDate] = useState("2026-07-01");
  const [startTime, setStartTime] = useState("14:30");
  const [endTime, setEndTime] = useState("15:30");
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState(false);
  const [attendees, setAttendees] = useState(4);
  const [purpose, setPurpose] = useState("");
  const [department, setDepartment] = useState<string | undefined>();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Availability & Recommendation state
  const [availability, setAvailability] = useState("");
  const [recommendations, setRecommendations] = useState<CabinType[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // Set default cabin when floor/building changes
  const filteredCabins = cabinList.filter(c => {
    if (!selectedBuilding || !selectedFloor) return false;

    const cBuildingId = c.buildingId || c.buildingId || c.building?._id;
    const cBuildingName = typeof c.building === "string" ? c.building : c.building?.name;
    const isBuildingMatch =
      cBuildingId === selectedBuilding._id ||
      cBuildingName === selectedBuilding.name;

    const cFloorId = c.floorId || c.floorId || c.floor?._id;
    const cFloorName = typeof c.floor === "string" ? c.floor : c.floor?.name;
    const isFloorMatch =
      cFloorId === selectedFloor._id ||
      cFloorName === selectedFloor.name;

    return isBuildingMatch && isFloorMatch;
  });


  const [cabinBookings, setCabinBookings] = useState<any[]>([]);

  const checkAvailabilityByCabinId = async (id: string) => {
    try {
      const res = await getBookingsByCabinId(id);
      setCabinBookings(res?.data?.bookings || []);
    } catch (error) {
      console.log(error);
      setCabinBookings([]);
    }
  };

  useEffect(() => {
    if (cabinId) {
      checkAvailabilityByCabinId(cabinId);
    } else {
      setCabinBookings([]);
    }
  }, [cabinId]);

  useEffect(() => {
    if (filteredCabins.length > 0) {
      // Keep selected cabin if it exists on new floor, otherwise reset
      const exists = filteredCabins.some(c => c._id === cabinId);
      if (!exists) {
        setCabinId(filteredCabins[0]._id);
      }
    } else {
      setCabinId("");
    }
  }, [selectedBuilding, selectedFloor, cabinId, filteredCabins]);

  // Compute availability based on selected cabin, date, time and loaded bookings
  useEffect(() => {
    if (!cabinId) {
      setAvailability("");
      return;
    }

    const activeCabin = cabinList.find(c => c._id === cabinId);
    if (activeCabin?.status === "maintenance") {
      setAvailability("maintenance");
      return;
    }

    if (!date || !startTime || !endTime) {
      setAvailability("available");
      return;
    }

    // Find overlapping active booking
    const overlapping = cabinBookings.find(b => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      return b.date === date && b.startTime < endTime && b.endTime > startTime;
    });

    if (overlapping) {
      setAvailability(overlapping.status); // "confirmed" or "checked-in"
    } else {
      setAvailability("available");
    }
  }, [cabinId, date, startTime, endTime, cabinBookings, cabinList]);

  // Run recommendations check when parameters change
  useEffect(() => {
    if (!cabinId || !date || !startTime || !endTime) return;

    // Fetch AI Recommendations based on requirements (needed facilities can be mapped)
    const activeCabin = cabinList.find(c => c._id === cabinId);
    const neededFacilities = activeCabin ? activeCabin.facilities : [];
    const recs = getAIRecommendations(attendees, neededFacilities, date, startTime, endTime);
    // Filter out the currently selected cabin from recommendations
    setRecommendations(recs.filter(r => r._id !== cabinId));
  }, [cabinId, date, startTime, endTime, attendees, cabinList]);

  useEffect(() => {
    if (departments) {
      setDepartment(departments[0].name);
    }
  }, [departments])
  // Handle Form Submission
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true)

    if (!cabinId) {
      setSubmitError("Please select a cabin.");
      setSubmitLoading(false)
      return;
    }
    if (!purpose.trim()) {
      setSubmitError("Please describe the meeting purpose.");
      setSubmitLoading(false)
      return;
    }
    if (startTime >= endTime) {
      setSubmitError("Start time must be earlier than End time.");
      setSubmitLoading(false)
      return;
    }

    const selectedDeptObj = departments.find(d => d.name === department);
    if (!selectedDeptObj) {
      setSubmitError("Please select a valid department.");
      setSubmitLoading(false)
      return;
    }

    try {
      const response = await bookCabin({
        buildingId: selectedBuilding?._id,
        floorId: selectedFloor?._id,
        cabinId,
        departmentId: selectedDeptObj._id,
        date,
        startTime,
        endTime,
        attendees,
        meetingPurpose: purpose
      });

      if (response.data && response.data.success) {
        setSuccessModal(true);
        setSubmitLoading(false);
        if (cabinId) {
          checkAvailabilityByCabinId(cabinId);
        }
      } else {
        setSubmitError(response.data?.message || "Failed to book room.");
        setSubmitLoading(false);
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      const msg = error.response?.data?.message || error.message || "Failed to book room.";
      setSubmitError(msg);
      setSubmitLoading(false)
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    return (eH * 60 + eM) - (sH * 60 + sM);
  };

  const getThirtyMinsAfter = (timeStr: string): string => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes + 30;
    if (totalMinutes >= 24 * 60) {
      totalMinutes = 24 * 60 - 1;
    }
    const nextHours = Math.floor(totalMinutes / 60);
    const nextMinutes = totalMinutes % 60;
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(nextHours)}:${pad(nextMinutes)}`;
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    if (!isEndTimeManuallySet) {
      setEndTime(getThirtyMinsAfter(val));
    }
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    setIsEndTimeManuallySet(true);
  };

  const handleApplyRecommendation = (recCabin: CabinType) => {
    let targetBuilding: BuildingType | undefined = undefined;
    if (recCabin.building && typeof recCabin.building === "object") {
      targetBuilding = recCabin.building;
    } else {
      const bldId = recCabin.buildingId || recCabin.buildingId || recCabin.building?._id || recCabin.building;
      targetBuilding = buildingList.find(b => b._id === bldId || b.name === bldId);
    }
    if (targetBuilding) {
      setSelectedBuilding(targetBuilding);
    }

    let targetFloor: FloorType | undefined = undefined;
    if (recCabin.floor && typeof recCabin.floor === "object") {
      targetFloor = recCabin.floor;
    } else {
      const flrId = recCabin.floorId || recCabin.floorId || recCabin.floor?._id || recCabin.floor;
      const floorsToSearch = targetBuilding?.floors || floorList || [];
      targetFloor = floorsToSearch.find(f => f._id === flrId || f.name === flrId);
    }
    if (targetFloor) {
      setSelectedFloor(targetFloor);
    }

    setCabinId(recCabin._id);
  };

  const activeCabinObj = cabinList.find(c => c._id === cabinId);

  useEffect(() => {
    if (buildingList && buildingList.length > 0) {
      setSelectedBuilding(buildingList[0]);
    }
  }, [buildingList])

  useEffect(() => {
    if (selectedBuilding) {
      setFloorList(selectedBuilding?.floors);
    }
  }, [selectedBuilding])

  useEffect(() => {
    if (floorList && floorList.length > 0) {
      setSelectedFloor(floorList[0])
    }
  }, [floorList])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Booking Form Card (2/3 width) */}
        <div className="xl:col-span-2 p-5 md:p-6 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Reserve Space</h3>
          </div>

          <form onSubmit={handleBook} className="space-y-5">

            {submitError && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Location details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Building */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Building size={14} className="text-slate-400" />
                  <span>Building</span>
                </label>
                <div className="relative" ref={buildingDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsBuildingDropdownOpen(!isBuildingDropdownOpen)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>{selectedBuilding?.name}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${isBuildingDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isBuildingDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1">
                      {buildingList && buildingList.length > 0 ? (
                        buildingList.map((bld, i) => {
                          const isSelected = selectedBuilding?._id === bld?._id;
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedBuilding(bld);
                                setIsBuildingDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                }`}
                            >
                              <span>{bld?.name}</span>
                              {isSelected && <Check size={12} className="text-blue-600 dark:text-blue-400" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 text-center">
                          No buildings available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Floor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers size={14} className="text-slate-400" />
                  <span>Floor</span>
                </label>
                <div className="relative" ref={floorDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>{selectedFloor?.name}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${isFloorDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isFloorDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1">
                      {floorList && floorList.length > 0 ? (
                        floorList.map((floor, i) => {
                          const isSelected = selectedFloor?._id === floor._id;
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedFloor(floor);
                                setIsFloorDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                }`}
                            >
                              <span>{floor.name}</span>
                              {isSelected && <Check size={12} className="text-blue-600 dark:text-blue-400" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 text-center">
                          No floors available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cabin Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <DoorOpen size={14} className="text-slate-400" />
                  <span>Cabin/Room</span>
                </label>
                <select
                  value={cabinId}
                  onChange={(e) => setCabinId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  {filteredCabins.length > 0 ? (
                    filteredCabins.map((c, i) => (
                      <option key={i} value={c._id}>
                        {c.name} (Cap: {c.capacity})
                      </option>
                    ))
                  ) : (
                    <option value="">No cabins available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                />
              </div>

              {/* Start time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Start Time</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                />
              </div>

              {/* End time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>End Time</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  min={startTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Attendance & Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Attendees count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>No. of Attendees</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                />
              </div>

              {/* Department selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Hash size={14} className="text-slate-400" />
                  <span>Department Host</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  {
                    departments.map((dept, i) => (
                      <option key={i} value={dept?.name}>{dept?.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Booking status visualizer */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${availability === "available"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                  : availability === "confirmed"
                    ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                    : availability === "checked-in"
                      ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                      : availability === "completed"
                        ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400"
                        : availability === "cancelled"
                          ? "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400"
                          : availability === "maintenance"
                            ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                  }`}>
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 animate-pulse ${availability === "available" ? "bg-emerald-500" :
                    availability === "confirmed" ? "bg-amber-500" :
                      availability === "checked-in" ? "bg-rose-500" :
                        availability === "completed" ? "bg-blue-500" :
                          availability === "cancelled" ? "bg-slate-400" :
                            availability === "maintenance" ? "bg-slate-400" : "bg-emerald-500"
                    }`} />
                  <span>
                    {availability === "available" ? "Available Instantly" :
                      availability === "confirmed" ? "Confirmed (Reserved)" :
                        availability === "checked-in" ? "Checked In" :
                          availability === "completed" ? "Completed" :
                            availability === "cancelled" ? "Cancelled" :
                              availability === "maintenance" ? "Under Maintenance" : "Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase size={14} className="text-slate-400" />
                <span>Meeting Purpose</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="E.g., Weekly Sync, Budget Approval, Candidate Evaluation..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                (availability !== "available" &&
                  availability !== "cancelled" &&
                  availability !== "completed" &&
                  availability !== "") ||
                submitLoading
              }
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ShieldCheck size={16} />
              <span>
                {submitLoading
                  ? "Loading..."
                  : (availability === "available" ||
                    availability === "cancelled" ||
                    availability === "completed" ||
                    availability === "")
                    ? "Book Space Now"
                    : "Book"}
              </span>
            </button>
          </form>
        </div>

        {/* Info Column (1/3 width): Selected Cabin details & Smart AI recommendations */}
        <div className="space-y-6">

          {/* Cabin Detail Card */}
          {activeCabinObj ? (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Space Details</h3>

              <div>
                <span className="text-[9px] font-bold text-blue-500 uppercase">{buildingList.find(b => b._id === activeCabinObj.buildingId)?.name} • {floorList && floorList.find(f => f._id === activeCabinObj.floorId)?.name}</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">{activeCabinObj.name}</h4>
                <p className="text-xs text-slate-400 capitalize mt-0.5">Type: {activeCabinObj.name}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Max Capacity</span>
                  <span className="font-bold text-slate-800 dark:text-white">{activeCabinObj.capacity} seats</span>
                </div>

                {activeCabinObj.department && activeCabinObj.department !== "None" && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Assigned Department</span>
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      {activeCabinObj.department}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Available Facilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCabinObj.facilities.map((fac, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold dark:bg-slate-800 dark:text-slate-300">
                      {facilities.find(f => f._id === fac)?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 text-center text-slate-400 text-xs py-8">
              Select a cabin to view details
            </div>
          )}

          {/* AI recommendations panel */}
          <div className="p-5 rounded-2xl bg-linear-to-tr from-slate-50 to-blue-50/50 border border-slate-200/60 dark:from-slate-900 dark:to-blue-950/20 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 border-b border-blue-100/50 dark:border-slate-800 pb-2">
              <Sparkles size={16} className="animate-pulse" />
              <h3 className="font-bold text-sm">Room Suggest</h3>
            </div>

            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3 rounded-xl border border-white bg-white/60 dark:border-slate-800/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-950 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{buildingList.find(b => b._id === rec.buildingId)?.name} • {floorList && floorList.find(f => f._id === rec.floorId)?.name}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{rec.name}</h4>
                      <p className="text-[10px] text-slate-400">Fits {rec.capacity} seats • {rec.facilities.map(f => facilities.find(fac => fac._id === f)?.name).join(", ")}</p>
                    </div>

                    <button
                      onClick={() => handleApplyRecommendation(rec)}
                      className="mt-2.5 py-1 px-3 rounded-lg bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 transition-colors self-end active:scale-95"
                    >
                      Choose This
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed">
                  No overlapping alternative rooms found. The current selection fits your configurations!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Confirmation Dialog */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-enter">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Booking Confirmed!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your reservation has been created and synced with the calendar. A reminder will fire before the meeting starts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/80 text-left text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-200">{purpose}</p>
              <p className="text-slate-500 dark:text-slate-400">{activeCabinObj?.name}</p>
              <p className="text-slate-500 dark:text-slate-400">Date: {date}</p>
              <p className="text-slate-500 dark:text-slate-400">Time: {startTime} - {endTime} ({calculateDuration(startTime, endTime)} mins)</p>
            </div>

            <button
              onClick={() => {
                setSuccessModal(false);
                setCurrentTab("my-bookings");
              }}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
