"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  Folder,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Note: If you don't have a cn helper, let's write it in src/lib/utils.ts
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks & Kanban", icon: CheckSquare },
    { href: "/categories", label: "Categories", icon: Folder },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
 
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs w-full h-full border-none p-0 cursor-pointer block"
          aria-label="Close sidebar overlay"
        />
      )}
 
      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col pt-16 lg:pt-0">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                TaskFlow
              </h1>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                Productivity Hub
              </span>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
 
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                    isActive
                      ? "text-slate-900 bg-slate-100/80 border-l-2 border-slate-800"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "transition-transform duration-150 group-hover:scale-105",
                      isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
 
        {/* Profile Card Section & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-850 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-450 truncate">{user.email}</p>
            </div>
          </div>
 
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-xl bg-white border border-slate-250 hover:bg-rose-50/5 hover:border-rose-100 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
