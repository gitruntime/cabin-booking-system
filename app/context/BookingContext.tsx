"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserList } from "../Types/User";

// Types
export interface Cabin {
  id: string;
  name: string;
  type: string;
  building: any;
  floor: any;
  capacity: number;
  facilities: any[];
  status: any;
  department?: string
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Booking {
  id: string;
  cabinId: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  attendees: number;
  purpose: string;
  department: "HR" | "Finance" | "Executive" | "IT" | "Marketing" | "Sales";
  status: "confirmed" | "cancelled" | "checked-in";
  createdTime: string;
}

export interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "alert";
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  read: boolean;
}

interface BookingContextType {
  userList: UserList;
  setUserList: (list: UserList) => void;



  cabins: Cabin[];
  bookings: Booking[];
  currentUser: any;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentTab: string;
  theme: "light" | "dark";





  notifications: NotificationItem[];
  selectedBuilding: "Main HQ" | "West Wing";
  selectedFloor: "Ground Floor" | "1st Floor" | "2nd Floor";
  setCurrentTab: (tab: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSelectedBuilding: (b: "Main HQ" | "West Wing") => void;
  setSelectedFloor: (f: "Ground Floor" | "1st Floor" | "2nd Floor") => void;
  setCurrentUser: (u: any) => void;

  // Actions
  login: (emailOrEmpId: string) => boolean;
  logout: () => void;
  addBooking: (booking: Omit<Booking, "id" | "userName" | "createdTime" | "status">) => { success: boolean; error?: string };
  cancelBooking: (id: string) => void;
  checkInBooking: (id: string) => void;
  editBooking: (id: string, updated: Partial<Booking>) => { success: boolean; error?: string };

  // Admin Operations
  addCabin: (cabin: Omit<Cabin, "id">) => void;
  editCabin: (cabin: Cabin) => void;
  deleteCabin: (id: string) => void;
  toggleCabinMaintenance: (id: string) => void;

  // Helpers
  checkAvailability: (cabinId: string, date: string, start: string, end: string) => "available" | "occupied" | "reserved" | "maintenance";
  detectConflicts: (cabinId: string, date: string, start: string, end: string, ignoreBookingId?: string) => Booking[];
  getAIRecommendations: (capacity: number, facilities: string[], date: string, start: string, end: string) => Cabin[];
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialCabins: Cabin[] = [
  // Ground Floor
  { id: "c1", name: "CEO Executive Suite", type: "boardroom", building: "Main HQ", floor: "Ground Floor", capacity: 8, facilities: ["TV", "Video Conference", "Audio System", "Whiteboard"], status: "available", department: "Executive", x: 8, y: 12, w: 24, h: 20 },
  { id: "c2", name: "Executive Board Room", type: "boardroom", building: "Main HQ", floor: "Ground Floor", capacity: 20, facilities: ["Projector", "TV", "Whiteboard", "Video Conference", "Audio System"], status: "occupied", department: "Executive", x: 36, y: 12, w: 32, h: 20 },
  { id: "c3", name: "Finance Cabin 1", type: "cabin", building: "Main HQ", floor: "Ground Floor", capacity: 4, facilities: ["TV", "Whiteboard"], status: "available", department: "Finance", x: 72, y: 12, w: 20, h: 20 },
  { id: "c4", name: "Finance Cabin 2", type: "cabin", building: "Main HQ", floor: "Ground Floor", capacity: 4, facilities: ["TV", "Whiteboard"], status: "available", department: "Finance", x: 72, y: 38, w: 20, h: 16 },

  // 1st Floor
  { id: "c5", name: "HR Interview Room A", type: "meeting", building: "Main HQ", floor: "1st Floor", capacity: 6, facilities: ["TV", "Whiteboard"], status: "available", department: "HR", x: 8, y: 12, w: 22, h: 18 },
  { id: "c6", name: "HR Interview Room B", type: "meeting", building: "Main HQ", floor: "1st Floor", capacity: 6, facilities: ["TV", "Whiteboard"], status: "reserved", department: "HR", x: 8, y: 35, w: 22, h: 18 },
  { id: "c7", name: "IT Scrum Room Alpha", type: "conference", building: "Main HQ", floor: "1st Floor", capacity: 12, facilities: ["TV", "Whiteboard", "Video Conference"], status: "available", department: "IT", x: 34, y: 12, w: 30, h: 22 },
  { id: "c8", name: "IT Huddle Room 1", type: "meeting", building: "Main HQ", floor: "1st Floor", capacity: 4, facilities: ["TV", "Whiteboard"], status: "available", department: "IT", x: 68, y: 12, w: 14, h: 16 },
  { id: "c9", name: "IT Huddle Room 2", type: "meeting", building: "Main HQ", floor: "1st Floor", capacity: 4, facilities: ["TV", "Whiteboard"], status: "maintenance", department: "IT", x: 84, y: 12, w: 12, h: 16 },
  { id: "c10", name: "Open Quiet Pod 1", type: "pod", building: "Main HQ", floor: "1st Floor", capacity: 2, facilities: ["Audio System"], status: "available", department: "None", x: 68, y: 34, w: 12, h: 14 },
  { id: "c11", name: "Open Quiet Pod 2", type: "pod", building: "Main HQ", floor: "1st Floor", capacity: 2, facilities: ["Audio System"], status: "available", department: "None", x: 82, y: 34, w: 12, h: 14 },

  // 2nd Floor
  { id: "c12", name: "Marketing Creative Studio", type: "conference", building: "Main HQ", floor: "2nd Floor", capacity: 15, facilities: ["Projector", "TV", "Whiteboard", "Audio System"], status: "available", department: "Marketing", x: 8, y: 12, w: 28, h: 22 },
  { id: "c13", name: "Sales Call Cabin A", type: "cabin", building: "Main HQ", floor: "2nd Floor", capacity: 3, facilities: ["TV"], status: "available", department: "Sales", x: 40, y: 12, w: 16, h: 16 },
  { id: "c14", name: "Sales Call Cabin B", type: "cabin", building: "Main HQ", floor: "2nd Floor", capacity: 3, facilities: ["TV"], status: "available", department: "Sales", x: 58, y: 12, w: 16, h: 16 },
  { id: "c15", name: "Central Conference Hall", type: "boardroom", building: "Main HQ", floor: "2nd Floor", capacity: 25, facilities: ["Projector", "TV", "Whiteboard", "Video Conference", "Audio System"], status: "available", department: "None", x: 8, y: 40, w: 48, h: 24 },

  // West Wing - Floor 1
  { id: "c16", name: "West Wing Meeting Room 101", type: "meeting", building: "West Wing", floor: "1st Floor", capacity: 8, facilities: ["TV", "Whiteboard"], status: "available", department: "None", x: 10, y: 15, w: 25, h: 20 },
  { id: "c17", name: "West Wing Huddle Room A", type: "meeting", building: "West Wing", floor: "1st Floor", capacity: 5, facilities: ["Whiteboard"], status: "available", department: "None", x: 40, y: 15, w: 20, h: 20 },
  { id: "c18", name: "West Wing Board Room", type: "boardroom", building: "West Wing", floor: "1st Floor", capacity: 14, facilities: ["Projector", "TV", "Whiteboard", "Video Conference"], status: "available", department: "None", x: 65, y: 15, w: 30, h: 22 }
];

// Seeded bookings for today (2026-07-01). The current simulated time is 13:43.
const initialBookings: Booking[] = [
  {
    id: "b1",
    cabinId: "c2", // Executive Board Room
    userId: "u1",
    userName: "Alex Rivera",
    date: "2026-07-01",
    startTime: "13:00",
    endTime: "15:30",
    duration: 150,
    attendees: 12,
    purpose: "Quarterly Executive Planning",
    department: "Executive",
    status: "checked-in", // Currently active and checked in!
    createdTime: "2026-06-30T10:00:00Z"
  },
  {
    id: "b2",
    cabinId: "c6", // HR Interview Room B
    userId: "u3",
    userName: "Marcus Vance",
    date: "2026-07-01",
    startTime: "14:00",
    endTime: "15:00",
    duration: 60,
    attendees: 3,
    purpose: "Software Engineer Technical Interview",
    department: "HR",
    status: "confirmed", // Starts in 17 minutes! So status is "Reserved Soon"
    createdTime: "2026-07-01T09:15:00Z"
  },
  {
    id: "b3",
    cabinId: "c7", // IT Scrum Room Alpha
    userId: "u1",
    userName: "Alex Rivera",
    date: "2026-07-01",
    startTime: "10:00",
    endTime: "11:30",
    duration: 90,
    attendees: 10,
    purpose: "Sprint Grooming & Retrospective",
    department: "IT",
    status: "confirmed", // Past booking for today
    createdTime: "2026-06-29T14:00:00Z"
  },
  {
    id: "b4",
    cabinId: "c3", // Finance Cabin 1
    userId: "u2",
    userName: "Sarah Chen",
    date: "2026-07-01",
    startTime: "15:00",
    endTime: "16:00",
    duration: 60,
    attendees: 4,
    purpose: "Auditing Walkthrough",
    department: "Finance",
    status: "confirmed",
    createdTime: "2026-07-01T08:30:00Z"
  },
  {
    id: "b5",
    cabinId: "c1", // CEO Executive Suite
    userId: "u1",
    userName: "Alex Rivera",
    date: "2026-07-02", // Tomorrow
    startTime: "09:30",
    endTime: "11:00",
    duration: 90,
    attendees: 6,
    purpose: "Board of Directors Briefing",
    department: "Executive",
    status: "confirmed",
    createdTime: "2026-07-01T11:00:00Z"
  },
  {
    id: "b6",
    cabinId: "c12", // Marketing Creative Studio
    userId: "u2",
    userName: "Sarah Chen",
    date: "2026-07-02", // Tomorrow
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    attendees: 8,
    purpose: "Product Launch Brand Review",
    department: "Marketing",
    status: "confirmed",
    createdTime: "2026-07-01T12:00:00Z"
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "success",
    title: "Booking Confirmed",
    message: "You have successfully booked CEO Executive Suite for tomorrow at 09:30 AM.",
    time: "2 hrs ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false
  },
  {
    id: "n2",
    type: "info",
    title: "Checked In",
    message: "Alex Rivera checked in to Executive Board Room for 'Quarterly Executive Planning'.",
    time: "43 mins ago",
    timestamp: new Date(Date.now() - 43 * 60 * 1000),
    read: false
  },
  {
    id: "n3",
    type: "warning",
    title: "Upcoming Meeting Reminder",
    message: "Your meeting 'Software Engineer Technical Interview' in HR Interview Room B starts in 17 minutes.",
    time: "3 mins ago",
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    read: true
  }
];

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userList, setUserList] = useState<UserList>({ users: [], count: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [selectedBuilding, setSelectedBuilding] = useState<"Main HQ" | "West Wing">("Main HQ");
  const [selectedFloor, setSelectedFloor] = useState<"Ground Floor" | "1st Floor" | "2nd Floor">("1st Floor");

  // Databases states
  const [cabins, setCabins] = useState<Cabin[]>(initialCabins);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Fetch system theme or handle mounting
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    }

    const loggedIn = localStorage.getItem("is_auth");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Real-time Availability calculations (simulated client check)
  // Check room status for a specific datetime
  const checkAvailability = (cabinId: string, date: string, start: string, end: string): "available" | "occupied" | "reserved" | "maintenance" => {
    // Check if cabin itself is marked under maintenance
    const cabin = cabins.find(c => c.id === cabinId);
    if (cabin?.status === "maintenance") return "maintenance";

    const conflicts = detectConflicts(cabinId, date, start, end);
    if (conflicts.length > 0) {
      const activeOverlap = conflicts.some(c => c.status === "checked-in");
      return activeOverlap ? "occupied" : "reserved";
    }

    return "available";
  };

  // Conflict detector
  const detectConflicts = (cabinId: string, date: string, start: string, end: string, ignoreBookingId?: string): Booking[] => {
    return bookings.filter(booking => {
      if (booking.id === ignoreBookingId) return false;
      if (booking.cabinId !== cabinId) return false;
      if (booking.date !== date) return false;
      if (booking.status === "cancelled") return false;

      // Time overlap calculation
      const bStart = booking.startTime;
      const bEnd = booking.endTime;

      // Overlap if (StartA < EndB) and (EndA > StartB)
      return start < bEnd && end > bStart;
    });
  };

  // AI Recommendation Engine
  const getAIRecommendations = (capacity: number, facilities: string[], date: string, start: string, end: string): Cabin[] => {
    return cabins
      .filter(cabin => {
        // Exclude cabins under maintenance
        if (cabin.status === "maintenance") return false;

        // Exclude if already booked during this time
        const hasConflict = detectConflicts(cabin.id, date, start, end).length > 0;
        if (hasConflict) return false;

        // Filter by capacity: Cabin should have at least the requested capacity
        return cabin.capacity >= capacity;
      })
      .map(cabin => {
        // Calculate score based on facility matches (higher is better) and capacity proximity (closer to target is better)
        const matchedFacilities = cabin.facilities.filter(f => facilities.includes(f as any)).length;
        const capacityOverhead = cabin.capacity - capacity; // lower difference is better (avoids putting 2 people in a 30-seat room)

        // Final score: facilities matched * 10 - capacity excess
        const score = (matchedFacilities * 10) - (capacityOverhead * 0.5);
        return { cabin, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.cabin)
      .slice(0, 3); // Top 3 recommendations
  };

  // Auth Operations
  const login = (emailOrEmpId: string): boolean => {

    if (currentUser && currentUser.email === emailOrEmpId) {
      setCurrentUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem("is_auth", "true");
      localStorage.setItem("current_user", JSON.stringify(currentUser));
      // Notify
      const newNotif: NotificationItem = {
        id: "n_" + Date.now(),
        type: "info",
        title: "Logged In",
        message: `Welcome back, ${currentUser.name}! Access role: ${currentUser.role.toUpperCase()}.`,
        time: "Just now",
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("is_auth");
    localStorage.removeItem("current_user");
    setCurrentTab("dashboard");
  };

  // Booking Actions
  const addBooking = (bookingData: Omit<Booking, "id" | "userName" | "createdTime" | "status">) => {
    const conflicts = detectConflicts(bookingData.cabinId, bookingData.date, bookingData.startTime, bookingData.endTime);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Conflict detected! This cabin is already booked for: ${conflicts[0].purpose} (${conflicts[0].startTime} - ${conflicts[0].endTime}).`
      };
    }

    const cabin = cabins.find(c => c.id === bookingData.cabinId);
    if (cabin?.status === "maintenance") {
      return { success: false, error: "This cabin is currently undergoing maintenance." };
    }

    const newBooking: Booking = {
      ...bookingData,
      id: "b_" + Date.now(),
      userName: currentUser.name,
      status: "confirmed",
      createdTime: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    // Send notifications
    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "success",
      title: "Booking Confirmed",
      message: `Successfully booked ${cabin?.name || "Room"} for ${bookingData.date} (${bookingData.startTime} - ${bookingData.endTime}).`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true };
  };

  const cancelBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );

    const cabin = cabins.find(c => c.id === booking.cabinId);
    // Notification
    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "warning",
      title: "Booking Cancelled",
      message: `Booking for ${cabin?.name || "Room"} on ${booking.date} has been cancelled.`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const checkInBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: "checked-in" as const } : b))
    );

    const cabin = cabins.find(c => c.id === booking.cabinId);
    // Notification
    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "success",
      title: "Checked In",
      message: `You checked in to ${cabin?.name || "Room"}. Enjoy your meeting!`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const editBooking = (id: string, updated: Partial<Booking>) => {
    const original = bookings.find(b => b.id === id);
    if (!original) return { success: false, error: "Booking not found." };

    const targetCabinId = updated.cabinId || original.cabinId;
    const targetDate = updated.date || original.date;
    const targetStart = updated.startTime || original.startTime;
    const targetEnd = updated.endTime || original.endTime;

    const conflicts = detectConflicts(targetCabinId, targetDate, targetStart, targetEnd, id);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Rescheduling conflict! Room is already booked for: ${conflicts[0].purpose} (${conflicts[0].startTime} - ${conflicts[0].endTime}).`
      };
    }

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updated } as Booking : b))
    );

