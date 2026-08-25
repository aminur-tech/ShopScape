"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const PAYMENT_LABELS: Record<string, string> = {
  COD: "ক্যাশ অন ডেলিভারি",
  BKASH: "bKash",
  NAGAD: "Nagad",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function load() {
    if (token && id) {
      apiFetch<{ order: Order }>(`/admin/orders/${id}`, { token }).then((d) => setOrder(d.order)).catch(() => {});
    }
  }

  useEffect(load, [token, id]);

  async function handleStatusChange(status: string) {
    setUpdating(true);
    try {
      await apiFetch(`/admin/orders/${id}/status`, { method: "PATCH", token, body: { status } });
      load();
    } finally {
      setUpdating(false);
    }
  }

  async function handleDownloadInvoice() {
    if (!token || !order) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/admin/orders/${order.id}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে");
    } finally {
      setDownloading(false);
    }
  }

  if (!order) return <p className="text-gray-500">লোড হচ্ছে...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">{order.orderNumber}</h1>
        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="text-sm text-brand-600 hover:underline disabled:opacity-50"
        >
          📄 {downloading ? "ডাউনলোড হচ্ছে..." : "ইনভয়েস ডাউনলোড"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">{new Date(order.createdAt).toLocaleString("bn-BD")}</p>

      {order.status === "PENDING" && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            এই অর্ডারটি এখনো <span className="font-semibold">অপেক্ষমান</span> — কাস্টমারের অর্ডার প্রসেস শুরু করতে নিচে থেকে Confirm করুন।
          </p>
          <button
            disabled={updating}
            onClick={() => handleStatusChange("CONFIRMED")}
            className="rounded-md bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:opacity-50 whitespace-nowrap"
          >
            ✓ Confirm করুন
          </button>
        </div>
      )}

      <div className="border border-gray-100 rounded-md p-5 mb-6">
        <h2 className="font-semibold mb-3">স্ট্যাটাস পরিবর্তন করুন</h2>
        <p className="text-sm text-gray-500 mb-2">পরিবর্তন করলে গ্রাহককে স্বয়ংক্রিয়ভাবে ইমেইল নোটিফিকেশন পাঠানো হবে।</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                order.status === s ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 text-gray-600 hover:border-brand-500"
              }`}
            >
              {STATUS_LABELS_BN[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-md p-5">
          <h2 className="font-semibold mb-3">ডেলিভারি ঠিকানা</h2>
          <p className="text-sm">{order.fullName}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
          <p className="text-sm text-gray-500 mt-1">{order.addressLine}, {order.area}, {order.district}, {order.division}</p>
        </div>

        <div className="border border-gray-100 rounded-md p-5">
          <h2 className="font-semibold mb-3">অর্ডার আইটেম</h2>
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm mb-1.5">
              <span>{i.name} × {i.quantity}</span>
              <span>{formatBDT(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between text-sm">
            <span>ডেলিভারি চার্জ</span>
            <span>{formatBDT(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold mt-1">
            <span>মোট</span>
            <span>{formatBDT(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-md p-5 mt-6">
        <h2 className="font-semibold mb-3">পেমেন্ট তথ্য</h2>
        <p className="text-sm text-gray-600">
          পদ্ধতিঃ <span className="font-medium text-gray-800">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        </p>
        {order.paymentMethod !== "COD" && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600">
              ট্রানজেকশন আইডিঃ <span className="font-medium text-gray-800">{order.transactionId ?? "-"}</span>
            </p>
            {order.paymentProofUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-1">পেমেন্ট স্ক্রিনশটঃ</p>
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.paymentProofUrl}
                    alt="payment proof"
                    className="h-32 rounded-md border border-gray-200 hover:opacity-90"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
