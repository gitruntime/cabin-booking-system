"use client";

import {
  AlertTriangle,
  Bell,
  BookmarkCheck,
  Building,
  Calendar,
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { logoutUser } from "../http";

export default function Sidebar() {
  const { currentTab, setCurrentTab, theme, setTheme, logout, notifications, currentUser } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "book-cabin", label: "Book Cabin", icon: CalendarRange },
    { id: "office-map", label: "Office Map", icon: Map },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "my-bookings", label: "My Bookings", icon: BookmarkCheck },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  // Show Admin view only to admin
  const adminItems = [
    { id: "admin-panel", label: "Admin Panel", icon: Settings },
    { id: "users", label: "Users", icon: Users },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setLoadingSignOut(true);
    try {
      const response = await logoutUser();
      if (response.status === 200) {
        setLogoutConfirm(false);
        logout();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoadingSignOut(false);
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md text-slate-800 dark:bg-slate-800 dark:text-slate-200 md:hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 md:translate-x-0 md:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Branding header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20">
            <Building size={20} className="animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white leading-tight">CoSpace</h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">Enterprise Suite</span>
          </div>
        </div>

        {/* 
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full border border-blue-100 dark:border-blue-900 object-cover" 
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">{currentUser.email}</p>
            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
              currentUser.role === 'admin' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {currentUser.role}
            </span>
          </div>
        </div> */}

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                  ${isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"}
                `}
              >
                <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500"} />
                <span>{item.label}</span>

                {/* Notification badge */}
                {item.badge && item.badge > 0 ? (
                  <span className="ml-auto flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                    {item.badge}
                  </span>
                ) : null}

                {/* Left active line indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}

          {/* Admin Section Divider */}
          {currentUser && currentUser?.role === "admin" && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Management</p>
              {adminItems.map((adminItem: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleNav(adminItem.id)}
                  className={`
                    flex w-full items-center mt-1 gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                    ${currentTab === adminItem.id
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"}
                `}
                >
                  <adminItem.icon size={18} className={currentTab === adminItem.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"} />
                  <span>{adminItem.label}</span>
                  {currentTab === adminItem.id && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer actions: Theme and Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Light/Dark Toggle */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "light"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "dark"
                ? "bg-slate-700 text-blue-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-200"
                }`}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setLogoutConfirm(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl p-5 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Sign Out?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Are you sure you want to sign out of your account?
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogout();
                }}
                disabled={loadingSignOut}
                className={`flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors ${loadingSignOut ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loadingSignOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
