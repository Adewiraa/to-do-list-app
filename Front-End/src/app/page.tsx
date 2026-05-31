"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { Sparkles, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      await login(data);
    } catch (err: any) {
      setError(err || "Invalid email or password");
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800" />
        <p className="mt-4 text-xs font-bold text-slate-500">
          {isAuthenticated ? "Redirecting to dashboard..." : "Verifying session..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center flex-1 min-h-screen w-full overflow-hidden bg-[#F8FAFC] px-4">
      {/* Decorative calm background accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-slate-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-slate-100/60 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-md mb-4 animate-bounce">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to <span className="text-slate-800 font-black">TaskFlow</span>
          </h2>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            A premium client for your personal task & productivity hub.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-base font-extrabold text-slate-800 mb-6">Sign In</h3>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-650 text-xs font-semibold mb-6 animate-shake">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email-input"
                  type="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-slate-450 focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 transition-all placeholder:text-slate-400 outline-none font-semibold"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle size={12} />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-slate-455 focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm rounded-xl pl-11 pr-11 py-3 transition-all placeholder:text-slate-400 outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle size={12} />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <p className="mt-6 text-center text-xs text-slate-500 font-semibold">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-slate-800 hover:text-slate-950 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
