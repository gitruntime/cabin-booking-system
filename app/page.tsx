"use client";

import React from "react";
import { BookingProvider, useBooking } from "./context/BookingContext";
import LoginView from "./components/LoginView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import BookingView from "./components/BookingView";
import FloorMapView from "./components/FloorMapView";
import CalendarView from "./components/CalendarView";
import MyBookingsView from "./components/MyBookingsView";
import NotificationsPanel from "./components/NotificationsPanel";
import ProfileView from "./components/ProfileView";
import AdminView from "./components/AdminView";

function MainAppShell() {
  const { isAuthenticated, currentTab } = useBooking();

  // If not logged in, show login page
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Render active view dynamically based on tab selection
  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardView />;
      case "book-cabin":
        return <BookingView />;
      case "office-map":
        return <FloorMapView />;
      case "calendar":
        return <CalendarView />;
      case "my-bookings":
        return <MyBookingsView />;
      case "notifications":
        return <NotificationsPanel />;
      case "profile":
        return <ProfileView />;
      case "admin-panel":
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Breadcrumbs, digital clock, quick user-switching */}
        <Header />

        {/* Dynamic Inner Tab View */}
        <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <BookingProvider>
      <MainAppShell />
    </BookingProvider>
  );
}
