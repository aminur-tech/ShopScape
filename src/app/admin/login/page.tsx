"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (data.user.role !== "ADMIN") {
        setError("এই অ্যাকাউন্টের অ্যাডমিন অ্যাক্সেস নেই");
        return;
      }
      login(data.token, data.user);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-gray-100 rounded-md p-6">
        <p className="font-bold text-brand-600 text-lg mb-1">ShopScape</p>
        <h1 className="text-sm text-gray-500 mb-6">অ্যাডমিন লগইন</h1>
        <input required type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm mb-3" />
        <input required type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm mb-3" />
        {error && <p className="text-sale text-sm mb-3">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
          {loading ? "..." : "লগইন"}
        </button>
      </form>
    </div>
  );
}
