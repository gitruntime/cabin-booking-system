"use client";

import {
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";

export default function History() {
  const {
    cabins,
    bookings,
  } = useBooking();





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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'checked-in' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
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
    </div>
  );
}
