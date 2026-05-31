import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Category Schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name is too long"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code (e.g. #ff0000)"),
  icon: z.string().min(1, "Icon is required"),
});

// Task Schemas
export const taskSchema = z.object({
  category_id: z.coerce.number().nullable().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    // Check if the due date is in the past
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid due date format"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TaskInput = z.infer<typeof taskSchema>;
