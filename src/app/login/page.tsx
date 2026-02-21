"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getRoleHome, roleOptions } from "@/lib/rbac";
import { Role } from "@/lib/types";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Manager");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await login(username, password, role);
      router.replace(getRoleHome(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="wire-bg min-h-screen p-4 flex items-center justify-center">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 lg:gap-8 lg:flex-row">
        {/* Login Form */}
        <form onSubmit={onSubmit} className="wire-window slide-up w-full max-w-sm overflow-hidden">
          <div className="wire-titlebar">
            <p className="wire-title text-base font-bold">Welcome to FleetFlow</p>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-2">Username</label>
              <input 
                value={username} 
                onChange={(event) => setUsername(event.target.value)} 
                className="wire-input w-full" 
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                className="wire-input w-full" 
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-2">Role</label>
              <select 
                value={role} 
                onChange={(event) => setRole(event.target.value as Role)} 
                className="wire-select w-full"
              >
                {roleOptions.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <div className="rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-300 font-medium">
                {error}
              </div>
            )}
            <button className="wire-button w-full mt-2">Login to FleetFlow</button>
            <p className="text-center text-xs text-slate-400">
              Demo credentials available for all roles
            </p>
          </div>
        </form>

        {/* Role Preview Panel */}
        <div className="wire-window hidden lg:flex flex-col w-full max-w-sm overflow-hidden animate-float">
          <div className="wire-titlebar">
            <p className="wire-title text-base font-bold">Available Roles</p>
          </div>
          <div className="space-y-4 p-6">
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <h4 className="text-sm font-bold text-indigo-300">Manager</h4>
              <p className="text-xs text-slate-400 mt-1">Full access to all modules and analytics</p>
            </div>
            <div className="border-l-4 border-cyan-500 pl-4 py-2">
              <h4 className="text-sm font-bold text-cyan-300">Dispatcher</h4>
              <p className="text-xs text-slate-400 mt-1">Trip operations and fleet management</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="text-sm font-bold text-purple-300">Safety Officer</h4>
              <p className="text-xs text-slate-400 mt-1">Driver compliance and safety reports</p>
            </div>
            <div className="border-l-4 border-pink-500 pl-4 py-2">
              <h4 className="text-sm font-bold text-pink-300">Financial Analyst</h4>
              <p className="text-xs text-slate-400 mt-1">Financial reports and cost analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
