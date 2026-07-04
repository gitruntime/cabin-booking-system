"use client";

import {
  Edit3,
  Plus,
  Settings,
  Trash2,
  Wrench,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBooking } from "../../context/BookingContext";
import { buildings, cabinFacilities, departments } from "@/app/Data";
import { createCabin, getCabins, updateCabin, deleteCabin as deleteCabinApi, toggleMaintainance as toggleMaintainanceApi } from "../../http";
import toast from "react-hot-toast";
import { CabinType } from "@/app/Types/Cabin";

export default function CabinatesHandle() {
  const { cabinList, setCabinList } = useBooking();
  const [loadingCabins, setLoadingCabins] = useState(true);

  // Maintenance Confirmation
  const [cabinToToggle, setCabinToToggle] = useState<any>(null);
  const [toggling, setToggling] = useState(false);

  const handleMaintenanceConfirm = async () => {
    if (!cabinToToggle) return;
    setToggling(true);
    try {
      const res = await toggleMaintainanceApi(cabinToToggle._id);
      const newStatus = cabinToToggle.status === "maintenance" ? "available" : "maintenance";
      setCabinList(prev => prev.map(c => c._id === cabinToToggle._id ? { ...c, status: newStatus } : c));
      toast.success(res?.data?.message || `Cabin marked as ${newStatus}.`);
      setCabinToToggle(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update maintenance status.");
    } finally {
      setToggling(false);
    }
  };

  // Delete Confirmation
  const [cabinToDelete, setCabinToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!cabinToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteCabinApi(cabinToDelete._id);
      setCabinList(prev => prev.filter(c => c._id !== cabinToDelete._id));
      toast.success(res?.data?.message || "Cabin deleted successfully!");
      setCabinToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete cabin.");
    } finally {
      setDeleting(false);
    }
  };

  // Cabin Form Dialog
  const [showCabinModal, setShowCabinModal] = useState(false);
  const [editingCabin, setEditingCabin] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cabin Form Inputs
  const [cabinName, setCabinName] = useState("");
  const [cabinType, setCabinType] = useState<CabinType["type"]>("cabin");
  const [building, setBuilding] = useState<CabinType["building"]>("Main HQ");
  const [floor, setFloor] = useState<CabinType["floor"]>("1st Floor");
  const [capacity, setCapacity] = useState(4);
  const [facilities, setFacilities] = useState<CabinType["facilities"]>([]);
  const [dept, setDept] = useState<CabinType["department"]>("None");
  const [mapX, setMapX] = useState(25);
  const [mapY, setMapY] = useState(25);
  const [mapW, setMapW] = useState(15);
  const [mapH, setMapH] = useState(15);

  const handleFacilityChange = (fac: CabinType["facilities"][number]) => {
    if (facilities.includes(fac)) {
      setFacilities(facilities.filter(f => f !== fac));
    } else {
      setFacilities([...facilities, fac]);
    }
  };

  const handleOpenAdd = () => {
    setEditingCabin(null);
    setCabinName("");
    setCabinType("cabin");
    setBuilding("Main HQ");
    setFloor("1st Floor");
    setCapacity(4);
    setFacilities([]);
    setDept("None");
    setMapX(40);
    setMapY(40);
    setMapW(15);
    setMapH(15);
    setShowCabinModal(true);
  };

  const handleOpenEdit = (cabin: any) => {
    setEditingCabin(cabin);
    setCabinName(cabin.name);
    setCabinType(cabin.type);
    setBuilding(cabin.building);
    setFloor(cabin.floor);
    setCapacity(cabin.capacity);
    setFacilities(cabin.facilities);
    setDept(cabin.department || "None");
    setMapX(cabin.xAxis);
    setMapY(cabin.yAxis);
    setMapW(cabin.width);
    setMapH(cabin.height);
    setShowCabinModal(true);
  };

  const handleCabinFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabinName.trim()) return;

    const cabinData = {
      name: cabinName,
      type: cabinType,
      building,
      floor,
      capacity,
      facilities,
      status: (editingCabin ? editingCabin.status : "available"),
      department: dept,
      xAxis: Number(mapX),
      yAxis: Number(mapY),
      width: Number(mapW),
      height: Number(mapH)
    };

    setSubmitError(null);
    setSubmitting(true);
    try {
      if (editingCabin) {
        const res = await updateCabin(editingCabin._id, cabinData);
        setCabinList(prev => prev.map(c => c._id === editingCabin._id ? { ...c, ...cabinData } : c));
        toast.success(res?.data?.message || "Cabin updated successfully!");
      } else {
        const res = await createCabin(cabinData);
        toast.success(res?.data?.message || "Cabin created successfully!");
      }
      setShowCabinModal(false);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? "Failed to create cabin. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCabins = async () => {
      if (cabinList.length === 0) {
        setLoadingCabins(true);
      } else {
        setLoadingCabins(false);
      }
      try {
        const res = await getCabins();
        setCabinList(res?.data || []);
        setLoadingCabins(false);
      } catch (err) {
        console.error("Failed to fetch cabins:", err);
        setLoadingCabins(false);
      }
    };

    fetchCabins();
  }, [showCabinModal]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">System Cabins Setup</h3>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Add Cabin</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
          {loadingCabins ? (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Loading cabins...
            </div>) :
            <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Room Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Facilities</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cabinList.map((cabin, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{cabin?.name}</td>
                    <td className="p-3 capitalize">{cabin?.type}</td>
                    <td className="p-3 font-bold">{cabin?.capacity} seats</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-50">
                        {cabin?.facilities.map((f: any, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded dark:bg-slate-800 dark:text-slate-400 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cabin.status === 'available' ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        cabin.status === 'maintenance' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                          cabin.status === 'reserved' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                        {cabin.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => setCabinToToggle(cabin)}
                        className={`p-1.5 rounded-lg border transition-colors ${cabin.status === "maintenance"
                          ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                          : "hover:bg-slate-100 border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        title={cabin.status === "maintenance" ? "Put back online" : "Block for maintenance"}
                      >
                        <Wrench size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(cabin)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        title="Edit cabin details"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setCabinToDelete(cabin)}
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                        title="Delete cabin"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>

      {/* Maintenance Toggle Confirmation Popup */}
      {cabinToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                <Wrench size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {cabinToToggle.status === "maintenance" ? "Restore Cabin" : "Flag for Maintenance"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This will update the cabin's availability.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {cabinToToggle.status === "maintenance"
                ? <>Mark <span className="font-bold text-slate-800 dark:text-white">{cabinToToggle.name}</span> as <span className="font-bold text-emerald-600">available</span> again?</>
                : <>Block <span className="font-bold text-slate-800 dark:text-white">{cabinToToggle.name}</span> and set it to <span className="font-bold text-amber-600">maintenance</span>?</>}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCabinToToggle(null)}
                disabled={toggling}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMaintenanceConfirm}
                disabled={toggling}
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {toggling ? "Updating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {cabinToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Cabin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">{cabinToDelete.name}</span>?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCabinToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabin Edit/Add Modal Dialog */}
      {showCabinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-enter">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingCabin ? `Edit Cabin: ${editingCabin.name}` : "Add New System Cabin"}
              </h3>
              <button
                onClick={() => setShowCabinModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCabinFormSubmit} className="space-y-4 text-xs font-semibold">

              {/* Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Cabin / Room Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Board Room C"
                    value={cabinName}
                    onChange={(e) => setCabinName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Room Type</label>
                  <select
                    value={cabinType}
                    onChange={(e) => setCabinType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="cabin">Individual Cabin</option>
                    <option value="conference">Conference Hall</option>
                    <option value="meeting">Standard Meeting Room</option>
                    <option value="boardroom">Board Room</option>
                    <option value="pod">Acoustic Pod</option>
                  </select>
                </div>
              </div>

              {/* Building & Floor & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Building</label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {
                      buildings.map((bld, i) => (
                        <option key={i} value={bld}>{bld}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Floor</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Department Assignment */}
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">Assigned Department (Dedicated Rooms)</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="None">None (Shared Space)</option>
                  {
                    departments.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))
                  }
                </select>
              </div>

              {/* Interactive Floor map positions percentages */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 space-y-2 border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Interactive Floor Map Coordinates (%)</p>
                <div className="grid grid-cols-4 gap-2.5 font-normal text-xs">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">From left (%)</label>
                    <input type="number" min="0" max="100" value={mapX} onChange={(e) => setMapX(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">From top (%)</label>
                    <input type="number" min="0" max="100" value={mapY} onChange={(e) => setMapY(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">Width (%)</label>
                    <input type="number" min="5" max="50" value={mapW} onChange={(e) => setMapW(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">Height (%)</label>
                    <input type="number" min="5" max="50" value={mapH} onChange={(e) => setMapH(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">Cabin Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-normal">
                  {cabinFacilities.map((fac) => {
                    const isChecked = facilities.includes(fac);
                    return (
                      <label
                        key={fac}
                        className={`
                          flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none text-[11px] font-semibold transition-all
                          ${isChecked
                            ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400"
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/50 dark:bg-slate-850 dark:border-slate-800/80"}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFacilityChange(fac)}
                          className="h-3.5 w-3.5 rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{fac}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              {submitError && (
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {submitting ? "Saving…" : editingCabin ? "Save Updates" : "Create Cabin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
