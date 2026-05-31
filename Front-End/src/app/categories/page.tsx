"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, taskService, Category, Task } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/lib/schemas";
import IconRenderer, { AVAILABLE_ICONS } from "@/components/IconRenderer";
import {
  FolderPlus,
  Edit2,
  Trash2,
  AlertCircle,
  Plus,
  Loader2,
  Folder,
  Check,
  X
} from "lucide-react";

const PRESETS = [
  "#a855f7", // purple
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
  "#06b6d4", // cyan
];

export default function CategoriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for Create/Edit Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESETS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].name);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);

  // Secure client route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Queries
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.list,
    enabled: !!user,
  });

  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.list({ per_page: 1000 }),
    enabled: !!user,
  });

  // Forms
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: PRESETS[0],
      icon: AVAILABLE_ICONS[0].name,
    },
  });

  // Keep Zod color & icon values in sync with state
  useEffect(() => {
    setValue("color", selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue("icon", selectedIcon);
  }, [selectedIcon, setValue]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryInput }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // also refresh tasks so category changes reflect
      closeForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to delete category");
    },
  });

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800" />
        <p className="mt-4 text-xs font-bold text-slate-500">Loading categories...</p>
      </div>
    );
  }

  const categories = categoriesData?.data || [];
  const tasks = (Array.isArray(tasksData?.data)
    ? tasksData.data
    : (tasksData?.data as any)?.data || []) as Task[];

  // Calculate local task distribution per category
  const getTaskCount = (catId: number) => {
    return tasks.filter((t) => t.category_id === catId && t.status !== "done" && t.status !== "cancelled").length;
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setSelectedColor(PRESETS[0]);
    setSelectedIcon(AVAILABLE_ICONS[0].name);
    reset({
      name: "",
      color: PRESETS[0],
      icon: AVAILABLE_ICONS[0].name,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon);
    reset({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: CategoryInput) => {
    setErrorMsg(null);
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (category: Category) => {
    setDeleteConfirmCategory(category);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
              Categories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize your tasks and workflows under projects or labels.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer w-fit"
          >
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        </div>

        {categoriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                <Folder className="text-slate-350 mb-4 animate-bounce" size={40} />
                <p className="text-xs font-bold text-slate-800">No Categories Created</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm font-medium">
                  Create categories like "Work", "Studies", or "Personal Tasks" to group and filter your to-do lists effectively.
                </p>
                <button
                  onClick={openCreateForm}
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Create One Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const activeTasks = getTaskCount(category.id);
                  return (
                    <div
                      key={category.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all duration-200 shadow-xs relative group overflow-hidden"
                    >
                      {/* Accent color bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: category.color }}
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="h-11 w-11 rounded-xl flex items-center justify-center text-white"
                            style={{
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                              border: `1px solid ${category.color}30`,
                            }}
                          >
                            <IconRenderer name={category.icon} size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-slate-950 transition-colors text-sm">
                              {category.name}
                            </h3>
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5 block">
                              {activeTasks} Active Tasks
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditForm(category)}
                            className="p-1.5 bg-white border border-slate-250 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                            title="Edit Category"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1.5 bg-white border border-slate-250 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-100 transition-colors cursor-pointer shadow-xs"
                            title="Delete Category"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Overlay / Form Container */}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
                  <button
                    onClick={closeForm}
                    className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer shadow-xs hover:bg-slate-50"
                  >
                    <X size={15} />
                  </button>

                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <FolderPlus size={18} className="text-amber-505" />
                    <span>{editingCategory ? "Edit Category" : "New Category"}</span>
                  </h3>

                  {errorMsg && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-650 text-xs rounded-xl mb-4 font-semibold">
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name input */}
                    <div>
                      <label htmlFor="category-name-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Category Name
                      </label>
                      <input
                        id="category-name-input"
                        type="text"
                        {...register("name")}
                        placeholder="e.g. Work Projects"
                        className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-semibold"
                        autoFocus
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                          <AlertCircle size={12} />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Preset Colors */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Theme Color
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {PRESETS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className="h-8 w-8 rounded-full border border-slate-100 relative transition-transform hover:scale-105 cursor-pointer shadow-xs"
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <span className="absolute inset-0 flex items-center justify-center text-white">
                                <Check size={13} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Icon selection */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Icon Label
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon.name}
                            type="button"
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                              selectedIcon === icon.name
                                ? "bg-slate-800/10 border-slate-750 text-slate-850 font-bold"
                                : "bg-[#F8FAFC] border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350"
                            }`}
                          >
                            <IconRenderer name={icon.name} size={16} />
                            <span className="text-[9px] truncate max-w-full font-semibold">{icon.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
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
                        <span>{editingCategory ? "Save Changes" : "Create"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirmCategory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-scaleUp">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 mx-auto mb-4">
                    <Trash2 size={20} className="text-rose-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 text-center mb-1">Delete Category?</h3>
                  <p className="text-xs text-slate-500 text-center font-medium mb-5 leading-relaxed">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-slate-800">&ldquo;{deleteConfirmCategory.name}&rdquo;</span>?
                    Tasks in this category will lose their group association.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCategory(null)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-sm transition-all cursor-pointer bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        deleteMutation.mutate(deleteConfirmCategory.id);
                        setDeleteConfirmCategory(null);
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
          </div>
        )}
      </main>
    </div>
  );
}
