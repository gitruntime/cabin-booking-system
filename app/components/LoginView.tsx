"use client";

import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { Building, ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginView() {
  const { login } = useBooking();
  const [emailOrId, setEmailOrId] = useState("alex.rivera@enterprise.com");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate network delay
    setTimeout(() => {
      const success = login(emailOrId);
      setLoading(false);
      if (!success) {
        setError("Invalid credentials. Try: alex.rivera@enterprise.com or EMP-4920");
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Left side: Form (Glass Card on Dark background for mobile, or Clean panel on Desktop) */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 md:px-12 lg:flex-initial lg:w-[500px] bg-white dark:bg-slate-900 shadow-xl border-r border-slate-100 dark:border-slate-800/50 z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">CoSpace Systems</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Workspace Navigator</p>
            </div>
          </div>

          {/* Titles */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Log in to book cabins, rooms, and check real-time map schedules.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Display errors */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email / Emp ID input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="email">
                Employee Login (Email or ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="text"
                  placeholder="name@enterprise.com or EMP-XXXX"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-blue-600 hover:text-blue-500 font-semibold dark:text-blue-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-850"
              />
              <label htmlFor="remember" className="ml-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer selection:bg-transparent">
                Remember this device for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{loading ? "Verifying..." : "Sign In"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick-Help Hint */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/30 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Demo Login Accounts</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <p>• Admin: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold select-all">alex.rivera@enterprise.com</span> (or <span className="font-mono font-bold select-all text-blue-600 dark:text-blue-400">EMP-4920</span>)</p>
              <p>• User: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold select-all">sarah.chen@enterprise.com</span> (or <span className="font-mono font-bold select-all text-blue-600 dark:text-blue-400">EMP-3829</span>)</p>
              <p>• Password: <span className="italic">anything</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Modern Office Vector Illustration with Soft Gradients */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 overflow-hidden items-center justify-center">
        
        {/* Soft Background Gradients Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full filter blur-[100px] animate-pulse-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full filter blur-[80px]" />

        {/* Vector SVG Office Illustration */}
        <div className="w-[500px] h-[500px] relative animate-float">
          <svg viewBox="0 0 500 500" fill="none" className="w-full h-full drop-shadow-2xl">
            {/* Grid layout */}
            <path d="M 50,400 L 450,400" stroke="#1e293b" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M 50,200 L 450,200" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Building 3D Abstract Box */}
            <rect x="120" y="80" width="260" height="320" rx="20" fill="url(#buildingGrad)" stroke="#1e40af" strokeWidth="2" opacity="0.85" />
            
            {/* Glass window lines */}
            <rect x="150" y="120" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="290" y="120" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            
            <rect x="150" y="200" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="290" y="200" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            
            <rect x="150" y="280" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="290" y="280" width="60" height="50" rx="8" fill="#1d4ed8" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            
            {/* Giant Glass Meeting Room Overlay */}
            <rect x="80" y="170" width="340" height="150" rx="16" fill="url(#meetingRoomGrad)" stroke="#60a5fa" strokeWidth="2" fillOpacity="0.3" className="backdrop-blur-sm" />
            
            {/* Conference Table inside Glass Room */}
            <ellipse cx="250" cy="270" rx="110" ry="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
            
            {/* People dots/seats around the table */}
            <circle cx="160" cy="262" r="7" fill="#60a5fa" />
            <circle cx="210" cy="254" r="7" fill="#60a5fa" />
            <circle cx="250" cy="252" r="7" fill="#93c5fd" />
            <circle cx="290" cy="254" r="7" fill="#60a5fa" />
            <circle cx="340" cy="262" r="7" fill="#60a5fa" />
            
            <circle cx="180" cy="282" r="7" fill="#3b82f6" />
            <circle cx="250" cy="288" r="7" fill="#2563eb" />
            <circle cx="320" cy="282" r="7" fill="#3b82f6" />

            {/* Glowing UI Dashboards Hovering around */}
            <g transform="translate(40, 100)">
              <rect x="0" y="0" width="100" height="50" rx="8" fill="#0f172a" fillOpacity="0.75" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="6" fill="#10b981" />
              <rect x="32" y="12" width="50" height="4" rx="2" fill="#cbd5e1" />
              <rect x="32" y="22" width="35" height="4" rx="2" fill="#64748b" />
              <rect x="12" y="34" width="70" height="3" rx="1.5" fill="#334155" />
            </g>

            <g transform="translate(360, 270)">
              <rect x="0" y="0" width="100" height="55" rx="8" fill="#0f172a" fillOpacity="0.75" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="8" fill="#3b82f6" fillOpacity="0.2" />
              <path d="M 16,20 L 24,20 M 20,16 L 20,24" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="38" y="15" width="45" height="4" rx="2" fill="#cbd5e1" />
              <rect x="38" y="25" width="30" height="4" rx="2" fill="#64748b" />
              <rect x="12" y="38" width="75" height="4" rx="2" fill="#ef4444" />
            </g>

            {/* Gradients definition */}
            <defs>
              <linearGradient id="buildingGrad" x1="120" y1="80" x2="380" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="meetingRoomGrad" x1="80" y1="170" x2="420" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Text Overlay */}
        <div className="absolute bottom-16 text-center max-w-sm space-y-2">
          <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">Enterprise Booking Engine</p>
          <h3 className="text-xl font-bold text-white">Streamline Room Allocation</h3>
          <p className="text-xs text-slate-400 leading-normal px-6">
            Real-time visual mappings, intelligent conflict prevention, and smart team recommendation workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
