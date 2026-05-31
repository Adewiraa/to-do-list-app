"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, categoryService, Task, TaskFilters } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskInput } from "@/lib/schemas";
import IconRenderer from "@/components/IconRenderer";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Eye,
  X,
  History,
  Sparkles
} from "lucide-react";

const getPriorityBadgeClass = (priority: string) => {
  const p = priority ? priority.toLowerCase() : "";
  if (p === "urgent") return "bg-red-50 text-red-800 border-red-200";
  if (p === "high") return "bg-rose-50 text-rose-700 border-rose-200";
  if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-250"; // low / default
};

const getStatusBadgeClass = (status: string) => {
  if (status === "done") return "bg-emerald-50 text-emerald-750 border-emerald-200/80";
  if (status === "in_progress") return "bg-blue-50 text-blue-750 border-blue-200/80";
  return "bg-slate-100 text-slate-500 border-slate-200";
};

export default function TasksPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: "",
    priority: "",
    category_id: null,
    sort_by: "created_at",
    sort_order: "desc",
    per_page: 100,
  });

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);

  // Notification Toast for Undo
  const [toast, setToast] = useState<{ message: string; taskId: number } | null>(null);

  // Secure client route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Queries
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.list(filters),
    enabled: !!user,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.list,
    enabled: !!user,
  });

  // Task Details with History Log Query
  const { data: activeDetailsData, refetch: refetchDetails } = useQuery({
    queryKey: ["task-details", detailsTask?.id],
    queryFn: () => taskService.get(detailsTask!.id),
    enabled: !!detailsTask?.id,
  });

  // Sync details task with query result to show history logs
  useEffect(() => {
    if (activeDetailsData?.success && activeDetailsData.data) {
      setDetailsTask(activeDetailsData.data);
    }
  }, [activeDetailsData]);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      category_id: null,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      closeForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskInput }) =>
      taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      closeForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update task");
    },
  });

  const patchStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: any }) =>
      taskService.patchStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks", filters] });

      // Snapshot the previous value
      const previousTasksData = queryClient.getQueryData<any>(["tasks", filters]);

      // Optimistically update the UI state immediately
      if (previousTasksData) {
        const isPaginated = previousTasksData.data && !Array.isArray(previousTasksData.data) && (previousTasksData.data as any).data;
        let list: Task[] = [];
        if (isPaginated) {
          list = [...(previousTasksData.data as any).data];
        } else if (Array.isArray(previousTasksData.data)) {
          list = [...previousTasksData.data];
        } else if (Array.isArray(previousTasksData)) {
          list = [...previousTasksData];
        }

        const updatedList = list.map((task) =>
          task.id === id ? { ...task, status } : task
        );

        const updatedData = { ...previousTasksData };
        if (isPaginated) {
          updatedData.data = {
            ...updatedData.data,
            data: updatedList,
          };
        } else if (Array.isArray(previousTasksData.data)) {
          updatedData.data = updatedList;
        } else if (Array.isArray(previousTasksData)) {
          queryClient.setQueryData(["tasks", filters], updatedList);
          return { previousTasksData };
        }

        queryClient.setQueryData(["tasks", filters], updatedData);
      }

      return { previousTasksData };
    },
    onError: (err: any, _, context) => {
      // Rollback to previous snapshot if request fails
      if (context?.previousTasksData) {
        queryClient.setQueryData(["tasks", filters], context.previousTasksData);
      }
      alert(err.response?.data?.message || err.message || "Failed to update status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      if (detailsTask) refetchDetails();
    },
    onSettled: () => {
      // Background refetch to keep data in sync with the server
      queryClient.invalidateQueries({ queryKey: ["tasks", filters] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      
      // Show Undo Toast
      setToast({ message: "Task successfully deleted.", taskId: id });
      setTimeout(() => setToast(null), 6000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to delete task");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: taskService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setToast(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to restore task");
    },
  });

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800" />
        <p className="mt-4 text-xs font-bold text-slate-500">Loading your tasks...</p>
      </div>
    );
  }

  const tasks = (Array.isArray(tasksData?.data)
    ? tasksData.data
    : (tasksData?.data as any)?.data || []) as Task[];
  const categories = categoriesData?.data || [];

  const openCreateForm = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      category_id: null,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    // Format due_date YYYY-MM-DD for standard date input
    let formattedDate = "";
    if (task.due_date) {
      formattedDate = task.due_date.split(" ")[0]; // Get YYYY-MM-DD part
    }
    reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: formattedDate,
      category_id: task.category_id,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    reset();
  };

  const onSubmit = (data: TaskInput) => {
    setErrorMsg(null);
    // Append default 23:59:59 time to due date for storage consistency
    const dataToSend = { ...data };
    if (dataToSend.due_date) {
      dataToSend.due_date = `${dataToSend.due_date} 23:59:59`;
    }

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const toggleTaskStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    patchStatusMutation.mutate({ id, status: nextStatus });
  };

  const handleUndo = () => {
    if (toast) {
      restoreMutation.mutate(toast.taskId);
    }
  };

  const formatLogAction = (action: string) => {
    switch (action) {
      case "created":
        return "Task Created";
      case "updated":
        return "Task Info Edited";
      case "status_changed":
        return "Status Updated";
      case "priority_changed":
        return "Priority Updated";
      default:
        return action;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        {/* Undo Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-lg animate-scaleUp text-sm text-slate-700">
            <span>{toast.message}</span>
            <button
              onClick={handleUndo}
              className="text-slate-900 font-bold hover:text-slate-700 transition-colors text-xs cursor-pointer"
            >
              UNDO
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filter, search, organize, and toggle your assignments quickly.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer w-fit"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Controls: Search & Filters */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-450 focus:ring-1 focus:ring-slate-400 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter size={12} />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-slate-450 transition-all cursor-pointer appearance-none font-medium"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter Priority */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter size={12} />
              </div>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-slate-450 transition-all cursor-pointer appearance-none font-medium"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Filter Category */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter size={12} />
              </div>
              <select
                value={filters.category_id ?? ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-slate-450 transition-all cursor-pointer appearance-none font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-400 transition-all cursor-pointer font-medium"
                >
                  <option value="created_at">Date Created</option>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title Name</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Order:</span>
                <select
                  value={filters.sort_order}
                  onChange={(e) =>
                    setFilters({ ...filters, sort_order: e.target.value as "asc" | "desc" })
                  }
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-400 transition-all cursor-pointer font-medium"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  priority: "",
                  category_id: null,
                  sort_by: "created_at",
                  sort_order: "desc",
                })
              }
              className="text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Task List Grid */}
        {tasksLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
          </div>
        )}

        {!tasksLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <CheckCircle2 className="text-slate-350 mb-4 animate-bounce" size={40} />
            <p className="text-xs font-bold text-slate-800">No Tasks Found</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm font-medium">
              Your search filters returned no tasks, or you haven't added any tasks yet. Create a task to get started!
            </p>
            <button
              onClick={openCreateForm}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add New Task</span>
            </button>
          </div>
        )}

        {!tasksLoading && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition-all duration-200 shadow-xs flex flex-col justify-between min-h-[180px] relative group overflow-hidden ${
                  task.status === "done" ? "opacity-60" : ""
                }`}
              >
                {/* Accent Color Band */}
                {task.category && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: task.category.color }}
                  />
                )}

                <div>
                  <div className="flex items-start justify-between gap-4">
                    {/* Status Checkbox */}
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                        task.status === "done"
                          ? "bg-slate-800 border-slate-850 text-white"
                          : "border-slate-300 hover:border-slate-500 bg-slate-50"
                      }`}
                    >
                      {task.status === "done" && <CheckCircle2 size={13} className="fill-white stroke-slate-800" />}
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors truncate ${
                          task.status === "done" ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailsTask(task)}
                        className="p-1 bg-white border border-slate-250 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => openEditForm(task)}
                        className="p-1 bg-white border border-slate-250 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTask(task)}
                        className="p-1 bg-white border border-slate-250 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-100 cursor-pointer shadow-xs"
                        title="Delete Task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {task.category && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: `${task.category.color}15`,
                          color: task.category.color,
                          border: `1px solid ${task.category.color}30`,
                        }}
                      >
                        <IconRenderer name={task.category.icon} size={10} />
                        <span>{task.category.name}</span>
                      </span>
                    )}

                    {task.due_date && (
                      <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        <span>{new Date(task.due_date).toLocaleDateString("id-ID")}</span>
                      </span>
                    )}
                  </div>

                  <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer shadow-xs hover:bg-slate-50"
              >
                <X size={15} />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>{editingTask ? "Edit Task" : "New Task"}</span>
              </h3>

              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-650 text-xs rounded-xl mb-4 animate-shake font-semibold">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="task-title-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Task Title
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    {...register("title")}
                    placeholder="e.g. Finish chemistry project"
                    className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-semibold"
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                      <AlertCircle size={12} />
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="task-desc-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    id="task-desc-input"
                    {...register("description")}
                    placeholder="Add more details about this task..."
                    rows={3}
                    className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label htmlFor="task-priority-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <select
                      id="task-priority-input"
                      {...register("priority")}
                      className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-3 outline-none focus:border-slate-400 transition-all cursor-pointer font-semibold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label htmlFor="task-date-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Due Date
                    </label>
                    <input
                      id="task-date-input"
                      type="date"
                      {...register("due_date")}
                      className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 transition-all cursor-pointer font-semibold"
                    />
                    {errors.due_date && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                        <AlertCircle size={12} />
                        <span>{errors.due_date.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Category ID */}
                <div>
                  <label htmlFor="task-category-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Assign Category
                  </label>
                  <select
                    id="task-category-input"
                    {...register("category_id")}
                    onChange={(e) =>
                      setValue("category_id", e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-3 outline-none focus:border-slate-400 transition-all cursor-pointer font-semibold"
                  >
                    <option value="">No Category Assigned</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-sm transition-all cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    <span>{editingTask ? "Save Changes" : "Create"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details & Activity Log Modal */}
        {detailsTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setDetailsTask(null)}
                className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer shadow-xs hover:bg-slate-50"
              >
                <X size={15} />
              </button>

              {/* Detail Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusBadgeClass(detailsTask.status)}`}>
                  {detailsTask.status}
                </span>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getPriorityBadgeClass(detailsTask.priority)}`}>
                  {detailsTask.priority}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                {detailsTask.title}
              </h2>

              {detailsTask.category && (
                <div className="flex items-center gap-1.5 mb-4">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: `${detailsTask.category.color}15`,
                      color: detailsTask.category.color,
                      border: `1px solid ${detailsTask.category.color}30`,
                    }}
                  >
                    <IconRenderer name={detailsTask.category.icon} size={10} />
                    <span>{detailsTask.category.name}</span>
                  </span>
                </div>
              )}

              {detailsTask.description && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description
                  </h4>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                    {detailsTask.description}
                  </p>
                </div>
              )}

              {/* Task timelines metadata */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 mb-6 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Created On</span>
                    <span className="text-slate-700">{new Date(detailsTask.created_at).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Due Date</span>
                    <span className="text-slate-700 font-semibold">
                      {detailsTask.due_date ? new Date(detailsTask.due_date).toLocaleString("id-ID") : "No due date set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Logs / History timeline */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <History size={15} className="text-slate-600" />
                  <span>Activity Logs & History</span>
                </h4>

                {detailsTask.activities && detailsTask.activities.length > 0 ? (
                  <div className="space-y-4 pl-3 border-l border-slate-200">
                    {detailsTask.activities.map((log) => (
                      <div key={log.id} className="relative group">
                        {/* Timeline Node Orb */}
                        <div className="absolute left-[-17px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400 ring-2 ring-white" />

                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-slate-800">
                              {formatLogAction(log.action)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - {new Date(log.created_at).toLocaleDateString("id-ID")}
                            </span>
                          </div>

                          {/* Detail of edit changes */}
                          {(log.old_value || log.new_value) && (
                            <div className="mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200/60 text-[10px] text-slate-500 leading-relaxed font-semibold">
                              {log.old_value && (
                                <p className="flex items-start gap-1">
                                  <span className="text-rose-600 font-bold">Was:</span>
                                  <span className="truncate max-w-[200px]">{log.old_value}</span>
                                </p>
                              )}
                              {log.new_value && (
                                <p className="flex items-start gap-1 mt-0.5">
                                  <span className="text-emerald-700 font-bold">Now:</span>
                                  <span className="truncate max-w-[200px]">{log.new_value}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No logs recorded yet. Changes will be listed here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirmTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-scaleUp">
              {/* Icon */}
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 mx-auto mb-4">
                <Trash2 size={20} className="text-rose-600" />
              </div>

              <h3 className="text-base font-bold text-slate-900 text-center mb-1">
                Delete Task?
              </h3>
              <p className="text-xs text-slate-500 text-center font-medium mb-5 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  &ldquo;{deleteConfirmTask.title}&rdquo;
                </span>
                ? You can undo this action right after.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTask(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-sm transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    deleteMutation.mutate(deleteConfirmTask.id);
                    setDeleteConfirmTask(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
