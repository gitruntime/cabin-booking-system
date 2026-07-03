"use client";

import {
  AlertCircle,
  Camera,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  UserCircle,
  UserPlus,
  Users,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Cabin, useBooking } from "../../context/BookingContext";
import { deleteUser, listOfUsers, register, updateUser } from "../../http";

export default function UsersList() {
  const {
    currentUser,
  } = useBooking();
  const [usersList, setUsersList] = useState<any>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await listOfUsers();
        setUsersList(response.data);
        setLoadingUsers(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [showAddUserModal, showEditUserModal]);



  // Add User Modal
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserDept, setNewUserDept] = useState("IT");
  const [newUserGender, setNewUserGender] = useState("male");
  const [newUserDesignation, setNewUserDesignation] = useState("");
  const [newUserAvatar, setNewUserAvatar] = useState<File | null>(null);

  const handleOpenAddUser = () => {
    setNewUserName(""); setNewUserEmail(""); setNewUserPhone("");
    setNewUserPassword(""); setNewUserDept("IT"); setNewUserGender("male");
    setNewUserDesignation(""); setNewUserAvatar(null); setAvatarPreview(null);
    setAddUserError(""); setShowPassword(false);
    setShowAddUserModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewUserAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Delete User Modal
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const handleOpenDeleteUser = (user: any) => {
    setDeletingUser(user);
    setShowDeleteUserModal(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    setDeleteUserLoading(true);
    try {
      const response = await deleteUser(deletingUser._id);
      toast.success(response?.data?.message || "User deleted successfully!");
      setShowDeleteUserModal(false);
      setDeletingUser(null);
      // Refresh users list
      const res = await listOfUsers();
      setUsersList(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);

  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserDept, setEditUserDept] = useState("IT");
  const [editUserGender, setEditUserGender] = useState("male");
  const [editUserDesignation, setEditUserDesignation] = useState("");
  const [editUserAvatar, setEditUserAvatar] = useState<File | null>(null);

  const handleOpenEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserName(user.name || "");
    setEditUserEmail(user.email || "");
    setEditUserPhone(user.phone || "");
    setEditUserPassword("");
    setEditUserDept(user.department || "IT");
    setEditUserGender(user.gender || "male");
    setEditUserDesignation(user.designation || "");
    setEditUserAvatar(null);
    setEditAvatarPreview(user.avatar || null);
    setEditUserError(""); setEditShowPassword(false);
    setShowEditUserModal(true);
  };

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUserAvatar(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserError("");
    setEditUserLoading(true);
    try {
      const response = await updateUser(editingUser._id, {
        name: editUserName,
        email: editUserEmail,
        phone: editUserPhone,
        department: editUserDept,
        gender: editUserGender,
        designation: editUserDesignation,
        password: editUserPassword,
        avatar: editUserAvatar
      });
      toast.success(response?.data?.message || "User updated successfully!");
      setShowEditUserModal(false);
    } catch (err: any) {
      setEditUserError(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError("");
    setAddUserLoading(true);
    try {
      const response = await register({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        password: newUserPassword,
        department: newUserDept,
        designation: newUserDesignation,
        gender: newUserGender,
        avatar: newUserAvatar
      });
      toast.success(response?.data?.message || "User created successfully!");
      setShowAddUserModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setAddUserLoading(false);
    }
  };
  // Cabin Form Dialog
  const [showCabinModal, setShowCabinModal] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);




  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <>
        <div className="flex justify-end items-start sm:items-center gap-4 pb-2">
          <button
            onClick={handleOpenAddUser}
            className="flex gap-2 items-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs w-full sm:w-fit justify-center sm:justify-start"
          >
            <UserPlus size={18} className="text-white" />
            Add New User
          </button>
        </div>
        {

          loadingUsers ?
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
              loading users...
            </div>
            :
            <div className="p-5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Users size={18} className="text-slate-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">List of Users {usersList.count > 0 && `(${usersList.count})`}</h3>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60">
                <table className="w-full text-left border-collapse text-xs font-medium text-slate-650 dark:text-slate-350">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">System Role</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usersList?.users?.length > 0 ?
                      usersList.users.map((user: any, index: number) => {
                        return <tr key={index}>
                          <td className="p-3 flex items-center gap-2.5">
                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" /> : <UserCircle size={28} className="text-slate-400 dark:text-slate-500" />}
                            <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                          </td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3 uppercase">{user.department}</td>
                          <td className="p-3 text-right font-bold uppercase">{user.role}</td>
                          {currentUser?._id !== user._id && (
                            <td className="p-3 text-right space-x-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                title="Edit user details"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteUser(user)}
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                                title="Delete user"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>)}
                        </tr>;
                      }) : (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-500 dark:text-slate-400">
                            No users found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
        }
      </>

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Trash2 size={16} className="text-red-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete User</h3>
              </div>
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              {deletingUser.avatar
                ? <img src={deletingUser.avatar} alt={deletingUser.name} className="w-14 h-14 rounded-full object-cover" />
                : <UserCircle size={56} className="text-slate-300 dark:text-slate-600" />
              }
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold">{deletingUser.name}</span>?
              </p>
              <p className="text-xs text-slate-400">This action cannot be undone.</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                disabled={deleteUserLoading}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUserConfirm}
                disabled={deleteUserLoading}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition-colors"
              >
                {deleteUserLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Register New User</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-semibold">

              {/* Error */}
              {addUserError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px] font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative group w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 flex items-center justify-center overflow-hidden transition-colors bg-slate-50 dark:bg-slate-800"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={40} className="text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={18} className="text-white" />
                  </div>
                </button>
                <span className="text-[10px] text-slate-400 font-medium">Click to upload profile photo</span>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Designation <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Engineer"
                    value={newUserDesignation}
                    onChange={(e) => setNewUserDesignation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="user@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Mobile Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 234 567 8900"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-9 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Department & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive">Executive</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Gender</label>
                  <div className="flex gap-2 pt-0.5">
                    {["male", "female", "other"].map((g) => (
                      <label
                        key={g}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border cursor-pointer text-[11px] font-semibold capitalize transition-all ${newUserGender === g
                          ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800"
                          }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={newUserGender === g}
                          onChange={() => setNewUserGender(g)}
                          className="hidden"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={addUserLoading}
                className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {addUserLoading ? "Creating User..." : "Create User Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Edit User: {editingUser.name}</h3>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs font-semibold">

              {/* Error */}
              {editUserError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px] font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editUserError}</span>
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => editAvatarInputRef.current?.click()}
                  className="relative group w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 flex items-center justify-center overflow-hidden transition-colors bg-slate-50 dark:bg-slate-800"
                >
                  {editAvatarPreview ? (
                    <img src={editAvatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={40} className="text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={18} className="text-white" />
                  </div>
                </button>
                <span className="text-[10px] text-slate-400 font-medium">Click to change profile photo</span>
                <input
                  ref={editAvatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditAvatarChange}
                />
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Designation <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Engineer"
                    value={editUserDesignation}
                    onChange={(e) => setEditUserDesignation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* New Password (optional) */}
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
                <div className="relative">
                  <input
                    type={editShowPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-9 rounded-lg border border-slate-200 bg-slate-50 font-normal outline-none focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {editShowPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Department & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Department</label>
                  <select
                    value={editUserDept}
                    onChange={(e) => setEditUserDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive">Executive</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">Gender</label>
                  <div className="flex gap-2 pt-0.5">
                    {["male", "female", "other"].map((g) => (
                      <label
                        key={g}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border cursor-pointer text-[11px] font-semibold capitalize transition-all ${editUserGender === g
                            ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800"
                          }`}
                      >
                        <input
                          type="radio"
                          name="edit-gender"
                          value={g}
                          checked={editUserGender === g}
                          onChange={() => setEditUserGender(g)}
                          className="hidden"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={editUserLoading}
                className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold transition-colors shadow-md shadow-blue-500/10"
              >
                {editUserLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
