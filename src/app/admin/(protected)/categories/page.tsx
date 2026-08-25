"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";

type AdminCategory = { id: string; name: string; slug: string; _count: { products: number } };

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    if (!token) return;
    const data = await apiFetch<{ categories: AdminCategory[] }>("/admin/categories", { token });
    setCategories(data.categories);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/admin/categories", { method: "POST", token, body: { name } });
      setName("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "যোগ করতে সমস্যা হয়েছে");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("এই ক্যাটাগরিটি মুছে ফেলতে চান?")) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "মুছে ফেলতে সমস্যা হয়েছে");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">ক্যাটাগরি</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="নতুন ক্যাটাগরির নাম" className="rounded-md border border-gray-200 px-3 py-2 text-sm w-64" />
        <button className="rounded-md bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600">যোগ করুন</button>
      </form>
      {error && <p className="text-sale text-sm mb-4">{error}</p>}

      <table className="w-full text-sm border border-gray-100 rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2.5">নাম</th>
            <th className="text-left px-4 py-2.5">প্রোডাক্ট সংখ্যা</th>
            <th className="text-left px-4 py-2.5">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-gray-50">
              <td className="px-4 py-2.5">{c.name}</td>
              <td className="px-4 py-2.5 text-gray-500">{c._count.products}</td>
              <td className="px-4 py-2.5">
                <button onClick={() => handleDelete(c.id)} className="text-sale hover:underline">মুছুন</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
