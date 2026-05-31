"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api";
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Loader2,
  Clock,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Link from "next/link";
import IconRenderer from "@/components/IconRenderer";

const getPriorityBadgeClass = (priority: string) => {
  const p = priority ? priority.toLowerCase() : "";
  if (p === "urgent") return "bg-red-50 text-red-800 border-red-200";
  if (p === "high") return "bg-rose-50 text-rose-700 border-rose-200";
  if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-250"; // low / default
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Secure client route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Queries
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.getSummary,
    enabled: !!user,
  });

  const { data: todayTasksData, isLoading: todayLoading } = useQuery({
    queryKey: ["dashboard-today"],
    queryFn: dashboardService.getTodayTasks,
    enabled: !!user,
  });

  const { data: overdueTasksData, isLoading: overdueLoading } = useQuery({
    queryKey: ["dashboard-overdue"],
    queryFn: dashboardService.getOverdueTasks,
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800" />
        <p className="mt-4 text-xs font-bold text-slate-500">Loading your space...</p>
      </div>
    );
  }

  const summary = summaryData?.data;
  const todayTasks = todayTasksData?.data || [];
  const overdueTasks = overdueTasksData?.data || [];

  const statCards = [
    {
      title: "Active Tasks",
      value: summary?.total_active_tasks ?? 0,
      icon: ListTodo,
      bgClass: "bg-white border-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)]",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    {
      title: "Completed",
      value: summary?.total_completed_tasks ?? 0,
      icon: CheckCircle2,
      bgClass: "bg-white border-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)]",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      title: "Overdue Tasks",
      value: summary?.total_overdue_tasks ?? 0,
      icon: AlertTriangle,
      bgClass: "bg-white border-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)]",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
      alert: (summary?.total_overdue_tasks ?? 0) > 0,
    },
    {
      title: "Completion Rate",
      value: `${Math.round(summary?.completion_rate ?? 0)}%`,
      icon: TrendingUp,
      bgClass: "bg-white border-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)]",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
              Welcome back, {user.name}! <Sparkles className="text-amber-500" size={20} />
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Here is your productivity overview for today.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-semibold shadow-xs w-fit">
            <Calendar size={13} className="text-slate-500" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {summaryLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className={`border rounded-2xl p-5 flex items-center justify-between ${stat.bgClass} transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-extrabold text-slate-950 mt-1.5 tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                      <Icon size={20} className={stat.alert ? "animate-pulse" : ""} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Productivity Chart Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                Productivity Trend <span className="text-[11px] text-slate-400 font-semibold">(Last 7 Days)</span>
              </h2>

              <div className="h-64 w-full">
                {isMounted && summary?.productivity_trend && summary.productivity_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={summary.productivity_trend}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={600}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={600}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          borderRadius: "12px",
                          color: "#0f172a",
                          fontSize: "11px",
                          fontWeight: 600,
                          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Completed Tasks"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    No productivity history to display yet. Complete some tasks!
                  </div>
                )}
              </div>
            </div>

            {/* Overdue and Today Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overdue Tasks */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold flex items-center gap-2 text-rose-600 text-xs uppercase tracking-wider">
                    <AlertTriangle size={15} />
                    <span>Overdue Tasks ({overdueTasks.length})</span>
                  </h3>
                  <Link
                    href="/tasks?status=in_progress"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 group transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {overdueLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                  </div>
                )}

                {!overdueLoading && overdueTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle2 className="text-emerald-500/10 mb-3" size={40} />
                    <p className="text-xs font-bold text-slate-700">Clean Slate!</p>
                    <p className="text-[11px] text-slate-450 mt-1 max-w-xs">No overdue tasks. Excellent job staying on track!</p>
                  </div>
                )}

                {!overdueLoading && overdueTasks.length > 0 && (
                  <div className="flex-1 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-rose-50/30 hover:bg-rose-50/60 border border-rose-100/60 rounded-xl flex items-center justify-between transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-850 truncate group-hover:text-rose-950">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {task.category && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                                style={{
                                  backgroundColor: `${task.category.color}15`,
                                  color: task.category.color,
                                  border: `1px solid ${task.category.color}30`,
                                }}
                              >
                                <IconRenderer name={task.category.icon} size={9} />
                                <span>{task.category.name}</span>
                              </span>
                            )}
                            <span className="text-[9px] text-rose-500 font-semibold flex items-center gap-1">
                              <Clock size={9} />
                              <span>Due {task.due_date ? new Date(task.due_date).toLocaleDateString("id-ID") : "no date"}</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Due Today */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold flex items-center gap-2 text-slate-800 text-xs uppercase tracking-wider">
                    <Calendar size={15} />
                    <span>Due Today ({todayTasks.length})</span>
                  </h3>
                  <Link
                    href="/tasks"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 group transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {todayLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                  </div>
                )}

                {!todayLoading && todayTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Calendar className="text-slate-200 mb-3" size={40} />
                    <p className="text-xs font-bold text-slate-750">Nothing Due Today</p>
                    <p className="text-[11px] text-slate-450 mt-1 max-w-xs">Enjoy your day or start planning ahead!</p>
                  </div>
                )}

                {!todayLoading && todayTasks.length > 0 && (
                  <div className="flex-1 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-850 truncate group-hover:text-slate-950">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {task.category && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                                style={{
                                  backgroundColor: `${task.category.color}15`,
                                  color: task.category.color,
                                  border: `1px solid ${task.category.color}30`,
                                }}
                              >
                                <IconRenderer name={task.category.icon} size={9} />
                                <span>{task.category.name}</span>
                              </span>
                            )}
                            <span className="text-[9px] text-slate-450 font-semibold flex items-center gap-1">
                              <Clock size={9} />
                              <span>Today {task.due_date ? new Date(task.due_date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
