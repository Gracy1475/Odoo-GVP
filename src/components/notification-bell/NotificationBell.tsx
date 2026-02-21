"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/notification-context";

const categoryStyle = {
  drivers: "text-[var(--danger)]",
  vehicles: "text-[var(--warning)]",
  trips: "text-[var(--info)]",
};

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_24%,transparent)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      >
        <span className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mobile-notification-panel animate-fadeIn absolute right-0 top-11 z-50 w-[min(92vw,340px)] rounded-[14px] border border-[color:color-mix(in_srgb,var(--accent-primary)_25%,transparent)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-elevated)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Notifications</p>
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] text-[var(--accent-primary)] transition-colors hover:brightness-110"
            >
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_22%,transparent)] bg-[var(--bg-secondary)] px-3 py-4 text-center text-xs text-[var(--text-muted)]">
              No active alerts
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    markAsRead(item.id);
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_18%,transparent)] bg-[var(--bg-secondary)] px-3 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">{item.description}</p>
                  <p className={`mt-1 text-[10px] uppercase tracking-wide ${categoryStyle[item.category]}`}>
                    {item.category}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
