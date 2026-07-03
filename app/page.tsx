"use client";

import { useEffect, useState } from "react";
import AdminView from "./components/Admin/AdminView";
import BookingView from "./components/BookingView";
import CalendarView from "./components/CalendarView";
import DashboardView from "./components/DashboardView";
import FloorMapView from "./components/FloorMapView";
import Header from "./components/Header";
import LoginView from "./components/LoginView";
import MyBookingsView from "./components/MyBookingsView";
import NotificationsPanel from "./components/NotificationsPanel";
import ProfileView from "./components/ProfileView";
import Sidebar from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";
import { BookingProvider, useBooking } from "./context/BookingContext";
import { profile } from "./http";
import UsersList from "./components/Admin/UsersList";

function MainAppShell() {
  const { isAuthenticated, currentTab, setIsAuthenticated, setCurrentUser } = useBooking();
  const [spalshVisible, setSplashVisible] = useState(true);

  const checkAuthentication = async () => {
    try {
      const response = await profile();
      if (response?.status === 200) {
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        setSplashVisible(false);
      }
    } catch (error) {
      setSplashVisible(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (spalshVisible) {
    return <SplashScreen fadeOut={!spalshVisible} />;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

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
      case "users":
        return <UsersList />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
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
