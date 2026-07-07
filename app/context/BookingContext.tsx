"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserList } from "../Types/User";
import { BuildingType, CabinType, FloorType, ItemType } from "../Types/Cabin";
import { getAllBuildings, getCabins, getDepartments, getRoomFacilities, getRoomTypes } from "../http";
import { DepartmentType } from "../Types/Booking";

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
  cabinList: CabinType[];
  setCabinList: React.Dispatch<React.SetStateAction<CabinType[]>>;
  buildingList: BuildingType[];
  setBuildingList: React.Dispatch<React.SetStateAction<BuildingType[]>>;
  loadingBuildings: boolean;
  fetchBuildings: () => void;
  fetchCabins: () => void;
  loadingCabins: boolean;
  departments: DepartmentType[];
  setDepartments: React.Dispatch<React.SetStateAction<DepartmentType[]>>;
  loadingDepartments: boolean;
  setLoadingDepartments: React.Dispatch<React.SetStateAction<boolean>>;
  fetchDepartments: () => void;
  types: ItemType[];
  setTypes: React.Dispatch<React.SetStateAction<ItemType[]>>;
  facilities: ItemType[];
  setFacilities: React.Dispatch<React.SetStateAction<ItemType[]>>;
  loadingTypes: boolean;
  setLoadingTypes: React.Dispatch<React.SetStateAction<boolean>>;
  loadingFacilities: boolean;
  setLoadingFacilities: React.Dispatch<React.SetStateAction<boolean>>;
  fetchTypes: () => void;
  fetchFacilities: () => void;


  cabins: CabinType[];
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
  addBooking: (booking: Omit<Booking, "id" | "userName" | "createdTime" | "status">) => { success: boolean; error?: string };
  cancelBooking: (id: string) => void;
  checkInBooking: (id: string) => void;
  editBooking: (id: string, updated: Partial<Booking>) => { success: boolean; error?: string };


  // Helpers
  checkAvailability: (cabinId: string, date: string, start: string, end: string) => "available" | "occupied" | "reserved" | "maintenance";
  detectConflicts: (cabinId: string, date: string, start: string, end: string, ignoreBookingId?: string) => Booking[];
  getAIRecommendations: (capacity: number, facilities: string[], date: string, start: string, end: string) => CabinType[];
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

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
  const [cabinList, setCabinList] = useState<CabinType[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [buildingList, setBuildingList] = useState<BuildingType[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState<boolean>(false);
  const [loadingCabins, setLoadingCabins] = useState<boolean>(false);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [types, setTypes] = useState<ItemType[]>([]);
  const [facilities, setFacilities] = useState<ItemType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState<"Main HQ" | "West Wing">("Main HQ");
  const [selectedFloor, setSelectedFloor] = useState<"Ground Floor" | "1st Floor" | "2nd Floor">("1st Floor");

  // Databases states
  const [cabins, setCabins] = useState<CabinType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Sync cabins state with fetched cabinList
  useEffect(() => {
    if (cabinList && cabinList.length > 0) {
      setCabins(cabinList);
    }
  }, [cabinList]);

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

  const checkAvailability = (cabinId: string, date: string, start: string, end: string): "available" | "occupied" | "reserved" | "maintenance" => {
    // Check if cabin itself is marked under maintenance
    const cabin = cabins.find(c => c._id === cabinId);
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

  const getAIRecommendations = (capacity: number, facilities: string[], date: string, start: string, end: string): CabinType[] => {
    return cabins
      .filter(cabin => {
        // Exclude cabins under maintenance
        if (cabin.status === "maintenance") return false;

        // Exclude if already booked during this time
        const hasConflict = detectConflicts(cabin._id!, date, start, end).length > 0;
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

  const addBooking = (bookingData: Omit<Booking, "id" | "userName" | "createdTime" | "status">) => {
    const conflicts = detectConflicts(bookingData.cabinId, bookingData.date, bookingData.startTime, bookingData.endTime);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Conflict detected! This cabin is already booked for: ${conflicts[0].purpose} (${conflicts[0].startTime} - ${conflicts[0].endTime}).`
      };
    }

    const cabin = cabins.find(c => c._id === bookingData.cabinId);
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

    const cabin = cabins.find(c => c._id === booking.cabinId);
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

    const cabin = cabins.find(c => c._id === booking.cabinId);
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

    const cabin = cabins.find(c => c._id === targetCabinId);
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


  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
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
              b.cabinId === cabin._id &&
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
              b.cabinId === cabin._id &&
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


  // fetch buildings 
  const fetchBuildings = async () => {
    if (buildingList.length === 0) {
      setLoadingBuildings(true);
    }
    try {
      const res = await getAllBuildings();
      setBuildingList(res?.data?.buildings)
    } catch (err) {
      console.error("Failed to fetch buildings:", err);
    } finally {
      setLoadingBuildings(false);
    }
  };
  // fetch cabins 
  const fetchCabins = async () => {
    if (cabinList.length === 0) {
      setLoadingCabins(true);
    } else {
      setLoadingCabins(false);
    }
    try {
      const res = await getCabins();
      setCabinList(res?.data || []);
      setLoadingCabins(false);
    } catch (err) {
      console.error("Failed to fetch cabins:", err);
      setLoadingCabins(false);
    }
  };

  const fetchDepartments = async () => {
    if (departments?.length === 0) {
      setLoadingDepartments(true);
    }
    try {
      const res = await getDepartments();
      setDepartments(res?.data?.departments || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchTypes = async () => {
    if (types.length === 0) {
      setLoadingTypes(true);
    }
    try {
      const res = await getRoomTypes();
      setTypes(res?.data?.types || []);
    } catch (err) {
      console.error("Failed to fetch room types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchFacilities = async () => {
    if (facilities.length === 0) {
      setLoadingFacilities(true);
    }
    try {
      const res = await getRoomFacilities();
      setFacilities(res?.data?.facilities || []);
    } catch (err) {
      console.error("Failed to fetch facilities:", err);
    } finally {
      setLoadingFacilities(false);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchFacilities();
    fetchCabins();
    fetchDepartments();
    fetchBuildings();
  }, []);

  return (
    <BookingContext.Provider
      value={{
        userList,
        setUserList,
        cabinList,
        setCabinList,
        fetchCabins,
        loadingCabins,
        buildingList,
        setBuildingList,
        loadingBuildings,
        fetchBuildings,
        departments,
        setDepartments,
        loadingDepartments,
        setLoadingDepartments,
        fetchDepartments,
        types,
        setTypes,
        facilities,
        setFacilities,
        loadingTypes,
        setLoadingTypes,
        loadingFacilities,
        setLoadingFacilities,
        fetchTypes,
        fetchFacilities,


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

        addBooking,
        cancelBooking,
        checkInBooking,
        editBooking,

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
