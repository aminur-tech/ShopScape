"use client";

import { useState } from "react";

import {
  apiFetch,
  ApiError,
  publicInvoiceUrl,
} from "@/lib/api";

import {
  formatBDT,
  STATUS_LABELS_BN,
} from "@/lib/format";

import type {
  Order,
  OrderStatus,
} from "@/lib/types";

type DeliveryStatus = {
  key: OrderStatus;
  title: string;
  description: string;
};

const DELIVERY_STATUSES: DeliveryStatus[] = [
  {
    key: "PENDING",
    title: "অর্ডার গ্রহণ করা হয়েছে",
    description:
      "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।",
  },
  {
    key: "CONFIRMED",
    title: "অর্ডার নিশ্চিত হয়েছে",
    description:
      "আপনার অর্ডারটি নিশ্চিত করা হয়েছে।",
  },
  {
    key: "PROCESSING",
    title: "অর্ডার প্রস্তুত করা হচ্ছে",
    description:
      "আপনার পণ্য প্যাকেজিং ও পাঠানোর জন্য প্রস্তুত করা হচ্ছে।",
  },
  {
    key: "SHIPPED",
    title: "কুরিয়ারে পাঠানো হয়েছে",
    description:
      "আপনার পণ্য কুরিয়ারের কাছে হস্তান্তর করা হয়েছে।",
  },
  {
    key: "DELIVERED",
    title: "ডেলিভারি সম্পন্ন হয়েছে",
    description:
      "আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে।",
  },
];

