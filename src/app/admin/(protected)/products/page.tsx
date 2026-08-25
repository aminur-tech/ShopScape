"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatBDT } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    if (!token) return;
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    const data = await apiFetch<{ products: Product[] }>(`/admin/products${params}`, { token });
    setProducts(data.products);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDeactivate(id: string) {
    if (!confirm("এই প্রোডাক্টটি নিষ্ক্রিয় করতে চান?")) return;
    await apiFetch(`/admin/products/${id}`, { method: "DELETE", token });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">প্রোডাক্ট</h1>
        <Link href="/admin/products/new" className="rounded-md bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600">
          + নতুন প্রোডাক্ট
        </Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="প্রোডাক্ট খুঁজুন..." className="rounded-md border border-gray-200 px-3 py-2 text-sm w-64" />
        <button className="rounded-md border border-gray-200 px-4 py-2 text-sm">খুঁজুন</button>
      </form>

      <table className="w-full text-sm border border-gray-100 rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2.5">নাম</th>
            <th className="text-left px-4 py-2.5">ক্যাটাগরি</th>
            <th className="text-left px-4 py-2.5">দাম</th>
            <th className="text-left px-4 py-2.5">স্টক</th>
            <th className="text-left px-4 py-2.5">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-gray-50">
              <td className="px-4 py-2.5">{p.name}</td>
              <td className="px-4 py-2.5 text-gray-500">{p.category?.name ?? "-"}</td>
              <td className="px-4 py-2.5">{formatBDT(p.discountPrice ?? p.price)}</td>
              <td className="px-4 py-2.5">{p.stock}</td>
              <td className="px-4 py-2.5 space-x-3">
                <Link href={`/admin/products/${p.id}`} className="text-brand-600 hover:underline">এডিট</Link>
                <button onClick={() => handleDeactivate(p.id)} className="text-sale hover:underline">নিষ্ক্রিয়</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p className="text-gray-500 mt-4">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>}
    </div>
  );
}
