"use client";

import React, { useEffect, useState } from "react";
import { Bed, Edit3, Plus, Trash2, Wrench, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  getRoomTypes,
  getRoomFacilities,
  createType,
  updateType,
  deleteType,
  createFacility,
  updateFacility,
  deleteFacility,
} from "../../http";
import { ItemType } from "@/app/Types/Cabin";
import { useBooking } from "@/app/context/BookingContext";


export default function TypeAndFacilities() {

  const { fetchTypes, types, fetchFacilities, facilities, loadingTypes, loadingFacilities } = useBooking();

  // Room Type Modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<ItemType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeOrder, setTypeOrder] = useState<number>(0);
  const [submittingType, setSubmittingType] = useState(false);

  // Facility Modal
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<ItemType | null>(null);
  const [facilityName, setFacilityName] = useState("");
  const [facilityOrder, setFacilityOrder] = useState<number>(0);
  const [submittingFacility, setSubmittingFacility] = useState(false);

  // Delete Confirmations
  const [typeToDelete, setTypeToDelete] = useState<ItemType | null>(null);
  const [deletingType, setDeletingType] = useState(false);

  const [facilityToDelete, setFacilityToDelete] = useState<ItemType | null>(null);
  const [deletingFacility, setDeletingFacility] = useState(false);


  // Room Type Handlers
  const handleOpenAddType = () => {
    setEditingType(null);
    setTypeName("");
    const nextOrder = types.length > 0 ? Math.max(...types.map(t => t.order)) + 1 : 1;
    setTypeOrder(nextOrder);
    setShowTypeModal(true);
  };

  const handleOpenEditType = (type: ItemType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeOrder(type.order);
    setShowTypeModal(true);
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSubmittingType(true);
    try {
      if (editingType) {
        const res = await updateType(editingType._id, {
          name: typeName.trim(),
          order: Number(typeOrder),
        });
        toast.success(res?.data?.message || "Cabin type updated successfully!");
      } else {
        const res = await createType({
          name: typeName.trim(),
          order: Number(typeOrder),
        });
        toast.success(res?.data?.message || "Cabin type created successfully!");
      }
      setShowTypeModal(false);
      fetchTypes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save cabin type.");
    } finally {
      setSubmittingType(false);
    }
  };

  const handleTypeDeleteConfirm = async () => {
    if (!typeToDelete) return;
    setDeletingType(true);
    try {
      const res = await deleteType(typeToDelete._id);
      toast.success(res?.data?.message || "Cabin type deleted successfully!");
      setTypeToDelete(null);
      fetchTypes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete cabin type.");
    } finally {
      setDeletingType(false);
    }
  };

  // Facility Handlers
  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    setFacilityName("");
    const nextOrder = facilities.length > 0 ? Math.max(...facilities.map(f => f.order)) + 1 : 1;
    setFacilityOrder(nextOrder);
    setShowFacilityModal(true);
  };

  const handleOpenEditFacility = (fac: ItemType) => {
    setEditingFacility(fac);
    setFacilityName(fac.name);
    setFacilityOrder(fac.order);
    setShowFacilityModal(true);
  };

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSubmittingFacility(true);
    try {
      if (editingFacility) {
        const res = await updateFacility(editingFacility._id, {
          name: facilityName.trim(),
          order: Number(facilityOrder),
        });
        toast.success(res?.data?.message || "Facility updated successfully!");
      } else {
        const res = await createFacility({
          name: facilityName.trim(),
          order: Number(facilityOrder),
        });
        toast.success(res?.data?.message || "Facility created successfully!");
      }
      setShowFacilityModal(false);
      fetchFacilities();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save facility.");
    } finally {
      setSubmittingFacility(false);
    }
  };

  const handleFacilityDeleteConfirm = async () => {
    if (!facilityToDelete) return;
    setDeletingFacility(true);
    try {
      const res = await deleteFacility(facilityToDelete._id);
      toast.success(res?.data?.message || "Facility deleted successfully!");
      setFacilityToDelete(null);
      fetchFacilities();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete facility.");
    } finally {
      setDeletingFacility(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Room Types */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Bed size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Room / Cabin Types</h3>
            </div>
            <button
              onClick={handleOpenAddType}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Add Type</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
            {loadingTypes ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading room types...
              </div>
            ) : types.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No room types found. Add a type to get started.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Type Name</th>
                    <th className="p-3">Display Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {types.map((type, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{type.name}</td>
                      <td className="p-3 font-semibold">{type.order}</td>
                      <td className="p-3 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditType(type)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Edit type"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => setTypeToDelete(type)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-55 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-955/20"
                          title="Delete type"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Facilities */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Room Facilities</h3>
            </div>
            <button
              onClick={handleOpenAddFacility}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Add Facility</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
            {loadingFacilities ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading facilities...
              </div>
            ) : facilities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No facilities found. Add a facility to get started.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Facility Name</th>
                    <th className="p-3">Display Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {facilities.map((fac, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{fac.name}</td>
                      <td className="p-3 font-semibold">{fac.order}</td>
                      <td className="p-3 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditFacility(fac)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Edit facility"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => setFacilityToDelete(fac)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-55 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-955/20"
                          title="Delete facility"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Add / Update Room Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-enter">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingType ? `Edit Cabin Type: ${editingType.name}` : "Add New Cabin Type"}
              </h3>
              <button
                onClick={() => setShowTypeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTypeSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-650 dark:text-slate-400">Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Board Room"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-650 dark:text-slate-400">Display Order</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={typeOrder}
                  onChange={(e) => setTypeOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={submittingType}
                className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {submittingType ? "Saving…" : editingType ? "Save Updates" : "Create Type"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Update Facility Modal */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-enter">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingFacility ? `Edit Facility: ${editingFacility.name}` : "Add New Facility"}
              </h3>
              <button
                onClick={() => setShowFacilityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFacilitySubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-650 dark:text-slate-400">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Projector"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-650 dark:text-slate-400">Display Order</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={facilityOrder}
                  onChange={(e) => setFacilityOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFacility}
                className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {submittingFacility ? "Saving…" : editingFacility ? "Save Updates" : "Create Facility"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Type Confirmation Modal */}
      {typeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Cabin Type</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-650 dark:text-slate-300 font-medium">
              Are you sure you want to delete cabin type <span className="font-bold text-slate-800 dark:text-white">{typeToDelete.name}</span>?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setTypeToDelete(null)}
                disabled={deletingType}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTypeDeleteConfirm}
                disabled={deletingType}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingType ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Facility Confirmation Modal */}
      {facilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Facility</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-650 dark:text-slate-300 font-medium">
              Are you sure you want to delete facility <span className="font-bold text-slate-800 dark:text-white">{facilityToDelete.name}</span>?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setFacilityToDelete(null)}
                disabled={deletingFacility}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFacilityDeleteConfirm}
                disabled={deletingFacility}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingFacility ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
