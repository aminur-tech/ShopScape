"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/* =========================================================
   TYPES
========================================================= */

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedImageUrl?: string | null;
}

interface OrderData {
  id?: string;
  orderNumber: string;
  createdAt: string;
  phone: string;
  fullName: string;

  division?: string | null;
  district?: string | null;
  area?: string | null;
  addressLine?: string | null;

  paymentMethod: string;
  transactionId?: string | null;

  subtotal?: number;
  deliveryFee?: number;
  total: number;

  items: OrderItem[];
}

/* =========================================================
   COMPONENT
========================================================= */

function InvoiceContent() {
  const searchParams = useSearchParams();

  const orderNumber =
    searchParams.get("orderNumber") ?? "";

  const phone =
    searchParams.get("phone") ?? "";

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /* =======================================================
     FETCH ORDER
  ======================================================= */

  useEffect(() => {
    if (!orderNumber || !phone) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(false);

        const params = new URLSearchParams({
          orderNumber,
          phone,
        });

        const res = await fetch(
          `${API_URL}/orders/track?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Order not found");
        }

        const data = await res.json();

        /*
         * Backend response may be:
         *
         * {
         *   data: {
         *     orderNumber: "...",
         *     fullName: "...",
         *     ...
         *   }
         * }
         *
         * OR:
         *
         * {
         *   orderNumber: "...",
         *   fullName: "...",
         *   ...
         * }
         */

        const orderData =
          data?.data ?? data;

        if (!orderData) {
          throw new Error(
            "Order data not found"
          );
        }

        console.log(
          "[invoice] Order response:",
          data
        );

        console.log(
          "[invoice] Normalized order:",
          orderData
        );

        if (!cancelled) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error(
          "[invoice] Fetch order failed:",
          error
        );

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, phone]);

  /* =======================================================
     INVALID
  ======================================================= */

  if (!orderNumber || !phone || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-7 w-7 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Invoice Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Order number অথবা phone number পাওয়া যায়নি।
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />

          <p className="text-sm text-gray-500">
            Loading invoice...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     SAFETY
  ======================================================= */

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">
          Invoice data not found.
        </p>
      </main>
    );
  }

  /* =======================================================
     INVOICE URL
  ======================================================= */

  const downloadParams =
    new URLSearchParams({
      orderNumber,
      phone,
    });

  const downloadUrl =
    `${API_URL}/orders/track/invoice?${downloadParams.toString()}`;

  /* =======================================================
     ADDRESS
  ======================================================= */

  const address = [
    order.division,
    order.district,
    order.area,
    order.addressLine,
  ]
    .filter(Boolean)
    .join(" > ");

  /* =======================================================
     PAYMENT
  ======================================================= */

  const paymentLabel =
    order.paymentMethod === "BKASH"
      ? "bKash"
      : order.paymentMethod === "NAGAD"
      ? "Nagad"
      : "Cash on Delivery";

  /* =======================================================
     DATE
  ======================================================= */

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(
        "en-BD",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "N/A";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-6 sm:px-5">
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }

          header,
          .no-print {
            display: none !important;
          }

          .invoice-card {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-3xl">

        {/* =====================================================
            HEADER ACTIONS
        ===================================================== */}

        <header className="no-print mb-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Order Invoice
            </h1>

            <p className="text-xs text-gray-500">
              Order ID:{" "}
              <span className="font-semibold">
                {order.orderNumber}
              </span>
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">

            {/* PRINT */}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
            >
              Print Invoice
            </button>

            {/* DOWNLOAD */}

            <a
              href={downloadUrl}
              download={`invoice-${order.orderNumber}.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:flex-none"
            >
              Download PDF
            </a>
          </div>
        </header>

        {/* =====================================================
            INVOICE CARD
        ===================================================== */}

        <section className="invoice-card rounded-2xl border border-gray-200 bg-[#F5F6FF] p-6 shadow-sm sm:p-10">

          <div className="mx-auto rounded-xl border border-[#E2E4EC] bg-white p-6 sm:p-8">

            {/* =================================================
                INVOICE HEADER
            ================================================= */}

            <div className="text-center">

              <h2 className="text-xl font-extrabold tracking-wider text-[#7B3FA0]">
                INVOICE
              </h2>

              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5A00] text-2xl font-black text-white">
                S
              </div>

              <h3 className="text-lg font-bold text-[#171717]">
                ShopScape
              </h3>

              <p className="text-xs text-[#777777]">
                Mohammadpur, Dhaka, Bangladesh
              </p>
            </div>

            <hr className="my-6 border-[#E2E4EC]" />

            {/* =================================================
                ORDER INFORMATION
            ================================================= */}

            <div className="space-y-2 text-sm text-[#171717]">

              {/* ORDER ID */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Order ID
                </span>

                <span className="min-w-0 break-all">
                  : {order.orderNumber || "N/A"}
                </span>
              </div>

              {/* DATE */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Date
                </span>

                <span>
                  : {formattedDate}
                </span>
              </div>

              {/* MOBILE */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Mobile
                </span>

                <span>
                  : {order.phone || "N/A"}
                </span>
              </div>

              {/* NAME */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Name
                </span>

                <span className="min-w-0 break-words">
                  : {order.fullName || "N/A"}
                </span>
              </div>

              {/* ADDRESS */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Address
                </span>

                <span className="min-w-0 break-words">
                  : {address || "N/A"}
                </span>
              </div>

              {/* PAYMENT */}

              <div className="flex">
                <span className="w-24 shrink-0 font-medium text-gray-600">
                  Payment
                </span>

                <span>
                  : {paymentLabel}
                </span>
              </div>

              {/* TRANSACTION ID */}

              {order.transactionId && (
                <div className="flex">
                  <span className="w-24 shrink-0 font-medium text-gray-600">
                    Txn ID
                  </span>

                  <span className="min-w-0 break-all">
                    : {order.transactionId}
                  </span>
                </div>
              )}

              {/* SUBTOTAL */}

              {order.subtotal !== undefined && (
                <div className="flex">
                  <span className="w-24 shrink-0 font-medium text-gray-600">
                    Subtotal
                  </span>

                  <span>
                    : ৳
                    {Number(
                      order.subtotal
                    ).toLocaleString("en-BD")}
                  </span>
                </div>
              )}

              {/* DELIVERY */}

              {order.deliveryFee !== undefined && (
                <div className="flex">
                  <span className="w-24 shrink-0 font-medium text-gray-600">
                    Delivery
                  </span>

                  <span>
                    : ৳
                    {Number(
                      order.deliveryFee
                    ).toLocaleString("en-BD")}
                  </span>
                </div>
              )}

              {/* TOTAL */}

              <div className="flex font-bold text-[#FF2E88]">
                <span className="w-24 shrink-0">
                  Total
                </span>

                <span>
                  : ৳
                  {Number(
                    order.total ?? 0
                  ).toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            {/* =================================================
                ITEMS TABLE
            ================================================= */}

            <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E4EC]">

              <table className="w-full text-left text-xs">

                <thead className="border-b border-[#E2E4EC] bg-[#FAFAFC] text-gray-700">
                  <tr>
                    <th className="w-20 p-3">
                      Image
                    </th>

                    <th className="p-3">
                      Product
                    </th>

                    <th className="w-24 p-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2E4EC]">

                  {order.items &&
                  order.items.length > 0 ? (
                    order.items.map(
                      (item) => (
                        <tr key={item.id}>

                          {/* IMAGE */}

                          <td className="p-3">
                            {item.selectedImageUrl ? (
                              <img
                                src={
                                  item.selectedImageUrl
                                }
                                alt={
                                  item.name
                                }
                                className="h-14 w-14 rounded-md border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400">
                                No Image
                              </div>
                            )}
                          </td>

                          {/* PRODUCT */}

                          <td className="p-3">

                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>

                            {item.selectedSize && (
                              <p className="text-gray-500">
                                Size:{" "}
                                {
                                  item.selectedSize
                                }
                              </p>
                            )}

                            {item.selectedColor && (
                              <p className="text-gray-500">
                                Color:{" "}
                                {
                                  item.selectedColor
                                }
                              </p>
                            )}

                            <p className="text-gray-500">
                              Quantity:{" "}
                              {
                                item.quantity
                              }
                            </p>

                            <p className="text-gray-500">
                              Unit Price: ৳
                              {Number(
                                item.price
                              ).toLocaleString(
                                "en-BD"
                              )}
                            </p>
                          </td>

                          {/* ITEM TOTAL */}

                          <td className="p-3 text-right font-bold text-[#FF2E88]">
                            ৳
                            {(
                              Number(
                                item.price
                              ) *
                              Number(
                                item.quantity
                              )
                            ).toLocaleString(
                              "en-BD"
                            )}
                          </td>

                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-5 text-center text-gray-400"
                      >
                        No product details found
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* =================================================
                THANK YOU
            ================================================= */}

            <p className="mt-8 text-center text-xs text-gray-700">
              প্রিয়{" "}
              {order.fullName ||
                "Customer"}
              , আপনার অর্ডারের জন্য ধন্যবাদ।
            </p>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="mt-4 text-center text-[10px] text-gray-400">
            ShopScape • Invoice{" "}
            {order.orderNumber}
          </p>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />

            <p className="text-sm text-gray-500">
              Loading invoice...
            </p>
          </div>
        </main>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}