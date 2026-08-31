"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  formatBDT,
  STATUS_LABELS_BN,
} from "@/lib/format";

type MonthlyAnalytics = {
  month: string;
  monthLabel: string;
  orders: number;
  customers: number;
  revenue: number;
};

type DashboardData = {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;

  ordersByStatus: {
    status: string;
    count: number;
  }[];

  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
  }[];

  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }[];

  monthlyAnalytics: MonthlyAnalytics[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-100",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  DELIVERED: "bg-green-50 text-green-700 border-green-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

/* =========================================================
   LOADING
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-gray-100" />
        <div className="h-4 w-64 max-w-full rounded bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-8 w-32 rounded bg-gray-100" />
            <div className="mt-3 h-3 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="h-[420px] rounded-2xl border border-gray-100 bg-gray-50" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl border border-gray-100 bg-gray-50" />
        <div className="h-72 rounded-2xl border border-gray-100 bg-gray-50" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {
  const { token } = useAuth();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    setLoading(true);
    setError("");

    apiFetch<DashboardData>("/admin/dashboard", {
      token,
    })
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((err) => {
        console.error("Dashboard error:", err);

        if (mounted) {
          setError(
            "ড্যাশবোর্ডের তথ্য লোড করা যায়নি।"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">
        <p className="text-sm sm:text-base font-medium text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <p className="text-sm text-gray-500">
          কোনো ড্যাশবোর্ড তথ্য পাওয়া যায়নি।
        </p>
      </div>
    );
  }

  /* =========================================================
     SUMMARY
  ========================================================= */

  const cards = [
    {
      label: "মোট অর্ডার",
      value: data.totalOrders.toLocaleString("en-BD"),
      description: "সকল অর্ডার",
      icon: "🧾",
    },
    {
      label: "মোট কাস্টমার",
      value: data.totalCustomers.toLocaleString("en-BD"),
      description: "অর্ডার করা unique customer",
      icon: "👥",
    },
    {
      label: "মোট আয়",
      value: formatBDT(data.totalRevenue),
      description: "Cancelled বাদে",
      icon: "৳",
    },
  ];

  /* =========================================================
     MONTHLY DATA
  ========================================================= */

  const monthlyData = data.monthlyAnalytics ?? [];

  const maxOrders = Math.max(
    ...monthlyData.map((item) => item.orders),
    1
  );

  const maxCustomers = Math.max(
    ...monthlyData.map((item) => item.customers),
    1
  );

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  const monthlyTotals = monthlyData.reduce(
    (acc, item) => {
      acc.orders += item.orders;
      acc.customers += item.customers;
      acc.revenue += item.revenue;

      return acc;
    },
    {
      orders: 0,
      customers: 0,
      revenue: 0,
    }
  );

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6 pb-24 lg:pb-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            ড্যাশবোর্ড
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            ShopScape-এর ব্যবসার সারসংক্ষেপ
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
        >
          অর্ডার দেখুন
        </Link>
      </header>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="group rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">
                  {card.label}
                </p>

                <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 break-words">
                  {card.value}
                </p>

                <p className="mt-1.5 text-[11px] sm:text-xs text-gray-400">
                  {card.description}
                </p>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">
                {card.icon}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          MONTHLY ANALYTICS
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                মাসিক ব্যবসার বিশ্লেষণ
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                গত ১২ মাসের অর্ডার, কাস্টমার ও আয়
              </p>
            </div>

            <span className="w-fit rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] sm:text-xs text-gray-500">
              Last 12 Months
            </span>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4">
            <p className="text-xs text-gray-500">
              ১২ মাসে অর্ডার
            </p>

            <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900">
              {monthlyTotals.orders.toLocaleString("en-BD")}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500">
              ১২ মাসে কাস্টমার
            </p>

            <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900">
              {monthlyTotals.customers.toLocaleString("en-BD")}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500">
              ১২ মাসে আয়
            </p>

            <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900 break-words">
              {formatBDT(monthlyTotals.revenue)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="p-3 sm:p-5">
          {monthlyData.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
              কোনো মাসিক তথ্য নেই।
            </div>
          ) : (
            <div className="w-full overflow-x-auto overscroll-x-contain pb-2">
              <div
                className="relative min-w-[680px] sm:min-w-[800px]"
                style={{ height: 380 }}
              >
                {/* Grid */}
                <div className="absolute inset-x-0 top-0 bottom-12 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-gray-100"
                    />
                  ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-stretch justify-around gap-2 px-2 sm:px-4">
                  {monthlyData.map((item) => {
                    const ordersHeight = Math.max(
                      (item.orders / maxOrders) * 100,
                      item.orders > 0 ? 4 : 0
                    );

                    const customerHeight = Math.max(
                      (item.customers / maxCustomers) * 100,
                      item.customers > 0 ? 4 : 0
                    );

                    const revenueHeight = Math.max(
                      (item.revenue / maxRevenue) * 100,
                      item.revenue > 0 ? 4 : 0
                    );

                    return (
                      <div
                        key={item.month}
                        className="group relative flex min-w-10 flex-1 flex-col justify-end items-center"
                      >
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-[95px] left-1/2 z-30 w-max max-w-[180px] -translate-x-1/2 translate-y-2 rounded-xl bg-gray-900 px-3 py-2 text-[11px] text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                          <p className="font-semibold">
                            {item.monthLabel}
                          </p>

                          <p className="mt-1">
                            অর্ডার: {item.orders}
                          </p>

                          <p>
                            কাস্টমার: {item.customers}
                          </p>

                          <p>
                            আয়: {formatBDT(item.revenue)}
                          </p>
                        </div>

                        {/* Bars */}
                        <div className="flex h-[300px] items-end gap-0.5 sm:gap-1">
                          <div
                            className="w-2.5 sm:w-4 rounded-t-md bg-blue-500 transition-all duration-300 group-hover:bg-blue-600"
                            style={{
                              height: `${ordersHeight}%`,
                            }}
                          />

                          <div
                            className="w-2.5 sm:w-4 rounded-t-md bg-purple-500 transition-all duration-300 group-hover:bg-purple-600"
                            style={{
                              height: `${customerHeight}%`,
                            }}
                          />

                          <div
                            className="w-2.5 sm:w-4 rounded-t-md bg-green-500 transition-all duration-300 group-hover:bg-green-600"
                            style={{
                              height: `${revenueHeight}%`,
                            }}
                          />
                        </div>

                        <span className="mt-2 max-w-16 truncate text-[10px] sm:text-xs text-gray-500">
                          {item.monthLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span>অর্ডার</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" />
              <span>কাস্টমার</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
              <span>আয়</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATUS + STOCK
      ===================================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        {/* Order Status */}
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              অর্ডারের অবস্থা
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              সকল অর্ডারের status
            </p>
          </div>

          <div className="space-y-2">
            {data.ordersByStatus.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
                কোনো অর্ডার নেই।
              </p>
            ) : (
              data.ordersByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3"
                >
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      STATUS_STYLES[item.status] ??
                      "bg-gray-50 text-gray-600 border-gray-100"
                    }`}
                  >
                    {STATUS_LABELS_BN[item.status] ??
                      item.status}
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {item.count.toLocaleString("en-BD")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">
                স্টক স্ট্যাটাস
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                যেসব product বর্তমানে stock নেই
              </p>
            </div>

            <Link
              href="/admin/products"
              className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                সব প্রোডাক্ট বর্তমানে Stock আছে।
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-3"
                >
                  <span className="min-w-0 truncate text-sm text-gray-800">
                    {product.name}
                  </span>

                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-red-600">
                    Out of Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              সাম্প্রতিক অর্ডার
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              সর্বশেষ ৫টি অর্ডার
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="shrink-0 text-xs sm:text-sm font-medium text-brand-600 hover:underline"
          >
            সব দেখুন
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            কোনো অর্ডার নেই।
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 sm:flex sm:justify-between sm:px-5"
              >
                {/* Order info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("bn-BD")}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[10px] sm:text-xs font-medium ${
                    STATUS_STYLES[order.status] ??
                    "bg-gray-50 text-gray-600 border-gray-100"
                  }`}
                >
                  {STATUS_LABELS_BN[order.status] ??
                    order.status}
                </span>

                {/* Price */}
                <span className="col-start-2 row-start-1 text-right text-sm font-bold text-gray-900 sm:col-auto sm:row-auto">
                  {formatBDT(order.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}