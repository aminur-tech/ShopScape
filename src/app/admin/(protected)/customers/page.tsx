"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";

type AdminCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
};

export default function AdminCustomersPage() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<{
          customers: AdminCustomer[];
        }>("/admin/customers", {
          token,
        });

        if (mounted) {
          setCustomers(data.customers ?? []);
        }
      } catch (err) {
        console.error("Customers error:", err);

        if (mounted) {
          setError(
            err instanceof ApiError
              ? err.message
              : "কাস্টমার লোড করতে সমস্যা হয়েছে"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="w-full space-y-5 pb-24 lg:pb-10">
      {/* ================================================================ */}
      {/* Header                                                           */}
      {/* ================================================================ */}

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          কাস্টমার
        </h1>

        <p className="text-xs text-gray-500 sm:text-sm">
          আপনার সকল কাস্টমারের তথ্য ও অর্ডার দেখুন
        </p>
      </div>

      {/* ================================================================ */}
      {/* Summary                                                           */}
      {/* ================================================================ */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            মোট কাস্টমার
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {customers.length.toLocaleString("en-BD")}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            মোট অর্ডার
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {customers
              .reduce(
                (total, customer) =>
                  total + (customer._count?.orders ?? 0),
                0
              )
              .toLocaleString("en-BD")}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-medium text-gray-500">
            Active Customers
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {customers.filter(
              (customer) => customer._count.orders > 0
            ).length.toLocaleString("en-BD")}
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Error                                                             */}
      {/* ================================================================ */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================================================ */}
      {/* Customer List                                                     */}
      {/* ================================================================ */}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Section Header */}

        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              সকল কাস্টমার
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              মোট {customers.length.toLocaleString("en-BD")} জন
            </p>
          </div>

          {loading && (
            <span className="text-xs text-gray-400">
              লোড হচ্ছে...
            </span>
          )}
        </div>

        {/* ============================================================ */}
        {/* Loading                                                       */}
        {/* ============================================================ */}

        {loading ? (
          <CustomerSkeleton />
        ) : customers.length === 0 ? (
          <EmptyCustomers />
        ) : (
          <>
            {/* ======================================================== */}
            {/* DESKTOP TABLE                                             */}
            {/* ======================================================== */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">
                      নাম
                    </th>

                    <th className="px-5 py-3">
                      ইমেইল
                    </th>

                    <th className="px-5 py-3">
                      ফোন
                    </th>

                    <th className="px-5 py-3">
                      অর্ডার
                    </th>

                    <th className="px-5 py-3">
                      যোগদানের তারিখ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50/70"
                    >
                      {/* Name */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar
                            name={customer.name}
                          />

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {customer.name}
                            </p>

                            <p className="truncate text-xs text-gray-400">
                              Customer
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}

                      <td className="px-5 py-4">
                        <span className="text-gray-600">
                          {customer.email}
                        </span>
                      </td>

                      {/* Phone */}

                      <td className="px-5 py-4 text-gray-500">
                        {customer.phone || "-"}
                      </td>

                      {/* Orders */}

                      <td className="px-5 py-4">
                        <OrderBadge
                          count={
                            customer._count?.orders ?? 0
                          }
                        />
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ======================================================== */}
            {/* MOBILE / TABLET CARDS                                    */}
            {/* ======================================================== */}

            <div className="divide-y divide-gray-100 lg:hidden">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ========================================================================== */
/* Customer Card                                                              */
/* ========================================================================== */

function CustomerCard({
  customer,
}: {
  customer: AdminCustomer;
}) {
  const orderCount = customer._count?.orders ?? 0;

  return (
    <div className="p-4 sm:p-5">
      {/* Header */}

      <div className="flex items-start gap-3">
        <CustomerAvatar
          name={customer.name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {customer.name}
            </h3>

            <OrderBadge count={orderCount} />
          </div>

          <p className="mt-1 truncate text-xs text-gray-400">
            {customer.email}
          </p>
        </div>
      </div>

      {/* Customer Information */}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Phone */}

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-400">
            ফোন
          </p>

          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {customer.phone || "-"}
          </p>
        </div>

        {/* Orders */}

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-400">
            মোট অর্ডার
          </p>

          <p className="mt-1 text-sm font-bold text-gray-900">
            {orderCount.toLocaleString("en-BD")}
          </p>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-[11px] text-gray-400">
          Joined
        </span>

        <span className="text-xs font-medium text-gray-600">
          {formatDate(customer.createdAt)}
        </span>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Customer Avatar                                                            */
/* ========================================================================== */

function CustomerAvatar({
  name,
}: {
  name: string;
}) {
  const firstLetter =
    name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 sm:h-11 sm:w-11">
      {firstLetter}
    </div>
  );
}

/* ========================================================================== */
/* Order Badge                                                                */
/* ========================================================================== */

function OrderBadge({
  count,
}: {
  count: number;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
        count > 0
          ? "bg-brand-50 text-brand-600"
          : "bg-gray-100 text-gray-500",
      ].join(" ")}
    >
      {count.toLocaleString("en-BD")} Orders
    </span>
  );
}

/* ========================================================================== */
/* Date Formatter                                                             */
/* ========================================================================== */

function formatDate(date: string) {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "-";
  }
}

/* ========================================================================== */
/* Loading Skeleton                                                           */
/* ========================================================================== */

function CustomerSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 sm:h-11 sm:w-11" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

              <div className="mt-2 h-3 w-48 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-14 animate-pulse rounded-lg bg-gray-50" />

            <div className="h-14 animate-pulse rounded-lg bg-gray-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyCustomers() {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
        👤
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-800">
        কোনো কাস্টমার নেই
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
        এখনো কোনো কাস্টমার আপনার সাইটে রেজিস্টার করেনি।
      </p>
    </div>
  );
}