const CANCELLED_STATUS: DeliveryStatus = {
  key: "CANCELLED",
  title: "অর্ডার বাতিল করা হয়েছে",
  description:
    "এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      });

      const data =
        await apiFetch<{ order: Order }>(
          `/orders/track?${params.toString()}`
        );

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "অর্ডার খুঁজে পাওয়া যায়নি"
      );
    } finally {
      setLoading(false);
    }
  }

  const isCancelled =
    order?.status === "CANCELLED";

  const currentStatusIndex = order
    ? DELIVERY_STATUSES.findIndex(
        (status) =>
          status.key === order.status
      )
    : -1;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-xl">
          📦
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          অর্ডার ট্র্যাকিং
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          অর্ডার নম্বর ও ফোন নম্বর দিয়ে
          আপনার অর্ডারের বর্তমান অবস্থা দেখুন।
        </p>
      </div>

      {/* ==================================================
          SEARCH FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="space-y-4">
          {/* Order Number */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              অর্ডার নম্বর
            </label>

            <input
              required
              type="text"
              value={orderNumber}
              onChange={(e) =>
                setOrderNumber(e.target.value)
              }
              placeholder="যেমন: SF-20260823-1234"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Phone */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              ফোন নম্বর
            </label>

            <input
              required
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "অর্ডার খোঁজা হচ্ছে..."
              : "অর্ডার ট্র্যাক করুন"}
          </button>
        </div>
      </form>

      {/* ==================================================
          ORDER RESULT
      ================================================== */}

      {order && (
        <div className="mt-6 space-y-5">
          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  অর্ডার নম্বর
                </p>

                <p className="mt-1 break-all text-base font-bold text-gray-900">
                  {order.orderNumber}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isCancelled
                    ? "bg-red-50 text-red-600"
                    : "bg-brand-50 text-brand-600"
                }`}
              >
                {STATUS_LABELS_BN[
                  order.status
                ] || order.status}
              </span>
            </div>

            {/* Customer */}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <div>
                <p className="text-[11px] text-gray-400">
                  কাস্টমার
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {order.fullName}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-gray-400">
                  ফোন
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {order.phone}
                </p>
              </div>
            </div>

            {/* Items */}

            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                অর্ডার করা পণ্য
              </p>

              <div className="space-y-3">
                {order.items.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      {/* Product Image */}

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                        {item.selectedImageUrl ? (
                          <img
                            src={
                              item.selectedImageUrl
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg text-gray-300">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Details */}

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>

                        {/* Size */}

                        {item.selectedSize && (
                          <p className="mt-1 text-xs text-gray-500">
                            সাইজ:{" "}
                            <span className="font-medium text-gray-700">
                              {
                                item.selectedSize
                              }
                            </span>
                          </p>
                        )}

                        {/* Color */}

                        {item.selectedColor && (
                          <p className="mt-1 text-xs text-gray-500">
                            কালার:{" "}
                            <span className="font-medium text-gray-700">
                              {
                                item.selectedColor
                              }
                            </span>
                          </p>
                        )}

                        {/* Quantity */}

                        <p className="mt-1 text-xs text-gray-500">
                          পরিমাণ:{" "}
                          <span className="font-medium text-gray-700">
                            {item.quantity}
                          </span>
                        </p>
                      </div>

                      {/* Price */}

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatBDT(
                            Number(
                              item.price
                            ) *
                              item.quantity
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatBDT(
                            Number(
                              item.price
                            )
                          )}{" "}
                          / পিস
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Price Breakdown */}

            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  পণ্যের মূল্য
                </span>

                <span className="font-medium text-gray-800">
                  {formatBDT(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  ডেলিভারি চার্জ
                </span>

                <span className="font-medium text-gray-800">
                  {formatBDT(
                    order.deliveryFee
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-gray-700">
                  সর্বমোট
                </span>

                <span className="text-xl font-bold text-gray-900">
                  {formatBDT(
                    order.total
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              CANCELLED STATUS
          ================================================== */}

          {isCancelled ? (
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-lg">
                  ✕
                </div>

                <div>
                  <h2 className="text-base font-bold text-red-600">
                    {CANCELLED_STATUS.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {
                      CANCELLED_STATUS.description
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================
                DELIVERY TIMELINE
            ================================================== */

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  ডেলিভারি স্ট্যাটাস
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  আপনার অর্ডারের প্রতিটি ধাপ
                </p>
              </div>

              <div className="mt-6">
                {DELIVERY_STATUSES.map(
                  (
                    status,
                    index
                  ) => {
                    const completed =
                      currentStatusIndex >=
                      index;

                    const current =
                      currentStatusIndex ===
                      index;

                    const last =
                      index ===
                      DELIVERY_STATUSES.length -
                        1;

                    return (
                      <div
                        key={
                          status.key
                        }
                        className="relative flex gap-4"
                      >
                        {/* Connector */}

                        {!last && (
                          <div
                            className={`absolute left-[11px] top-7 h-[calc(100%-4px)] w-0.5 ${
                              currentStatusIndex >
                              index
                                ? "bg-brand-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                        {/* Status Icon */}

                        <div
                          className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                            completed
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-gray-200 bg-white text-gray-300"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : ""}
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1 pb-7">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                current
                                  ? "text-brand-600"
                                  : completed
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {
                                status.title
                              }
                            </p>

                            {current && (
                              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                                বর্তমান
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-1 text-xs leading-5 ${
                              current
                                ? "text-gray-600"
                                : completed
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {
                              status.description
                            }
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* ==================================================
                  COURIER TRACKING
              ================================================== */}

              {order.courierTrackingUrl && (
                <div className="mt-1 border-t border-gray-100 pt-4">
                  <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                        🚚
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          কুরিয়ার ট্র্যাকিং
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          আপনার পার্সেল কোথায় আছে তা জানতে
                          কুরিয়ারের tracking link ব্যবহার করুন।
                        </p>

                        <a
                          href={
                            order.courierTrackingUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-600"
                        >
                          🚚 কুরিয়ার ট্র্যাক করুন
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              INVOICE
          ================================================== */}

          <a
            href={publicInvoiceUrl(
              order.orderNumber,
              phone.trim()
            )}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <span>📄</span>

            <span>
              ইনভয়েস ডাউনলোড করুন
            </span>
          </a>
        </div>
      )}
    </div>
  );
}