"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  formatBDT,
  STATUS_LABELS_BN,
} from "@/lib/format";

import type {
  Order,
  OrderStatus,
} from "@/lib/types";

/* =========================================================
   Constants
========================================================= */

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_LABELS: Record<string, string> = {
  COD: "ক্যাশ অন ডেলিভারি",
  BKASH: "bKash",
  NAGAD: "Nagad",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/* =========================================================
   Helpers
========================================================= */

function isValidUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PROCESSING":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "SHIPPED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

/* =========================================================
   Component
========================================================= */

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { token } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [savingTracking, setSavingTracking] =
    useState(false);

  const [adminMessage, setAdminMessage] =
    useState("");

  const [savingMessage, setSavingMessage] =
    useState(false);

  const [messageSuccess, setMessageSuccess] =
    useState("");

  const [trackingSuccess, setTrackingSuccess] =
    useState("");

  /* =======================================================
     Load Order
  ======================================================= */

  const loadOrder = useCallback(async () => {
    if (!token || !id) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<{ order: Order }>(
        `/admin/orders/${id}`,
        {
          token,
        }
      );

      setOrder(data.order);

      setTrackingUrl(
        data.order.courierTrackingUrl ?? ""
      );

      setAdminMessage(
        data.order.adminMessage ?? ""
      );
    } catch (err) {
      console.error(err);

      setError(
        "অর্ডারের তথ্য লোড করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* =======================================================
     Status Change
  ======================================================= */

  async function handleStatusChange(
    status: OrderStatus
  ) {
    if (!token || !id || !order) return;

    if (status === order.status) return;

    const confirmed = window.confirm(
      `অর্ডারটির স্ট্যাটাস "${STATUS_LABELS_BN[status]}" করতে চান?`
    );

    if (!confirmed) return;

    setUpdating(true);

    try {
      const data = await apiFetch<{ order: Order }>(
        `/admin/orders/${id}/status`,
        {
          method: "PATCH",
          token,
          body: {
            status,
          },
        }
      );

      setOrder(data.order);
    } catch (err) {
      console.error(err);

      alert(
        "অর্ডারের স্ট্যাটাস পরিবর্তন করা যায়নি।"
      );
    } finally {
      setUpdating(false);
    }
  }

  /* =======================================================
     Save Courier Tracking URL
     
     Requires backend:
     PATCH /admin/orders/:id/tracking
  ======================================================= */

  async function handleSaveTracking() {
    if (!token || !id) return;

    const value = trackingUrl.trim();

    if (value && !isValidUrl(value)) {
      alert(
        "সঠিক Courier Tracking URL দিন।"
      );

      return;
    }

    setSavingTracking(true);
    setTrackingSuccess("");

    try {
      const data = await apiFetch<{ order: Order }>(
        `/admin/orders/${id}/tracking`,
        {
          method: "PATCH",
          token,
          body: {
            courierTrackingUrl:
              value || null,
          },
        }
      );

      setOrder(data.order);

      setTrackingUrl(
        data.order.courierTrackingUrl ?? ""
      );

      setTrackingSuccess(
        "Courier tracking link সফলভাবে সংরক্ষণ হয়েছে।"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Tracking link সংরক্ষণ করা যায়নি।"
      );
    } finally {
      setSavingTracking(false);
    }
  }

  /* =======================================================
     Save Admin Message
     
     Requires backend:
     PATCH /admin/orders/:id/message
  ======================================================= */

  async function handleSaveMessage() {
    if (!token || !id) return;

    const value = adminMessage.trim();

    if (!value) {
      alert(
        "Customer message লিখুন।"
      );

      return;
    }

    setSavingMessage(true);
    setMessageSuccess("");

    try {
      const data = await apiFetch<{ order: Order }>(
        `/admin/orders/${id}/message`,
        {
          method: "PATCH",
          token,
          body: {
            adminMessage: value,
          },
        }
      );

      setOrder(data.order);

      setAdminMessage(
        data.order.adminMessage ?? value
      );

      setMessageSuccess(
        "Customer message সফলভাবে সংরক্ষণ হয়েছে।"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Customer message সংরক্ষণ করা যায়নি।"
      );
    } finally {
      setSavingMessage(false);
    }
  }

  /* =======================================================
     Invoice
  ======================================================= */

  async function handleDownloadInvoice() {
    if (!token || !order) return;

    setDownloading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${order.id}/invoice`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Invoice download failed"
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `invoice-${order.orderNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      alert(
        "ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে।"
      );
    } finally {
      setDownloading(false);
    }
  }

  /* =======================================================
     Derived Data
  ======================================================= */

  const itemCount = useMemo(() => {
    if (!order) return 0;

    return order.items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [order]);

  const paymentLabel =
    order
      ? PAYMENT_LABELS[
          order.paymentMethod
        ] ??
        order.paymentMethod
      : "";

  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 rounded bg-gray-100 animate-pulse" />

        <div className="grid lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>

        <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  /* =======================================================
     Error
  ======================================================= */

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          অর্ডার পাওয়া যায়নি
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error ||
            "এই অর্ডারের তথ্য পাওয়া যায়নি।"}
        </p>

        <button
          onClick={loadOrder}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="max-w-6xl space-y-6 pb-12">

      {/* ===================================================
          Header
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Orders
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                order.status
              )}`}
            >
              {STATUS_LABELS_BN[
                order.status
              ] ?? order.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {new Date(
              order.createdAt
            ).toLocaleString("bn-BD")}
          </p>
        </div>

        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          📄

          {downloading
            ? "Invoice তৈরি হচ্ছে..."
            : "Invoice Download"}
        </button>
      </div>

      {/* ===================================================
          Summary Cards
      =================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            মোট আইটেম
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {itemCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Delivery Charge
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatBDT(
              order.deliveryFee
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Order Total
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatBDT(order.total)}
          </p>
        </div>

      </div>

      {/* ===================================================
          Previous Return Warning
      =================================================== */}

      {order.returnConfirmationRequired && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

          <div className="flex gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
              ⚠️
            </div>

            <div>
              <h2 className="font-semibold text-orange-900">
                Previous Return — Confirmation Required
              </h2>

              <p className="mt-1 text-sm leading-6 text-orange-800">
                এই customer পূর্বে একটি order
                return করেছে। তাই নতুন order
                confirm করার আগে delivery charge
                payment/confirmation নেওয়া প্রয়োজন।
              </p>

              <div className="mt-3 rounded-lg border border-orange-200 bg-white p-4">

                <p className="text-sm font-semibold text-gray-900">
                  Customer-কে যে নির্দেশনা দেওয়া যাবে:
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  আপনার পূর্ববর্তী অর্ডারটি return
                  হওয়ার কারণে নতুন অর্ডারটি
                  confirm করার আগে delivery charge
                  payment করতে হবে। Payment করার পর
                  Transaction ID আমাদের পাঠালে আমরা
                  আপনার order confirm করে দেব।
                </p>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          Status Management
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-gray-900">
            Order Status
          </h2>

          <p className="text-sm text-gray-500">
            Status পরিবর্তন করলে customer-কে
            notification/email পাঠানো হবে।
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">

          {STATUSES.map((status) => {
            const active =
              order.status === status;

            return (
              <button
                key={status}
                disabled={
                  updating || active
                }
                onClick={() =>
                  handleStatusChange(
                    status
                  )
                }
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {STATUS_LABELS_BN[
                  status
                ] ?? status}
              </button>
            );
          })}

        </div>

        {order.status === "PENDING" && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-medium text-amber-900">
                এই অর্ডারটি এখনো Confirm করা হয়নি।
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Customer-এর তথ্য যাচাই করে
                Confirm করুন।
              </p>
            </div>

            <button
              disabled={updating}
              onClick={() =>
                handleStatusChange(
                  "CONFIRMED"
                )
              }
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              ✓ Confirm Order
            </button>

          </div>
        )}

      </section>

      {/* ===================================================
          Customer + Delivery
      =================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Customer */}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <h2 className="font-semibold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-5 space-y-4">

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Name
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {order.fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Phone
              </p>

              <a
                href={`tel:${order.phone}`}
                className="mt-1 block text-sm font-medium text-blue-600 hover:underline"
              >
                {order.phone}
              </a>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Delivery Address
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-700">
                {order.addressLine},{" "}
                {order.area},{" "}
                {order.district},{" "}
                {order.division}
              </p>
            </div>

          </div>
        </section>

        {/* Payment */}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <h2 className="font-semibold text-gray-900">
            Payment Information
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-500">
                Payment Method
              </span>

              <span className="text-sm font-semibold text-gray-900">
                {paymentLabel}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-500">
                Transaction ID
              </span>

              <span className="text-sm font-semibold text-gray-900">
                {order.transactionId ??
                  "—"}
              </span>
            </div>

            {order.paymentMethod !==
              "COD" &&
              order.paymentProofUrl && (
                <div>

                  <p className="mb-2 text-sm text-gray-500">
                    Payment Screenshot
                  </p>

                  <a
                    href={
                      order.paymentProofUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        order.paymentProofUrl
                      }
                      alt="Payment proof"
                      className="h-40 w-auto rounded-lg border border-gray-200 object-cover transition hover:opacity-90"
                    />
                  </a>

                </div>
              )}

          </div>

        </section>

      </div>

      {/* ===================================================
          Courier Tracking
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div>
          <h2 className="font-semibold text-gray-900">
            Courier Tracking
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customer যেন নিজের order-এর courier
            location/status দেখতে পারে।
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          <input
            type="url"
            value={trackingUrl}
            onChange={(e) =>
              setTrackingUrl(
                e.target.value
              )
            }
            placeholder="https://courier.com/track/..."
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />

          <button
            onClick={
              handleSaveTracking
            }
            disabled={savingTracking}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savingTracking
              ? "Saving..."
              : "Save Tracking"}
          </button>

        </div>

        {trackingSuccess && (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            ✓ {trackingSuccess}
          </p>
        )}

        {order.courierTrackingUrl && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">

            <p className="text-xs font-medium text-gray-500">
              Current Tracking Link
            </p>

            <a
              href={
                order.courierTrackingUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
            >
              {order.courierTrackingUrl}
            </a>

          </div>
        )}

      </section>

      {/* ===================================================
          Customer Message
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div>
          <h2 className="font-semibold text-gray-900">
            Customer Message
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customer-কে বিশেষ কোনো নির্দেশনা,
            delivery information অথবা payment
            confirmation message দিতে পারবেন।
          </p>
        </div>

        <textarea
          value={adminMessage}
          onChange={(e) =>
            setAdminMessage(
              e.target.value
            )
          }
          rows={6}
          maxLength={1000}
          placeholder={`উদাহরণ:

আপনার অর্ডারটি confirm করার জন্য delivery charge payment করতে হবে।

bKash: 01327694078
Nagad: 01327694078

Payment করার পর Transaction ID আমাদের পাঠান।`}
          className="mt-5 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <span className="text-xs text-gray-400">
            {adminMessage.length}/1000
          </span>

          <button
            onClick={
              handleSaveMessage
            }
            disabled={savingMessage}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savingMessage
              ? "Saving..."
              : "Save Customer Message"}
          </button>

        </div>

        {messageSuccess && (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            ✓ {messageSuccess}
          </p>
        )}

      </section>

      {/* ===================================================
          Payment Guide
      =================================================== */}

      {order.returnConfirmationRequired && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">

          <h2 className="font-semibold text-blue-900">
            Delivery Charge Payment Guide
          </h2>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Previous return customer হলে order
            confirmation-এর আগে delivery charge
            payment নেওয়ার জন্য এই guide ব্যবহার
            করতে পারেন।
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* bKash */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <h3 className="font-bold text-gray-900">
                bKash Payment
              </h3>

              <ol className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  1. bKash App খুলুন
                </li>

                <li>
                  2. Send Money নির্বাচন করুন
                </li>

                <li>
                  3. নিচের নম্বরে payment করুন
                </li>

                <li>
                  4. Transaction ID সংগ্রহ করুন
                </li>

                <li>
                  5. আমাদেরকে Transaction ID পাঠান
                </li>
              </ol>

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  bKash Number
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  01327694078
                </p>
              </div>

            </div>

            {/* Nagad */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <h3 className="font-bold text-gray-900">
                Nagad Payment
              </h3>

              <ol className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  1. Nagad App খুলুন
                </li>

                <li>
                  2. Send Money নির্বাচন করুন
                </li>

                <li>
                  3. নিচের নম্বরে payment করুন
                </li>

                <li>
                  4. Transaction ID সংগ্রহ করুন
                </li>

                <li>
                  5. আমাদেরকে Transaction ID পাঠান
                </li>
              </ol>

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Nagad Number
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  01327694078
                </p>
              </div>

            </div>

          </div>

          <div className="mt-5 rounded-lg border border-blue-200 bg-white p-4">

            <p className="text-sm font-semibold text-gray-900">
              Customer Message Template
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
{`প্রিয় কাস্টমার,

আপনার পূর্ববর্তী অর্ডারটি return হওয়ার কারণে এই অর্ডারটি confirm করার আগে delivery charge payment করতে হবে।

Payment Option:
bKash: 01327694078
Nagad: 01327694078

Payment করার পর Transaction ID আমাদের পাঠিয়ে দিন। Transaction যাচাই করার পর আপনার order confirm করে দেওয়া হবে।

ধন্যবাদ,
ShopScape Team`}
            </p>

          </div>

        </section>
      )}

      {/* ===================================================
          Order Items
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">
            Order Items
          </h2>
        </div>

        <div className="divide-y divide-gray-100">

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >

              <div className="flex min-w-0 gap-4">

                {item.selectedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      item.selectedImageUrl
                    }
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400">
                    No Image
                  </div>
                )}

                <div className="min-w-0">

                  <h3 className="font-medium text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatBDT(
                      item.price
                    )}{" "}
                    × {item.quantity}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {item.selectedSize && (
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Size:{" "}
                        {item.selectedSize}
                      </span>
                    )}

                    {item.selectedColor && (
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Color:{" "}
                        {item.selectedColor}
                      </span>
                    )}

                  </div>

                </div>

              </div>

              <div className="text-left sm:text-right">

                <p className="text-sm text-gray-500">
                  Subtotal
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {formatBDT(
                    item.price *
                      item.quantity
                  )}
                </p>

              </div>

            </div>
          ))}

        </div>

        {/* Totals */}

        <div className="border-t border-gray-100 bg-gray-50 p-5">

          <div className="ml-auto max-w-sm space-y-3">

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium text-gray-900">
                {formatBDT(
                  order.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Delivery Charge
              </span>

              <span className="font-medium text-gray-900">
                {formatBDT(
                  order.deliveryFee
                )}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">

              <div className="flex justify-between">

                <span className="font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-lg font-bold text-gray-900">
                  {formatBDT(
                    order.total
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          Bottom Actions
      =================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

        <Link
          href="/admin/orders"
          className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Orders
        </Link>

        {order.courierTrackingUrl &&
          order.status ===
            "SHIPPED" && (
            <a
              href={
                order.courierTrackingUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gray-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
            >
              🚚 Track Courier
            </a>
          )}

      </div>

    </div>
  );
}