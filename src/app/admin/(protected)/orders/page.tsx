
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatBDT, STATUS_LABELS_BN } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUSES = [
  "",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function loadOrders() {
      try {
        setLoading(true);

        const params = status
          ? `?status=${encodeURIComponent(status)}`
          : "";

        const data = await apiFetch<{ orders: Order[] }>(
          `/admin/orders${params}`,
          { token }
        );

        setOrders(data.orders ?? []);
      } catch (error) {
        console.error("Orders loading error:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token, status]);

  return (
    <div className="w-full space-y-5 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            অর্ডার
          </h1>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            সকল অর্ডার দেখুন এবং পরিচালনা করুন
          </p>
        </div>

        <div className="text-xs text-gray-500">
          মোট {orders.length} টি অর্ডার
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            htmlFor="order-status"
            className="text-sm font-medium text-gray-700"
          >
            স্ট্যাটাস
          </label>

          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-56"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? STATUS_LABELS_BN[s] : "সব স্ট্যাটাস"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500">
                <th className="px-5 py-3.5">অর্ডার নম্বর</th>
                <th className="px-5 py-3.5">গ্রাহক</th>
                <th className="px-5 py-3.5">স্ট্যাটাস</th>
                <th className="px-5 py-3.5">মোট</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <DesktopSkeleton />
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 transition last:border-0 hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900">
                        #{order.orderNumber}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-gray-600">
                        {order.fullName}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.status} />
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatBDT(order.total)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
                      >
                        দেখুন →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center"
                  >
                    <EmptyOrders />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="divide-y divide-gray-100 lg:hidden">
          {loading ? (
            <MobileSkeleton />
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="px-5 py-14">
              <EmptyOrders />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Order Card                                                          */
/* -------------------------------------------------------------------------- */

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="p-4 transition hover:bg-gray-50/60 sm:p-5">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Order Number
          </p>

          <p className="mt-1 truncate text-sm font-bold text-gray-900 sm:text-base">
            #{order.orderNumber}
          </p>
        </div>

        <OrderStatus status={order.status} />
      </div>

      {/* Customer */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="text-[11px] text-gray-400">
          গ্রাহক
        </p>

        <p className="mt-1 truncate text-sm font-medium text-gray-800">
          {order.fullName}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-gray-400">
            মোট
          </p>

          <p className="mt-0.5 text-base font-bold text-gray-900">
            {formatBDT(order.total)}
          </p>
        </div>

        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
        >
          বিস্তারিত
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

function OrderStatus({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
    PROCESSING: "bg-purple-50 text-purple-700 border-purple-100",
    SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    DELIVERED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${
        styles[status] ??
        "border-gray-100 bg-gray-50 text-gray-600"
      }`}
    >
      {STATUS_LABELS_BN[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop Skeleton                                                            */
/* -------------------------------------------------------------------------- */

function DesktopSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <tr key={item} className="border-b border-gray-50">
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-28" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="h-4 w-32" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="h-4 w-20" />
          </td>

          <td className="px-5 py-4">
            <div className="flex justify-end">
              <Skeleton className="h-8 w-16" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Skeleton                                                             */
/* -------------------------------------------------------------------------- */

function MobileSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div key={item} className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>

            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <Skeleton className="mt-4 h-14 w-full rounded-lg" />

          <div className="mt-4 flex justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-100 ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Empty                                                                       */
/* -------------------------------------------------------------------------- */

function EmptyOrders() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
        📦
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-800">
        কোনো অর্ডার পাওয়া যায়নি
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        নির্বাচিত স্ট্যাটাসের কোনো অর্ডার নেই।
      </p>
    </div>
  );
}

