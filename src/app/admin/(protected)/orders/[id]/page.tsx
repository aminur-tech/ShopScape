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
import { apiFetch, ApiError } from "@/lib/api";

import {
  formatBDT,
  STATUS_LABELS_BN,
} from "@/lib/format";

import type {
  Order,
  OrderStatus,
} from "@/lib/types";

/* =========================================================
   CONSTANTS
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

const DELIVERY_PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Unpaid",
  PENDING: "Payment Pending",
  PAID: "Paid",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/* =========================================================
   EXTENDED ORDER TYPE
========================================================= */

type ExtendedOrder = Order & {
  adminMessage?: string | null;
  adminMessageSubject?: string | null;

  deliveryPaymentStatus?: string | null;
  deliveryPaymentMethod?: string | null;
  deliveryTransactionId?: string | null;
  deliveryPaymentProofUrl?: string | null;
  deliveryPaymentRequired?: boolean | null;

  courierTrackingUrl?: string | null;
};

/* =========================================================
   HELPERS
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

function getDeliveryPaymentClass(
  status?: string | null
) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "UNPAID":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();

  const id = params?.id;

  const { token } = useAuth();

  /* =======================================================
     ORDER
  ======================================================= */

  const [order, setOrder] =
    useState<ExtendedOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     STATUS
  ======================================================= */

  const [updating, setUpdating] =
    useState(false);

  /* =======================================================
     INVOICE
  ======================================================= */

  const [downloading, setDownloading] =
    useState(false);

  /* =======================================================
     COURIER TRACKING
  ======================================================= */

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [savingTracking, setSavingTracking] =
    useState(false);

  const [trackingSuccess, setTrackingSuccess] =
    useState("");

  /* =======================================================
     ADMIN CUSTOMER MESSAGE
  ======================================================= */

  const [messageSubject, setMessageSubject] =
    useState("");

  const [adminMessage, setAdminMessage] =
    useState("");

  const [savingMessage, setSavingMessage] =
    useState(false);

  const [messageSuccess, setMessageSuccess] =
    useState("");

  /* =======================================================
     DELIVERY PAYMENT
  ======================================================= */

  const [deliveryPaymentStatus, setDeliveryPaymentStatus] =
    useState("UNPAID");

  const [deliveryPaymentMethod, setDeliveryPaymentMethod] =
    useState<"BKASH" | "NAGAD">("BKASH");

  const [deliveryTransactionId, setDeliveryTransactionId] =
    useState("");

  const [deliveryPaymentProofUrl, setDeliveryPaymentProofUrl] =
    useState("");

  const [savingDeliveryPayment, setSavingDeliveryPayment] =
    useState(false);

  const [deliveryPaymentSuccess, setDeliveryPaymentSuccess] =
    useState("");

  /* =========================================================
     DEBUG
  ========================================================= */

  const debug = useCallback(
    (...args: unknown[]) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AdminOrderDetail]", ...args);
      }
    },
    []
  );

  /* =========================================================
     LOAD ORDER
  ========================================================= */

  const loadOrder = useCallback(async () => {
    if (!token || !id) {
      debug("loadOrder skipped:", {
        token: !!token,
        id,
      });

      return;
    }

    setLoading(true);
    setError("");

    try {
      debug("Loading order:", id);

      const data = await apiFetch<{
        order: ExtendedOrder;
      }>(`/admin/orders/${id}`, {
        token,
      });

      debug("Order API response:", data);

      const loadedOrder = data.order;

      if (!loadedOrder) {
        throw new Error(
          "Backend returned no order"
        );
      }

      setOrder({
        ...loadedOrder,

        items: Array.isArray(loadedOrder.items)
          ? loadedOrder.items
          : [],
      });

      /* Courier */

      setTrackingUrl(
        loadedOrder.courierTrackingUrl ?? ""
      );

      /* Customer Message */

      setAdminMessage(
        loadedOrder.adminMessage ?? ""
      );

      setMessageSubject(
        loadedOrder.adminMessageSubject ?? ""
      );

      /* Delivery Payment */

      setDeliveryPaymentStatus(
        loadedOrder.deliveryPaymentStatus ??
          "UNPAID"
      );

      setDeliveryPaymentMethod(
        loadedOrder.deliveryPaymentMethod ===
          "NAGAD"
          ? "NAGAD"
          : "BKASH"
      );

      setDeliveryTransactionId(
        loadedOrder.deliveryTransactionId ??
          ""
      );

      setDeliveryPaymentProofUrl(
        loadedOrder.deliveryPaymentProofUrl ??
          ""
      );
    } catch (err) {
      console.error(
        "[AdminOrderDetail] loadOrder error:",
        err
      );

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "অর্ডারের তথ্য লোড করা যায়নি।"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, id, debug]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* =========================================================
     STATUS CHANGE
  ========================================================= */

  async function handleStatusChange(
    status: OrderStatus
  ) {
    if (!token || !id || !order) return;

    if (status === order.status) {
      return;
    }

    const confirmed = window.confirm(
      `অর্ডারটির স্ট্যাটাস "${STATUS_LABELS_BN[status]}" করতে চান?`
    );

    if (!confirmed) {
      return;
    }

    setUpdating(true);

    try {
      debug("Updating status:", {
        orderId: id,
        status,
      });

      const data = await apiFetch<{
        order: ExtendedOrder;
      }>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        token,
        body: {
          status,
        },
      });

      debug("Status response:", data);

      setOrder({
        ...data.order,
        items: Array.isArray(data.order.items)
          ? data.order.items
          : order.items ?? [],
      });
    } catch (err) {
      console.error(
        "[AdminOrderDetail] status error:",
        err
      );

      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert(
          "অর্ডারের স্ট্যাটাস পরিবর্তন করা যায়নি।"
        );
      }
    } finally {
      setUpdating(false);
    }
  }

  /* =========================================================
     SAVE COURIER TRACKING
  ========================================================= */

  async function handleSaveTracking() {
    if (!token || !id || !order) return;

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
      debug("Saving tracking:", {
        orderId: id,
        courierTrackingUrl: value || null,
      });

      const data = await apiFetch<{
        order: ExtendedOrder;
        message?: string;
      }>(`/admin/orders/${id}/tracking`, {
        method: "PATCH",
        token,
        body: {
          courierTrackingUrl:
            value || null,
        },
      });

      debug("Tracking response:", data);

      setOrder({
        ...data.order,
        items: Array.isArray(data.order.items)
          ? data.order.items
          : order.items ?? [],
      });

      setTrackingUrl(
        data.order.courierTrackingUrl ?? ""
      );

      setTrackingSuccess(
        data.message ??
          "Courier tracking link সফলভাবে সংরক্ষণ হয়েছে।"
      );
    } catch (err) {
      console.error(
        "[AdminOrderDetail] tracking error:",
        err
      );

      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert(
          "Tracking link সংরক্ষণ করা যায়নি।"
        );
      }
    } finally {
      setSavingTracking(false);
    }
  }

  /* =========================================================
     SEND CUSTOMER MESSAGE
  ========================================================= */

  async function handleSaveMessage() {
    if (!token || !id || !order) {
      return;
    }

    const subject =
      messageSubject.trim();

    const message =
      adminMessage.trim();

    if (!subject) {
      alert("Subject লিখুন।");
      return;
    }

    if (subject.length < 2) {
      alert(
        "Subject কমপক্ষে 2 characters হতে হবে।"
      );
      return;
    }

    if (subject.length > 150) {
      alert(
        "Subject সর্বোচ্চ 150 characters হতে পারে।"
      );
      return;
    }

    if (!message) {
      alert(
        "Customer message লিখুন।"
      );
      return;
    }

    if (message.length < 2) {
      alert(
        "Message কমপক্ষে 2 characters হতে হবে।"
      );
      return;
    }

    if (message.length > 5000) {
      alert(
        "Message সর্বোচ্চ 5000 characters হতে পারে।"
      );
      return;
    }

    setSavingMessage(true);
    setMessageSuccess("");

    try {
      /*
       * IMPORTANT:
       *
       * Backend expects:
       *
       * {
       *   subject,
       *   message
       * }
       *
       * NOT:
       *
       * {
       *   adminMessage
       * }
       */

      const body = {
        subject,
        message,
      };

      debug(
        "Sending customer message:",
        {
          endpoint: `/admin/orders/${id}/message`,
          body,
        }
      );

      const data = await apiFetch<{
        success: boolean;
        message: string;
      }>(`/admin/orders/${id}/message`, {
        method: "PATCH",
        token,
        body,
      });

      debug(
        "Customer message response:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Message send failed"
        );
      }

      setMessageSuccess(
        data.message ??
          "Customer-কে message পাঠানো হয়েছে।"
      );
    } catch (err) {
      console.error(
        "[AdminOrderDetail] message error:",
        err
      );

      if (err instanceof ApiError) {
        alert(err.message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(
          "Customer message পাঠানো যায়নি।"
        );
      }
    } finally {
      setSavingMessage(false);
    }
  }

  /* =========================================================
     SAVE DELIVERY PAYMENT
  ========================================================= */

  async function handleSaveDeliveryPayment(
    required: boolean
  ) {
    if (!token || !id || !order) {
      return;
    }

    setSavingDeliveryPayment(true);
    setDeliveryPaymentSuccess("");

    try {
      const body = {
        required,

        paymentMethod: required
          ? deliveryPaymentMethod
          : undefined,

        paymentStatus: required
          ? deliveryPaymentStatus
          : undefined,

        transactionId: required
          ? deliveryTransactionId.trim() ||
            undefined
          : undefined,

        paymentProofUrl: required
          ? deliveryPaymentProofUrl.trim() ||
            undefined
          : undefined,
      };

      debug(
        "Saving delivery payment:",
        body
      );

      const data = await apiFetch<{
        order: ExtendedOrder;
        message?: string;
      }>(
        `/admin/orders/${id}/delivery-payment`,
        {
          method: "PATCH",
          token,
          body,
        }
      );

      debug(
        "Delivery payment response:",
        data
      );

      setOrder({
        ...data.order,
        items: Array.isArray(data.order.items)
          ? data.order.items
          : order.items ?? [],
      });

      setDeliveryPaymentStatus(
        data.order.deliveryPaymentStatus ??
          "UNPAID"
      );

      setDeliveryPaymentMethod(
        data.order.deliveryPaymentMethod ===
          "NAGAD"
          ? "NAGAD"
          : "BKASH"
      );

      setDeliveryTransactionId(
        data.order.deliveryTransactionId ??
          ""
      );

      setDeliveryPaymentProofUrl(
        data.order.deliveryPaymentProofUrl ??
          ""
      );

      setDeliveryPaymentSuccess(
        data.message ??
          "Delivery payment information updated."
      );
    } catch (err) {
      console.error(
        "[AdminOrderDetail] delivery payment error:",
        err
      );

      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert(
          "Delivery payment information update করা যায়নি।"
        );
      }
    } finally {
      setSavingDeliveryPayment(false);
    }
  }

  /* =========================================================
     DOWNLOAD INVOICE
  ========================================================= */

  async function handleDownloadInvoice() {
    if (!token || !order) {
      return;
    }

    setDownloading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${order.id}/invoice`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      debug(
        "Invoice response:",
        response.status
      );

      if (!response.ok) {
        let message =
          "Invoice download failed";

        try {
          const data =
            await response.json();

          message =
            data.error ??
            data.message ??
            message;
        } catch {
          // Ignore JSON parse error
        }

        throw new Error(message);
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
      console.error(
        "[AdminOrderDetail] invoice error:",
        err
      );

      if (err instanceof ApiError) {
        alert(err.message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(
          "ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে।"
        );
      }
    } finally {
      setDownloading(false);
    }
  }

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const items = useMemo(() => {
    if (!order) {
      return [];
    }

    return Array.isArray(order.items)
      ? order.items
      : [];
  }, [order]);

  const itemCount = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );
  }, [items]);

  const paymentLabel = order
    ? PAYMENT_LABELS[
        order.paymentMethod
      ] ??
      order.paymentMethod
    : "";

  const returnRequired =
    order?.returnRequired === true;

  const deliveryPaymentRequired =
    order?.deliveryPaymentRequired === true;

  const deliveryPaymentStatusValue =
    order?.deliveryPaymentStatus ??
    deliveryPaymentStatus ??
    "UNPAID";

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-100" />

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-6xl space-y-6 pb-12">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Orders
          </Link>

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
          SUMMARY
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
          RETURN WARNING
      =================================================== */}

      {returnRequired && (
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
          DELIVERY PAYMENT
      =================================================== */}

      {returnRequired && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Delivery Charge Payment
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Previous return customer-এর জন্য
                delivery payment requirement manage করুন।
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getDeliveryPaymentClass(
                deliveryPaymentStatusValue
              )}`}
            >
              {DELIVERY_PAYMENT_LABELS[
                deliveryPaymentStatusValue
              ] ??
                deliveryPaymentStatusValue}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Payment Method */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Method
              </label>

              <select
                value={deliveryPaymentMethod}
                onChange={(e) =>
                  setDeliveryPaymentMethod(
                    e.target.value as
                      | "BKASH"
                      | "NAGAD"
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="BKASH">
                  bKash
                </option>

                <option value="NAGAD">
                  Nagad
                </option>
              </select>
            </div>

            {/* Payment Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Status
              </label>

              <select
                value={deliveryPaymentStatus}
                onChange={(e) =>
                  setDeliveryPaymentStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="UNPAID">
                  Unpaid
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="PAID">
                  Paid
                </option>
              </select>
            </div>

            {/* Transaction ID */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Transaction ID
              </label>

              <input
                type="text"
                value={deliveryTransactionId}
                onChange={(e) =>
                  setDeliveryTransactionId(
                    e.target.value
                  )
                }
                placeholder="Example: 8A7B6C5D"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* Payment Proof */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Proof URL
              </label>

              <input
                type="url"
                value={deliveryPaymentProofUrl}
                onChange={(e) =>
                  setDeliveryPaymentProofUrl(
                    e.target.value
                  )
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>

          {deliveryPaymentProofUrl &&
            isValidUrl(
              deliveryPaymentProofUrl
            ) && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Payment Proof
                </p>

                <a
                  href={
                    deliveryPaymentProofUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      deliveryPaymentProofUrl
                    }
                    alt="Delivery payment proof"
                    className="h-40 w-auto rounded-lg border border-gray-200 object-cover hover:opacity-90"
                  />
                </a>
              </div>
            )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {deliveryPaymentSuccess && (
                <p className="text-sm font-medium text-emerald-600">
                  ✓ {deliveryPaymentSuccess}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={
                  savingDeliveryPayment
                }
                onClick={() =>
                  handleSaveDeliveryPayment(
                    true
                  )
                }
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingDeliveryPayment
                  ? "Saving..."
                  : "Save Payment"}
              </button>

              <button
                type="button"
                disabled={
                  savingDeliveryPayment
                }
                onClick={() =>
                  handleSaveDeliveryPayment(
                    false
                  )
                }
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove Requirement
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          STATUS MANAGEMENT
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
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
          CUSTOMER + PAYMENT
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

            {order.guestEmail && (
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Email
                </p>

                <a
                  href={`mailto:${order.guestEmail}`}
                  className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                >
                  {order.guestEmail}
                </a>
              </div>
            )}

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

              <span className="break-all text-right text-sm font-semibold text-gray-900">
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
          COURIER TRACKING
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
          CUSTOMER MESSAGE
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-900">
            Customer Message
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customer-এর email address-এ সরাসরি
            subject এবং message পাঠাতে পারবেন।
          </p>
        </div>

        {/* Subject */}

        <div className="mt-5">
          <label
            htmlFor="message-subject"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Subject
          </label>

          <input
            id="message-subject"
            type="text"
            value={messageSubject}
            onChange={(e) =>
              setMessageSubject(
                e.target.value
              )
            }
            maxLength={150}
            placeholder="Order confirmation / Delivery payment required"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />

          <p className="mt-1 text-xs text-gray-400">
            {messageSubject.length}/150
          </p>
        </div>

        {/* Message */}

        <div className="mt-4">
          <label
            htmlFor="customer-message"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Message
          </label>

          <textarea
            id="customer-message"
            value={adminMessage}
            onChange={(e) =>
              setAdminMessage(
                e.target.value
              )
            }
            rows={8}
            maxLength={5000}
            placeholder={`উদাহরণ:

প্রিয় কাস্টমার,

আপনার পূর্ববর্তী অর্ডারটি return হওয়ার কারণে এই অর্ডারটি confirm করার আগে delivery charge payment করতে হবে।

Payment Option:
bKash: 01327694078
Nagad: 01327694078

Payment করার পর Transaction ID আমাদের পাঠিয়ে দিন।

ধন্যবাদ,
ShopScape Team`}
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />

          <p className="mt-1 text-xs text-gray-400">
            {adminMessage.length}/5000
          </p>
        </div>

        {/* Actions */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {messageSuccess && (
              <p className="text-sm font-medium text-emerald-600">
                ✓ {messageSuccess}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              handleSaveMessage
            }
            disabled={savingMessage}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingMessage
              ? "Sending..."
              : "Send Customer Message"}
          </button>
        </div>
      </section>

      {/* ===================================================
          PAYMENT GUIDE
      =================================================== */}

      {returnRequired && (
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
          ORDER ITEMS
      =================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">
              Order Items
            </h2>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {items.length} product
              {items.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-gray-500">
                এই অর্ডারে কোনো item পাওয়া যায়নি।
              </p>
            </div>
          ) : (
            items.map((item) => (
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
                      Number(item.price) *
                        Number(item.quantity)
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
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
          BOTTOM ACTIONS
      =================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link
          href="/admin/orders"
          className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Orders
        </Link>

        {order.courierTrackingUrl &&
          order.status === "SHIPPED" && (
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