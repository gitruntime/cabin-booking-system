"use client";

import React, { useState } from "react";
import { useBooking, Cabin, User } from "../context/BookingContext";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Wrench, 
  Settings, 
  Download, 
  Users, 
  HelpCircle,
  X,
  FileSpreadsheet,
  FileText,
  Lock,
  Unlock,
  CheckCircle,
  Hash
} from "lucide-react";

export default function AdminView() {
  const { 
    cabins, 
    bookings, 
    users, 
    addCabin, 
    editCabin, 
    deleteCabin, 
    toggleCabinMaintenance 
  } = useBooking();

  const [activeSubTab, setActiveSubTab] = useState<"cabins" | "reports" | "users">("cabins");

  // Cabin Form Dialog
  const [showCabinModal, setShowCabinModal] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);

  // Cabin Form Inputs
  const [cabinName, setCabinName] = useState("");
  const [cabinType, setCabinType] = useState<Cabin["type"]>("cabin");
  const [building, setBuilding] = useState<Cabin["building"]>("Main HQ");
  const [floor, setFloor] = useState<Cabin["floor"]>("1st Floor");
  const [capacity, setCapacity] = useState(4);
  const [facilities, setFacilities] = useState<Cabin["facilities"]>(["TV", "Whiteboard"]);
  const [dept, setDept] = useState<Cabin["department"]>("None");
  const [mapX, setMapX] = useState(25);
  const [mapY, setMapY] = useState(25);
  const [mapW, setMapW] = useState(15);
  const [mapH, setMapH] = useState(15);

  const availableFacilities: Cabin["facilities"] = [
    "Projector",
    "TV",
    "Whiteboard",
    "Video Conference",
    "Audio System"
  ];

  const handleFacilityChange = (fac: Cabin["facilities"][number]) => {
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
    setFacilities(["TV", "Whiteboard"]);
    setDept("None");
    setMapX(40);
    setMapY(40);
    setMapW(15);
    setMapH(15);
    setShowCabinModal(true);
  };

  const handleOpenEdit = (cabin: Cabin) => {
    setEditingCabin(cabin);
    setCabinName(cabin.name);
    setCabinType(cabin.type);
    setBuilding(cabin.building);
    setFloor(cabin.floor);
    setCapacity(cabin.capacity);
    setFacilities(cabin.facilities);
    setDept(cabin.department || "None");
    setMapX(cabin.x);
    setMapY(cabin.y);
    setMapW(cabin.w);
    setMapH(cabin.h);
    setShowCabinModal(true);
  };

  const handleCabinFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabinName.trim()) return;

    const cabinData = {
      name: cabinName,
      type: cabinType,
      building,
      floor,
      capacity,
      facilities,
      status: (editingCabin ? editingCabin.status : "available") as Cabin["status"],
      department: dept,
      x: Number(mapX),
      y: Number(mapY),
      w: Number(mapW),
      h: Number(mapH)
    };

    if (editingCabin) {
      editCabin({ ...cabinData, id: editingCabin.id });
    } else {
      addCabin(cabinData);
    }
    setShowCabinModal(false);
  };

  // CSV Exporter Simulation
  const handleExportCSV = (type: "excel" | "pdf") => {
    // Generate simple CSV content of bookings
    const headers = "Booking ID,Room,User,Date,Start,End,Attendees,Purpose,Department,Status\n";
    const rows = bookings.map(b => {
      const cabin = cabins.find(c => c.id === b.cabinId);
      return `"${b.id}","${cabin?.name || 'Deleted'}","${b.userName}","${b.date}","${b.startTime}","${b.endTime}",${b.attendees},"${b.purpose}","${b.department}","${b.status}"`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `cospace_booking_report_${Date.now()}.${type === "excel" ? "csv" : "txt"}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Admin sub navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab("cabins")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeSubTab === "cabins" 
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Manage Cabins
        </button>
        <button
          onClick={() => setActiveSubTab("reports")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeSubTab === "reports" 
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Reports & History
        </button>
        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeSubTab === "users" 
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          User Directories
        </button>
      </div>

      {/* SUB TAB: CABINS VIEW */}
      {activeSubTab === "cabins" && (
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
            <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Room Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Facilities</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cabins.map((cabin) => (
                  <tr key={cabin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{cabin.name}</td>
                    <td className="p-3 capitalize">{cabin.type}</td>
                    <td className="p-3 font-semibold">{cabin.building} • Floor {cabin.floor.split(" ")[0]}</td>
                    <td className="p-3 font-bold">{cabin.capacity} seats</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {cabin.facilities.map((f, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded dark:bg-slate-800 dark:text-slate-400 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cabin.status === 'available' ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        cabin.status === 'maintenance' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                        cabin.status === 'reserved' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {cabin.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => toggleCabinMaintenance(cabin.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          cabin.status === "maintenance" 
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
                        onClick={() => deleteCabin(cabin.id)}
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                        title="Delete cabin"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB: REPORTS & HISTORY VIEW */}
      {activeSubTab === "reports" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">System Utilization Reports</h3>
              <p className="text-xs text-slate-400 mt-0.5">Booking logs and statistics logs</p>
            </div>
            
            {/* Export buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExportCSV("excel")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-semibold dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-350 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <span>Export CSV Excel</span>
              </button>
              <button
                onClick={() => handleExportCSV("pdf")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-semibold dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-350 transition-colors"
              >
                <FileText size={14} className="text-blue-500" />
                <span>Export PDF Log</span>
              </button>
            </div>
          </div>

          {/* Booking History Logs Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
            <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Room</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Host</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => {
                  const cabin = cabins.find(c => c.id === b.cabinId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/20 transition-colors">
                      <td className="p-3 font-semibold text-slate-850 dark:text-slate-200">{cabin?.name || "Deleted Cabin"}</td>
                      <td className="p-3 font-bold">{b.purpose}</td>
                      <td className="p-3">{b.userName}</td>
                      <td className="p-3 font-mono">{b.date}</td>
                      <td className="p-3 font-semibold">{b.startTime} - {b.endTime}</td>
                      <td className="p-3 uppercase">{b.department}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'checked-in' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          b.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB: USERS LIST VIEW */}
      {activeSubTab === "users" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Users size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Active Employee Directory</h3>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
            <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">ID Code</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                    </td>
                    <td className="p-3 font-mono">{user.empId}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 uppercase">{user.department}</td>
                    <td className="p-3 text-right font-bold uppercase">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <option value="Main HQ">Main HQ</option>
                    <option value="West Wing">West Wing</option>
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
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Executive">Executive</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              {/* Interactive Floor map positions percentages */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 space-y-2 border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Interactive Floor Map Coordinates (%)</p>
                <div className="grid grid-cols-4 gap-2.5 font-normal text-xs">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">X Position</label>
                    <input type="number" min="0" max="100" value={mapX} onChange={(e) => setMapX(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">Y Position</label>
                    <input type="number" min="0" max="100" value={mapY} onChange={(e) => setMapY(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">Width</label>
                    <input type="number" min="5" max="50" value={mapW} onChange={(e) => setMapW(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-500">Height</label>
                    <input type="number" min="5" max="50" value={mapH} onChange={(e) => setMapH(Number(e.target.value))} className="w-full p-1.5 border border-slate-250 bg-white rounded dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" />
                  </div>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">Cabin Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-normal">
                  {availableFacilities.map((fac) => {
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
              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {editingCabin ? "Save Updates" : "Create Cabin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
