"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Hourglass,
  Layers,
  Mail,
  MapPin,
  Save,
  Shield,
  SlidersHorizontal,
  User
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { editMyProfile } from "../http";

export default function ProfileView() {
  const { currentUser, setCurrentUser, setSelectedBuilding, setSelectedFloor, buildingList } = useBooking();


  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [prefBuilding, setPrefBuilding] = useState<string>("");
  const [prefFloor, setPrefFloor] = useState<string>("");

  useEffect(() => {
    if (currentUser?.preference?.[0]) {
      const pref = currentUser.preference[0];
      setPrefBuilding(pref.buildingId || "");
      setPrefFloor(pref.FloorId || "");
    } else if (buildingList && buildingList.length > 0) {
      setPrefBuilding(buildingList[0]._id);
      setPrefFloor(buildingList[0].floors?.[0]?._id || "");
    }
  }, [currentUser, buildingList]);

  useEffect(() => {
    if (prefBuilding) {
      const bld = buildingList.find(b => b._id === prefBuilding);
      if (bld && bld.floors && bld.floors.length > 0) {
        const hasFloor = bld.floors.some(f => f._id === prefFloor);
        if (!hasFloor) {
          setPrefFloor(bld.floors[0]._id);
        }
      }
    }
  }, [prefBuilding, prefFloor, buildingList]);

  // Compute profile statistics from currentUser dynamic fields
  const totalMeetings = Number(currentUser?.meetingsHosted || 0);
  const totalHours = Number(currentUser?.totalBookingHours || 0);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg(false);
    try {
      const prefObj = {
        buildingId: prefBuilding,
        FloorId: prefFloor
      };

      const res = await editMyProfile({ preference: [prefObj] });

      if (res.status === 200 || res.data?.success) {
        // Update user state and storage
        const updatedUser = {
          ...currentUser,
          preference: [prefObj]
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("current_user", JSON.stringify(updatedUser));

        // Update active context filters
        const bldObj = buildingList.find(b => b._id === prefBuilding);
        const flrObj = bldObj?.floors?.find(f => f._id === prefFloor);
        if (bldObj?.name) setSelectedBuilding(bldObj.name as any);
        if (flrObj?.name) setSelectedFloor(flrObj.name as any);

        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
        }, 3000);
      } else {
        setErrorMsg(res.data?.message || "Failed to save preferences.");
      }
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      setErrorMsg(error.response?.data?.message || "An error occurred while saving preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Personal details */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs flex flex-col items-center text-center space-y-4">
          {currentUser && currentUser?.avatar ? <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-24 h-24 rounded-full border-2 border-blue-500/20 shadow-md object-cover mt-2"
          /> : <User size={96} className="text-slate-400 dark:text-slate-500 mt-2" />}

          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{currentUser?.name}</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 inline-block">
              {currentUser?.department} Department
            </span>
          </div>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-left text-xs font-semibold text-slate-650 dark:text-slate-350">
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Email Address</p>
                <p className="font-normal mt-0.5 truncate">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Shield size={15} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">System Privilege</p>
                <span className="font-bold text-blue-600 dark:text-blue-400 capitalize mt-0.5 inline-block">{currentUser?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Meetings Hosted</p>
                <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{totalMeetings} Sessions</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Hourglass size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Booking Hours</p>
                <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{totalHours.toFixed(1)} hrs</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <SlidersHorizontal size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Default Reservation Preferences</h3>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-semibold">

              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Preferences saved successfully! Default settings loaded for upcoming searches.</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Building Selection */}
                <div className="space-y-1">
                  <label className="text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>Preferred Building</span>
                  </label>
                  <select
                    value={prefBuilding}
                    onChange={(e) => setPrefBuilding(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {
                      buildingList.map((bld, i) => (
                        <option key={i} value={bld._id}>{bld.name}</option>
                      ))
                    }
                  </select>
                </div>

                {/* Default Floor Selection */}
                <div className="space-y-1">
                  <label className="text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <Layers size={13} className="text-slate-400" />
                    <span>Preferred Floor</span>
                  </label>
                  <select
                    value={prefFloor}
                    onChange={(e) => setPrefFloor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {(buildingList.find(b => b._id === prefBuilding) || buildingList[0])?.floors?.map((flr, i) => (
                      <option key={i} value={flr._id}>{flr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alert Reminders */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-2">
                <label className="text-slate-600 dark:text-slate-400">System Notification Sync</label>
                <div className="space-y-2 mt-2 font-normal text-slate-500 dark:text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Send email notifications when my bookings are cancelled or edited.</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Display floating reminders 15 minutes before meetings start.</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              >
                <Save size={14} />
                <span>{loading ? "Saving..." : "Save Preferences"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
