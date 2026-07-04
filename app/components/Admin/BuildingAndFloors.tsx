"use client";

import { Building2, ChevronRight, Edit3, Layers, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Building {
  id: string;
  name: string;
  location?: string;
}

interface Floor {
  id: string;
  buildingId: string;
  name: string;
  level: number;
}

const seedBuildings: Building[] = [
  { id: "b1", name: "Main HQ", location: "Downtown" },
];

const seedFloors: Floor[] = [
  { id: "f1", buildingId: "b1", name: "Ground Floor", level: 0 },
  { id: "f2", buildingId: "b1", name: "1st Floor", level: 1 },
  { id: "f3", buildingId: "b1", name: "2nd Floor", level: 2 },
];

export default function BuildingAndFloors() {
  const [buildings, setBuildings] = useState<Building[]>(seedBuildings);
  const [floors, setFloors] = useState<Floor[]>(seedFloors);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(seedBuildings[0]);

  // ── Building modal ──────────────────────────────────────────────────────────
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [buildingLocation, setBuildingLocation] = useState("");
  const [buildingSubmitting, setBuildingSubmitting] = useState(false);

  const handleOpenAddBuilding = () => {
    setEditingBuilding(null);
    setBuildingName("");
    setBuildingLocation("");
    setShowBuildingModal(true);
  };

  const handleOpenEditBuilding = (b: Building) => {
    setEditingBuilding(b);
    setBuildingName(b.name);
    setBuildingLocation(b.location ?? "");
    setShowBuildingModal(true);
  };

  const handleBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingName.trim()) return;
    setBuildingSubmitting(true);
    setTimeout(() => {
      if (editingBuilding) {
        const updated = { ...editingBuilding, name: buildingName, location: buildingLocation };
        setBuildings(prev => prev.map(b => b.id === editingBuilding.id ? updated : b));
        if (selectedBuilding?.id === editingBuilding.id) setSelectedBuilding(updated);
        toast.success("Building updated!");
      } else {
        const newB: Building = { id: `b${Date.now()}`, name: buildingName, location: buildingLocation };
        setBuildings(prev => [...prev, newB]);
        toast.success("Building created!");
      }
      setShowBuildingModal(false);
      setBuildingSubmitting(false);
    }, 400);
  };

  // ── Floor modal ─────────────────────────────────────────────────────────────
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorName, setFloorName] = useState("");
  const [floorLevel, setFloorLevel] = useState(0);
  const [floorSubmitting, setFloorSubmitting] = useState(false);

  const filteredFloors = floors
    .filter(f => f.buildingId === selectedBuilding?.id)
    .sort((a, b) => a.level - b.level);

  const handleOpenAddFloor = () => {
    if (!selectedBuilding) return;
    setEditingFloor(null);
    setFloorName("");
    setFloorLevel(filteredFloors.length);
    setShowFloorModal(true);
  };

  const handleOpenEditFloor = (f: Floor) => {
    setEditingFloor(f);
    setFloorName(f.name);
    setFloorLevel(f.level);
    setShowFloorModal(true);
  };

  const handleFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorName.trim() || !selectedBuilding) return;
    setFloorSubmitting(true);
    setTimeout(() => {
      if (editingFloor) {
        setFloors(prev => prev.map(f => f.id === editingFloor.id ? { ...f, name: floorName, level: floorLevel } : f));
        toast.success("Floor updated!");
      } else {
        const newF: Floor = { id: `f${Date.now()}`, buildingId: selectedBuilding.id, name: floorName, level: floorLevel };
        setFloors(prev => [...prev, newF]);
        toast.success("Floor created!");
      }
      setShowFloorModal(false);
      setFloorSubmitting(false);
    }, 400);
  };

  // ── Delete confirmations ────────────────────────────────────────────────────
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);

  const handleDeleteBuildingConfirm = () => {
    if (!buildingToDelete) return;
    setBuildings(prev => prev.filter(b => b.id !== buildingToDelete.id));
    setFloors(prev => prev.filter(f => f.buildingId !== buildingToDelete.id));
    if (selectedBuilding?.id === buildingToDelete.id) setSelectedBuilding(null);
    toast.success("Building deleted!");
    setBuildingToDelete(null);
  };

  const handleDeleteFloorConfirm = () => {
    if (!floorToDelete) return;
    setFloors(prev => prev.filter(f => f.id !== floorToDelete.id));
    toast.success("Floor deleted!");
    setFloorToDelete(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Buildings panel ── */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Buildings</h3>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {buildings.length}
              </span>
            </div>
            <button
              onClick={handleOpenAddBuilding}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Add Building</span>
            </button>
          </div>

          <div className="space-y-2">
            {buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Building2 size={28} className="text-slate-200 dark:text-slate-700" />
                <p className="text-xs text-slate-400 dark:text-slate-500">No buildings yet. Add one to get started.</p>
              </div>
            ) : buildings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilding(b)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${selectedBuilding?.id === b.id
                    ? "border-blue-300 bg-blue-50 dark:border-blue-700/60 dark:bg-blue-950/20"
                    : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selectedBuilding?.id === b.id
                      ? "bg-blue-100 dark:bg-blue-900/40"
                      : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                    <Building2 size={14} className={selectedBuilding?.id === b.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</p>
                    {b.location && <p className="text-[10px] text-slate-400 mt-0.5">{b.location}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mr-1">
                    {floors.filter(f => f.buildingId === b.id).length} floors
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleOpenEditBuilding(b); }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 transition-colors dark:border-slate-700 dark:hover:bg-slate-700"
                    title="Edit building"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setBuildingToDelete(b); }}
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 transition-colors dark:border-red-900/40 dark:hover:bg-red-950/20"
                    title="Delete building"
                  >
                    <Trash2 size={11} />
                  </button>
                  <ChevronRight
                    size={13}
                    className={`transition-colors ${selectedBuilding?.id === b.id ? "text-blue-500" : "text-slate-300 dark:text-slate-600"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Floors panel ── */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {selectedBuilding ? `${selectedBuilding.name} — Floors` : "Floors"}
              </h3>
              {selectedBuilding && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {filteredFloors.length}
                </span>
              )}
            </div>
            <button
              onClick={handleOpenAddFloor}
              disabled={!selectedBuilding}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              <span>Add Floor</span>
            </button>
          </div>

          {!selectedBuilding ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <Layers size={28} className="text-slate-200 dark:text-slate-700" />
              <p className="text-xs text-slate-400 dark:text-slate-500">Select a building to view its floors</p>
            </div>
          ) : filteredFloors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <Layers size={28} className="text-slate-200 dark:text-slate-700" />
              <p className="text-xs text-slate-400 dark:text-slate-500">No floors yet for {selectedBuilding.name}</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
              <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Floor Name</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFloors.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{f.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Level {f.level}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditFloor(f)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Edit floor"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => setFloorToDelete(f)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                          title="Delete floor"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Building modal ── */}
      {showBuildingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
                  <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {editingBuilding ? "Edit Building" : "New Building"}
                </h3>
              </div>
              <button
                onClick={() => setShowBuildingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleBuildingSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={buildingName}
                  onChange={e => setBuildingName(e.target.value)}
                  placeholder="e.g. Main HQ"
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBuildingModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={buildingSubmitting}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {buildingSubmitting ? "Saving..." : editingBuilding ? "Save Changes" : "Create Building"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Floor modal ── */}
      {showFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                  <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    {editingFloor ? "Edit Floor" : "New Floor"}
                  </h3>
                  <p className="text-[10px] text-slate-400">{selectedBuilding?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFloorModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleFloorSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Floor Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={floorName}
                  onChange={e => setFloorName(e.target.value)}
                  placeholder="e.g. Ground Floor, 1st Floor"
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Level Number</label>
                <input
                  type="number"
                  min={0}
                  value={floorLevel}
                  onChange={e => setFloorLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFloorModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={floorSubmitting}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {floorSubmitting ? "Saving..." : editingFloor ? "Save Changes" : "Create Floor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete building confirmation ── */}
      {buildingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Building</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This will also remove all its floors.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800 dark:text-white">{buildingToDelete.name}</span>?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setBuildingToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBuildingConfirm}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete floor confirmation ── */}
      {floorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Floor</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Remove{" "}
              <span className="font-bold text-slate-800 dark:text-white">{floorToDelete.name}</span>{" "}
              from {selectedBuilding?.name}?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setFloorToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFloorConfirm}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