    const cabin = cabins.find(c => c.id === targetCabinId);
    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "info",
      title: "Booking Updated",
      message: `Your booking for ${cabin?.name || "Room"} has been rescheduled to ${targetDate} (${targetStart} - ${targetEnd}).`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true };
  };

  // Admin Operations
  const addCabin = (cabinData: Omit<Cabin, "id">) => {
    const newCabin: Cabin = {
      ...cabinData,
      id: "c_" + Date.now()
    };
    setCabins(prev => [...prev, newCabin]);

    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "info",
      title: "Cabin Added",
      message: `Admin added a new cabin: ${newCabin.name} (${newCabin.building}, Floor ${newCabin.floor}).`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const editCabin = (updatedCabin: Cabin) => {
    setCabins(prev => prev.map(c => (c.id === updatedCabin.id ? updatedCabin : c)));

    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "info",
      title: "Cabin Updated",
      message: `Admin updated details for ${updatedCabin.name}.`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const deleteCabin = (id: string) => {
    const cabin = cabins.find(c => c.id === id);
    setCabins(prev => prev.filter(c => c.id !== id));

    // Also cancel bookings for deleted cabin
    setBookings(prev =>
      prev.map(b => (b.cabinId === id ? { ...b, status: "cancelled" as const } : b))
    );

    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "warning",
      title: "Cabin Deleted",
      message: `Admin deleted ${cabin?.name || "a cabin"}. Linked bookings cancelled automatically.`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const toggleCabinMaintenance = (id: string) => {
    const cabin = cabins.find(c => c.id === id);
    if (!cabin) return;

    const newStatus = cabin.status === "maintenance" ? "available" : "maintenance";

    setCabins(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus as any } : c))
    );

    // If marked maintenance, cancel upcoming bookings for that cabin
    if (newStatus === "maintenance") {
      setBookings(prev =>
        prev.map(b => (b.cabinId === id && b.status !== "cancelled" ? { ...b, status: "cancelled" as const } : b))
      );
    }

    const newNotif: NotificationItem = {
      id: "n_" + Date.now(),
      type: "warning",
      title: newStatus === "maintenance" ? "Cabin Under Maintenance" : "Cabin Back Online",
      message: `${cabin.name} is now ${newStatus === "maintenance" ? "blocked for maintenance" : "available for bookings"}.`,
      time: "Just now",
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Real-time status update simulator
  // Runs every 15 seconds to sync cabins status dynamically based on current bookings
  useEffect(() => {
    const updateStatuses = () => {
      // Simulate real-time current clock (July 1, 2026, around 13:43 initially)
      // We will read the real current hour/min in a local simulated way
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hrs}:${mins}`;
      const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD (let's match 2026-07-01 for testing or actual day)

      setCabins(prevCabins => {
        return prevCabins.map(cabin => {
          // If admin hardcoded it to maintenance, keep it
          if (cabin.status === "maintenance") return cabin;

          // Find active booking for this cabin right now
          const activeBookings = bookings.filter(b => {
            return (
              b.cabinId === cabin.id &&
              b.status !== "cancelled" &&
              b.date === "2026-07-01" && // Match seeded date
              b.startTime <= "13:50" && // Simulated time
              b.endTime >= "13:50"
            );
          });

          if (activeBookings.length > 0) {
            return { ...cabin, status: "occupied" as const };
          }

          // Reserved soon means a booking starting in next 30 minutes
          const reservedSoonBookings = bookings.filter(b => {
            return (
              b.cabinId === cabin.id &&
              b.status === "confirmed" &&
              b.date === "2026-07-01" &&
              b.startTime > "13:50" &&
              b.startTime <= "14:20" // starting within 30 mins
            );
          });

          if (reservedSoonBookings.length > 0) {
            return { ...cabin, status: "reserved" as const };
          }

          return { ...cabin, status: "available" as const };
        });
      });
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, 15000);
    return () => clearInterval(interval);
  }, [bookings]);

  return (
    <BookingContext.Provider
      value={{
        userList,
        setUserList,


        cabins,
        bookings,
        currentUser,
        isAuthenticated,
        setIsAuthenticated,
        currentTab,
        theme,
        notifications,
        selectedBuilding,
        selectedFloor,
        setCurrentTab,
        setTheme,
        setSelectedBuilding,
        setSelectedFloor,
        setCurrentUser,

        login,
        logout,
        addBooking,
        cancelBooking,
        checkInBooking,
        editBooking,

        addCabin,
        editCabin,
        deleteCabin,
        toggleCabinMaintenance,

        checkAvailability,
        detectConflicts,
        getAIRecommendations,
        clearNotifications,
        markNotificationsAsRead
      }}
    >
      {isAuthenticated ? (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          {children}
        </div>
      ) : (
        <div className="min-h-screen w-full flex bg-background text-foreground">
          {children}
        </div>
      )}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
