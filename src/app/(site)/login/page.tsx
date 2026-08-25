"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function LoginPage() {
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
      login(data.token, data.user);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6 text-center">লগইন করুন</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input required type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        {error && <p className="text-sale text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
          {loading ? "..." : "লগইন"}
        </button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">
        অ্যাকাউন্ট নেই? <Link href="/register" className="text-brand-600 hover:underline">রেজিস্টার করুন</Link>
      </p>
    </div>
  );
}
