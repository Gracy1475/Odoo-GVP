"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { seedDrivers, seedTrips, seedVehicles, suspendExpiredDrivers } from "@/lib/fleet-data";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "drivers" | "vehicles" | "trips";
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>([]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const suspendedDrivers = suspendExpiredDrivers(seedDrivers).filter((driver) => driver.status === "Suspended");
    const vehiclesInShop = seedVehicles.filter((vehicle) => vehicle.status === "In Shop");
    const pendingTrips = seedTrips.filter((trip) => trip.status === "Draft");

    const driverItems = suspendedDrivers.map((driver) => ({
      id: `driver-${driver.id}`,
      title: "Non-compliant driver",
      description: `${driver.name} license has expired or is non-compliant`,
      href: "/drivers",
      category: "drivers" as const,
    }));

    const vehicleItems = vehiclesInShop.map((vehicle) => ({
      id: `vehicle-${vehicle.id}`,
      title: "Vehicle in shop",
      description: `${vehicle.licensePlate} is currently under maintenance`,
      href: "/maintenance",
      category: "vehicles" as const,
    }));

    const tripItems = pendingTrips.map((trip) => ({
      id: `trip-${trip.id}`,
      title: "Pending trip",
      description: `Trip #${trip.id} is still in draft state`,
      href: "/dispatcher",
      category: "trips" as const,
    }));

    return [...driverItems, ...vehicleItems, ...tripItems];
  }, []);

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds(notifications.map((item) => item.id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
