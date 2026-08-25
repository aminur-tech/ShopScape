"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: form,
      });
      login(data.token, data.user);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6 text-center">অ্যাকাউন্ট তৈরি করুন</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="পুরো নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input required type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input placeholder="ফোন নম্বর" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input required type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ ক্যারেক্টার)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        {error && <p className="text-sale text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
          {loading ? "..." : "রেজিস্টার করুন"}
        </button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">
        অ্যাকাউন্ট আছে? <Link href="/login" className="text-brand-600 hover:underline">লগইন করুন</Link>
      </p>
    </div>
  );
}
