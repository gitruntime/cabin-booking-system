"use client";

import { DepartmentType } from "@/app/Types/Booking";
import { useBooking } from "@/app/context/BookingContext";
import { Briefcase, Edit3, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
    createDepartment,
    deleteDepartment,
    updateDepartment
} from "../../http";

export default function Departments() {
    const { departments, loadingDepartments, fetchDepartments, setLoadingDepartments } = useBooking();
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<DepartmentType | null>(null);
    const [deptName, setDeptName] = useState("");
    const [deptOrder, setDeptOrder] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // Delete Confirmation State
    const [deptToDelete, setDeptToDelete] = useState<DepartmentType | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleOpenAdd = () => {
        setEditingDept(null);
        setDeptName("");
        // Default order to next available order
        const nextOrder = departments.length > 0 ? Math.max(...departments.map(d => d.order)) + 1 : 1;
        setDeptOrder(nextOrder);
        setShowModal(true);
    };

    const handleOpenEdit = (dept: DepartmentType) => {
        setEditingDept(dept);
        setDeptName(dept.name);
        setDeptOrder(dept.order);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptName.trim()) {
            toast.error("Department name is required.");
            return;
        }
        setSubmitting(true);
        try {
            if (editingDept) {
                // Update
                const res = await updateDepartment(editingDept._id, {
                    name: deptName.trim(),
                    order: Number(deptOrder),
                });
                toast.success(res?.data?.message || "Department updated successfully!");
            } else {
                // Create
                const res = await createDepartment({
                    name: deptName.trim(),
                    order: Number(deptOrder),
                });
                toast.success(res?.data?.message || "Department created successfully!");
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save department.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deptToDelete) return;
        setDeleting(true);
        try {
            const res = await deleteDepartment(deptToDelete._id);
            toast.success(res?.data?.message || "Department deleted successfully!");
            setDeptToDelete(null);
            fetchDepartments();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete department.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">System Departments Setup</h3>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                        <Plus size={14} />
                        <span>Add Department</span>
                    </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
                    {loadingDepartments ? (
                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                            Loading departments...
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                            No departments found. Add a department to get started.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-3">Department Name</th>
                                    <th className="p-3">Display Order</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {departments.map((dept, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{dept.name}</td>
                                        <td className="p-3 font-semibold">{dept.order}</td>
                                        <td className="p-3 text-right space-x-1.5 shrink-0">
                                            <button
                                                onClick={() => handleOpenEdit(dept)}
                                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                                title="Edit department"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                onClick={() => setDeptToDelete(dept)}
                                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-55 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-955/20"
                                                title="Delete department"
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

            {/* Add / Update Department Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-enter">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                {editingDept ? `Edit Department: ${editingDept.name}` : "Add New Department"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1">
                                <label className="text-slate-650 dark:text-slate-400">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="E.g., Engineering"
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-slate-650 dark:text-slate-400">Display Order</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={deptOrder}
                                    onChange={(e) => setDeptOrder(parseInt(e.target.value) || 0)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-md shadow-blue-500/10"
                            >
                                {submitting ? "Saving…" : editingDept ? "Save Updates" : "Create Department"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deptToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-enter">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Department</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-300 font-medium">
                            Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">{deptToDelete.name}</span>?
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setDeptToDelete(null)}
                                disabled={deleting}
                                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
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
        </div>
    );
}
