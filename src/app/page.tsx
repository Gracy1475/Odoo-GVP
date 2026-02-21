"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleHome } from "@/lib/rbac";
import { Role } from "@/lib/types";

type StoredAuth = {
  role: Role;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const rawAuth = localStorage.getItem("fleetflow_auth");
    if (!rawAuth) {
      router.replace("/login");
      return;
    }

    const auth = JSON.parse(rawAuth) as StoredAuth;
    router.replace(getRoleHome(auth.role));
  }, [router]);

  return <div className="min-h-screen bg-slate-950" />;
}
