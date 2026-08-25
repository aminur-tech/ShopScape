"use client";

import { useState } from "react";
import { apiFetch, ApiError, publicInvoiceUrl } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ orderNumber, phone });
      const data = await apiFetch<{ order: Order }>(`/orders/track?${params.toString()}`);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "অর্ডার খুঁজে পাওয়া যায়নি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-xl font-semibold mb-4">অর্ডার ট্র্যাকিং</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="অর্ডার নম্বর (যেমনঃ SF-20260823-1234)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="ফোন নম্বর"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        {error && <p className="text-sale text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
          {loading ? "খোঁজা হচ্ছে..." : "ট্র্যাক করুন"}
        </button>
      </form>

      {order && (
        <div className="mt-6 border border-gray-100 rounded-md p-4">
          <p className="font-semibold">{order.orderNumber}</p>
          <p className="text-brand-600 font-medium mt-1">{STATUS_LABELS_BN[order.status]}</p>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            {order.items.map((i) => (
              <p key={i.id}>{i.name} × {i.quantity}</p>
            ))}
          </div>
          <p className="mt-3 font-semibold">মোটঃ {formatBDT(order.total)}</p>
          <a
            href={publicInvoiceUrl(order.orderNumber, phone)}
            className="inline-block mt-3 text-sm text-brand-600 hover:underline"
          >
            📄 ইনভয়েস ডাউনলোড
          </a>
        </div>
      )}
    </div>
  );
}
