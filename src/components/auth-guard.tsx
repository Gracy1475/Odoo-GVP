"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { canAccessPath, getRoleHome } from "@/lib/rbac";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccessPath(user.role, pathname)) {
      router.replace(getRoleHome(user.role));
    }
  }, [loading, pathname, router, user]);

  if (loading || !user || !canAccessPath(user.role, pathname)) {
    return <div className="min-h-screen animate-pulse bg-slate-950" />;
  }

  return <>{children}</>;
}
