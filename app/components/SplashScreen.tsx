"use client";

import React, { useEffect, useState } from "react";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)" }}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: 500,
            height: 500,
            top: -120,
            right: -120,
            background: "white",
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: 300,
            height: 300,
            bottom: -80,
            left: -80,
            background: "white",
          }}
        />
      </div>

      {/* Logo / Icon */}
      <div className="relative mb-6 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-2xl shadow-2xl"
          style={{ width: 96, height: 96, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          {/* Cabin SVG icon */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Roof */}
            <polygon points="4,28 28,6 52,28" fill="white" opacity="0.95" />
            {/* Walls */}
            <rect x="10" y="28" width="36" height="20" rx="2" fill="white" opacity="0.85" />
            {/* Door */}
            <rect x="22" y="36" width="12" height="12" rx="2" fill="#2563eb" />
            {/* Window left */}
            <rect x="13" y="31" width="8" height="7" rx="1" fill="#93c5fd" />
            {/* Window right */}
            <rect x="35" y="31" width="8" height="7" rx="1" fill="#93c5fd" />
            {/* Chimney */}
            <rect x="36" y="12" width="6" height="12" rx="1" fill="white" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-white font-bold tracking-wide mb-1" style={{ fontSize: 28 }}>
        CabinBook
      </h1>
      <p className="text-blue-200 text-sm mb-10 tracking-widest uppercase">
        Workspace Reservation System
      </p>

      {/* Loading dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full bg-white"
            style={{
              width: 8,
              height: 8,
              opacity: 0.7,
              animation: `bounce 1.2s ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

