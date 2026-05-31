import axios from "axios";
import { LoginInput, RegisterInput, CategoryInput, TaskInput } from "./schemas";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auto attach authorization token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("todo_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: Category;
  activities?: TaskActivity[];
}

export interface TaskActivity {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_active_tasks: number;
  total_completed_tasks: number;
  total_overdue_tasks: number;
  completion_rate: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  by_status: {
    pending: number;
    in_progress: number;
    done: number;
    cancelled: number;
  };
  productivity_trend: {
    date: string;
    completed: number;
  }[];
}

// API Services
export const authService = {
  register: async (data: RegisterInput) => {
    const res = await api.post<ApiResponse<{ user: User; access_token: string }>>("/auth/register", data);
    return res.data;
  },
  login: async (data: LoginInput) => {
    const res = await api.post<ApiResponse<{ user: User; access_token: string }>>("/auth/login", data);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },
};

export const categoryService = {
  list: async () => {
    const res = await api.get<ApiResponse<Category[]>>("/categories");
    return res.data;
  },
  create: async (data: CategoryInput) => {
    const res = await api.post<ApiResponse<Category>>("/categories", data);
    return res.data;
  },
  get: async (id: number) => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data;
  },
  update: async (id: number, data: CategoryInput) => {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return res.data;
  },
};

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  category_id?: number | null;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
}

export const taskService = {
  list: async (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category_id !== undefined && filters.category_id !== null) {
      params.append("category_id", filters.category_id.toString());
    }
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);
    if (filters.per_page) params.append("per_page", filters.per_page.toString());

    const res = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
    return res.data;
  },
  create: async (data: TaskInput) => {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data;
  },
  get: async (id: number) => {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },
  update: async (id: number, data: TaskInput) => {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },
  patchStatus: async (id: number, status: "pending" | "in_progress" | "done" | "cancelled") => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
    return res.data;
  },
  restore: async (id: number) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${id}/restore`);
    return res.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return res.data;
  },
  getTodayTasks: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/dashboard/tasks/today");
    return res.data;
  },
  getOverdueTasks: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/dashboard/tasks/overdue");
    return res.data;
  },
};
