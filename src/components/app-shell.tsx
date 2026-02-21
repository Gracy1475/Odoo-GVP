"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getAllowedPaths } from "@/lib/rbac";
import { NotificationBell } from "@/components/notification-bell";
import { useTheme } from "@/context/theme-context";

const navItems = [
  { href: "/dashboard", label: "Command Center" },
  { href: "/vehicles", label: "Vehicle Registry" },
  { href: "/dispatcher", label: "Trip Dispatcher" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/expenses", label: "Expense & Fuel" },
  { href: "/drivers", label: "Drivers & Safety" },
  { href: "/analytics", label: "Analytics & ROI" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const allowedPaths = getAllowedPaths(user.role);
  const visibleItems = navItems.filter((item) =>
    user.role === "Manager" ? true : allowedPaths.some((path) => item.href.startsWith(path)),
  );

  const sidebarStateClasses = sidebarOpen
    ? "translate-x-0 opacity-100"
    : "-translate-x-[110%] opacity-0 pointer-events-none";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex h-screen overflow-hidden">
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-[rgba(0,0,0,0.45)] transition-opacity duration-[250ms] ease-in-out ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />

        <aside
          className={`wire-window fixed inset-y-3 left-3 z-50 flex h-auto w-[min(88vw,320px)] flex-col p-3 transition-all duration-[250ms] ease-in-out ${sidebarStateClasses}`}
          aria-label="Main navigation"
          aria-hidden={!sidebarOpen}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                FleetFlow
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{user.role}</p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="wire-button-alt !h-8 !min-h-8 px-2"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="mobile-scroll flex-1 space-y-1.5 overflow-y-auto pr-1">
            {visibleItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-[12px] border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "border-[color:color-mix(in_srgb,var(--accent-primary)_50%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-primary)_15%,transparent)] text-[var(--text-primary)]"
                      : "border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <span className="block truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="h-16 px-3 py-2 md:px-4">
            <div className="flex h-full w-full items-center justify-between gap-2 rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[rgba(17,24,39,0.75)] px-3 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-[8px] md:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Toggle sidebar"
                  aria-expanded={sidebarOpen}
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="wire-button-alt !h-9 !min-h-9 px-3"
                >
                  ☰
                </button>
                <p className="wire-title truncate text-sm font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  FleetFlow Command Center
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle light and dark theme"
                  className="wire-button-alt !h-9 !min-h-9 px-3"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
                <NotificationBell />
                <span className="hidden max-w-[140px] truncate text-xs font-semibold text-[var(--text-secondary)] lg:inline">
                  {user.username}
                </span>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="wire-button-alt !h-9 !min-h-9 px-3"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
            <section className="wire-window p-3 md:p-4">{children}</section>
          </main>
        </div>
      </div>
    </div>
  );
}
