"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getAllowedPaths } from "@/lib/rbac";
import { NotificationBell } from "@/components/notification-bell";
import { useTheme } from "@/context/theme-context";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: "⌂" },
  { href: "/vehicles", label: "Vehicle Registry", icon: "▦" },
  { href: "/dispatcher", label: "Trip Dispatcher", icon: "↗" },
  { href: "/maintenance", label: "Maintenance", icon: "⚙" },
  { href: "/expenses", label: "Expense & Fuel", icon: "◈" },
  { href: "/drivers", label: "Drivers & Safety", icon: "◉" },
  { href: "/analytics", label: "Analytics & ROI", icon: "◬" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMobileSidebarOpen(false);
  }, [pathname, user]);

  if (!user) return null;

  const allowedPaths = getAllowedPaths(user.role);
  const visibleItems = navItems.filter((item) =>
    user.role === "Manager" ? true : allowedPaths.some((path) => item.href.startsWith(path)),
  );

  const desktopSidebarWidth = desktopCollapsed ? 80 : 260;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex h-screen overflow-hidden">
        <aside
          className="hidden md:flex md:shrink-0 md:flex-col md:overflow-hidden md:border-r md:border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] md:bg-[var(--bg-secondary)]"
          style={{ width: desktopSidebarWidth, transition: "width 0.25s ease-in-out" }}
          aria-label="Main navigation"
        >
          <div className={`border-b border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] px-4 py-4 ${desktopCollapsed ? "text-center" : ""}`}>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              {desktopCollapsed ? "FF" : "FleetFlow"}
            </h1>
            {!desktopCollapsed && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{user.role}</p>
            )}
          </div>

          <nav className="mobile-scroll flex-1 space-y-1.5 overflow-y-auto px-2 py-3">
            {visibleItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={desktopCollapsed ? item.label : undefined}
                  className={`group relative flex min-h-[44px] items-center rounded-[12px] border text-xs font-semibold transition-all duration-200 ${
                    desktopCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3"
                  } ${
                    active
                      ? "border-[color:color-mix(in_srgb,var(--accent-primary)_50%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-primary)_15%,transparent)] text-[var(--text-primary)]"
                      : "border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r ${
                      active ? "bg-[var(--accent-primary)]" : "bg-transparent"
                    }`}
                  />
                  <span className="text-base leading-none">{item.icon}</span>
                  {!desktopCollapsed && <span className="block truncate">{item.label}</span>}
                  {desktopCollapsed && (
                    <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-[var(--shadow-elevated)] group-hover:block">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <button
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-[rgba(0,0,0,0.45)] transition-opacity duration-[200ms] ease-in-out md:hidden ${mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />

        <aside
          className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[var(--bg-secondary)] transition-transform duration-[300ms] ease-in-out md:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Main navigation mobile"
          aria-hidden={!mobileSidebarOpen}
        >
          <div className="flex items-center justify-between border-b border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] px-4 py-4">
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                FleetFlow
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="wire-button-alt !h-8 !min-h-8 px-2"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="mobile-scroll flex-1 space-y-1.5 overflow-y-auto px-2 py-3">
            {visibleItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`relative flex min-h-[44px] items-center gap-3 rounded-[12px] border px-3 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "border-[color:color-mix(in_srgb,var(--accent-primary)_50%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-primary)_15%,transparent)] text-[var(--text-primary)]"
                      : "border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r ${
                      active ? "bg-[var(--accent-primary)]" : "bg-transparent"
                    }`}
                  />
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="block truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="h-16 shrink-0 px-6">
            <div className="flex h-full items-center justify-between gap-2 border-b border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)]">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Toggle mobile sidebar"
                  aria-expanded={mobileSidebarOpen}
                  onClick={() => setMobileSidebarOpen((prev) => !prev)}
                  className="wire-button-alt !h-9 !min-h-9 px-3 md:hidden"
                >
                  ☰
                </button>
                <button
                  type="button"
                  aria-label="Toggle desktop sidebar"
                  aria-expanded={!desktopCollapsed}
                  onClick={() => setDesktopCollapsed((prev) => !prev)}
                  className="wire-button-alt !hidden !h-9 !min-h-9 px-3 md:!inline-flex"
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

          <main className="flex-1 overflow-y-auto p-6">
            <section className="wire-window p-4 md:p-5">{children}</section>
          </main>
        </div>
      </div>
    </div>
  );
}
