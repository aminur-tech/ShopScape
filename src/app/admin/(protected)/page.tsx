"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

/* =========================================================
   STATUS COLORS
========================================================= */

const STATUS_STYLES: Record<
  string,
  string
> = {
  PENDING:
    "bg-yellow-50 text-yellow-700",

  CONFIRMED:
    "bg-blue-50 text-blue-700",

  PROCESSING:
    "bg-purple-50 text-purple-700",

  SHIPPED:
    "bg-indigo-50 text-indigo-700",

  DELIVERED:
    "bg-green-50 text-green-700",

  CANCELLED:
    "bg-red-50 text-red-700",
};

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

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    setLoading(true);
    setError("");

    apiFetch<DashboardData>(
      "/admin/dashboard",
      {
        token,
      }
    )
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((err) => {
        console.error(
          "Dashboard error:",
          err
        );

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-gray-100 rounded animate-pulse" />

          <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border border-gray-100 rounded-xl p-5"
            >
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />

              <div className="h-8 w-32 bg-gray-100 rounded mt-3 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-80 border border-gray-100 rounded-xl bg-gray-50 animate-pulse" />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="border border-red-100 bg-red-50 rounded-xl p-6">
        <p className="text-red-600 font-medium">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!data) {
    return (
      <div className="border border-gray-100 rounded-xl p-6">
        <p className="text-gray-500">
          কোনো ড্যাশবোর্ড তথ্য পাওয়া যায়নি।
        </p>
      </div>
    );
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  const cards = [
    {
      label: "মোট অর্ডার",
      value: data.totalOrders.toLocaleString(
        "en-BD"
      ),
      description:
        "সকল অর্ডার",
    },

    {
      label: "মোট কাস্টমার",
      value:
        data.totalCustomers.toLocaleString(
          "en-BD"
        ),
      description:
        "অর্ডার করা unique customer",
    },

    {
      label: "মোট আয়",
      value: formatBDT(
        data.totalRevenue
      ),
      description:
        "Cancelled বাদে",
    },
  ];

  /* =======================================================
     CHART DATA
  ======================================================= */

  const monthlyData =
    data.monthlyAnalytics ?? [];

  const maxOrders = Math.max(
    ...monthlyData.map(
      (item) => item.orders
    ),
    1
  );

  const maxCustomers = Math.max(
    ...monthlyData.map(
      (item) => item.customers
    ),
    1
  );

  const maxRevenue = Math.max(
    ...monthlyData.map(
      (item) => item.revenue
    ),
    1
  );

  /* =======================================================
     TOTALS FOR LAST 12 MONTHS
  ======================================================= */

  const monthlyTotals =
    monthlyData.reduce(
      (acc, item) => {
        acc.orders += item.orders;

        acc.customers +=
          item.customers;

        acc.revenue += item.revenue;

        return acc;
      },
      {
        orders: 0,
        customers: 0,
        revenue: 0,
      }
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 pb-10">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ড্যাশবোর্ড
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            ShopScape-এর ব্যবসার সারসংক্ষেপ
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          অর্ডার দেখুন
        </Link>
      </div>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {card.label}
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {card.value}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* ===================================================
          MONTHLY ANALYTICS
      =================================================== */}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}

        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                মাসিক ব্যবসার বিশ্লেষণ
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                গত ১২ মাসের অর্ডার, কাস্টমার ও আয়
              </p>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              Last 12 Months
            </div>
          </div>
        </div>

        {/* =================================================
            MINI TOTALS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100">
          <div className="p-4 sm:border-r border-gray-100">
            <p className="text-xs text-gray-500">
              ১২ মাসে অর্ডার
            </p>

            <p className="text-xl font-bold text-gray-900 mt-1">
              {monthlyTotals.orders.toLocaleString(
                "en-BD"
              )}
            </p>
          </div>

          <div className="p-4 sm:border-r border-gray-100">
            <p className="text-xs text-gray-500">
              ১২ মাসে কাস্টমার
            </p>

            <p className="text-xl font-bold text-gray-900 mt-1">
              {monthlyTotals.customers.toLocaleString(
                "en-BD"
              )}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500">
              ১২ মাসে আয়
            </p>

            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatBDT(
                monthlyTotals.revenue
              )}
            </p>
          </div>
        </div>

        {/* =================================================
            CHART
        ================================================= */}

        <div className="p-5">
          <div className="overflow-x-auto">
            <div
              className="min-w-[900px]"
              style={{
                height: 390,
              }}
            >
              {/* Chart area */}

              <div className="relative h-[330px]">
                {/* Grid */}

                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map(
                    (line) => (
                      <div
                        key={line}
                        className="border-t border-dashed border-gray-100"
                      />
                    )
                  )}
                </div>

                {/* Bars */}

                <div className="absolute inset-0 flex items-end justify-around gap-3 px-4">
                  {monthlyData.map(
                    (item) => {
                      const ordersHeight =
                        Math.max(
                          (item.orders /
                            maxOrders) *
                            100,
                          item.orders > 0
                            ? 4
                            : 0
                        );

                      const customerHeight =
                        Math.max(
                          (item.customers /
                            maxCustomers) *
                            100,
                          item.customers > 0
                            ? 4
                            : 0
                        );

                      const revenueHeight =
                        Math.max(
                          (item.revenue /
                            maxRevenue) *
                            100,
                          item.revenue > 0
                            ? 4
                            : 0
                        );

                      return (
                        <div
                          key={item.month}
                          className="flex-1 h-full flex flex-col justify-end items-center group"
                        >
                          {/* Tooltip */}

                          <div className="opacity-0 group-hover:opacity-100 transition absolute -translate-y-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-20 whitespace-nowrap">
                            <div>
                              {item.monthLabel}
                            </div>

                            <div className="mt-1">
                              অর্ডার:{" "}
                              {
                                item.orders
                              }
                            </div>

                            <div>
                              কাস্টমার:{" "}
                              {
                                item.customers
                              }
                            </div>

                            <div>
                              আয়:{" "}
                              {formatBDT(
                                item.revenue
                              )}
                            </div>
                          </div>

                          {/* Bars */}

                          <div className="h-[290px] flex items-end gap-1">
                            {/* Orders */}

                            <div
                              className="w-3 sm:w-4 bg-blue-500 rounded-t-md transition-all duration-300 group-hover:bg-blue-600"
                              style={{
                                height: `${ordersHeight}%`,
                              }}
                              title={`অর্ডার: ${item.orders}`}
                            />

                            {/* Customers */}

                            <div
                              className="w-3 sm:w-4 bg-purple-500 rounded-t-md transition-all duration-300 group-hover:bg-purple-600"
                              style={{
                                height: `${customerHeight}%`,
                              }}
                              title={`কাস্টমার: ${item.customers}`}
                            />

                            {/* Revenue */}

                            <div
                              className="w-3 sm:w-4 bg-green-500 rounded-t-md transition-all duration-300 group-hover:bg-green-600"
                              style={{
                                height: `${revenueHeight}%`,
                              }}
                              title={`আয়: ${formatBDT(
                                item.revenue
                              )}`}
                            />
                          </div>

                          {/* Month */}

                          <div className="mt-3 text-xs text-gray-500 whitespace-nowrap">
                            {
                              item.monthLabel
                            }
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Legend */}

              <div className="flex justify-center gap-6 text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-500" />

                  <span>অর্ডার</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-purple-500" />

                  <span>কাস্টমার</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-green-500" />

                  <span>আয়</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          STATUS + STOCK
      =================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                অর্ডারের অবস্থা
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                সকল অর্ডারের status
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {data.ordersByStatus.length ===
            0 ? (
              <p className="text-sm text-gray-400">
                কোনো অর্ডার নেই।
              </p>
            ) : (
              data.ordersByStatus.map(
                (item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-lg border border-gray-50 px-3 py-2.5"
                  >
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_STYLES[
                          item.status
                        ] ??
                        "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS_BN[
                        item.status
                      ] ??
                        item.status}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {item.count.toLocaleString(
                        "en-BD"
                      )}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* =================================================
            STOCK
        ================================================= */}

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                স্টক স্ট্যাটাস
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                যেসব product বর্তমানে stock নেই
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-xs text-brand-600 hover:underline"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>

          {data.lowStockProducts
            .length === 0 ? (
            <div className="rounded-lg bg-green-50 border border-green-100 p-4">
              <p className="text-sm font-medium text-green-700">
                সব প্রোডাক্ট বর্তমানে Stock আছে।
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border border-red-50 bg-red-50/40 rounded-lg px-3 py-2.5"
                  >
                    <span className="text-sm text-gray-800">
                      {product.name}
                    </span>

                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          RECENT ORDERS
      =================================================== */}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">
              সাম্প্রতিক অর্ডার
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              সর্বশেষ ৫টি অর্ডার
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm text-brand-600 hover:underline"
          >
            সব দেখুন
          </Link>
        </div>

        {data.recentOrders.length ===
        0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            কোনো অর্ডার নেই।
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recentOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "bn-BD"
                      )}
                    </p>
                  </div>

                  <span
                    className={`w-fit text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[
                        order.status
                      ] ??
                      "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS_BN[
                      order.status
                    ] ??
                      order.status}
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {formatBDT(
                      order.total
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}