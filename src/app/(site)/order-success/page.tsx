"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
  total: number;
  items: OrderItem[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber") ?? "";
  const phone = searchParams.get("phone") ?? "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber || !phone) {
      setLoading(false);
      setError(true);
      return;
    }

    let isMounted = true;

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

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        const orderData = data?.data ?? data?.order ?? data;

        if (isMounted) {
          if (orderData && (orderData.fullName || orderData.items)) {
            setOrder(orderData);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error("[OrderSuccess] Fetch error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, phone]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
            Order Details Missing
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            অর্ডারের তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক লিংক চেক করুন।
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const invoiceUrl = `${API_URL}/orders/track/invoice?orderNumber=${encodeURIComponent(
    orderNumber
  )}&phone=${encodeURIComponent(phone)}`;

  const address = [
    order?.division,
    order?.district,
    order?.area,
    order?.addressLine,
  ]
    .filter(Boolean)
    .join(" > ");

  return (
    <main className="min-h-screen bg-[#F5F6FF] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* SUCCESS CONFIRMATION HEADER */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Order Placed Successfully! 🎉
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            আপনার অর্ডারটি সফলভাবে নেওয়া হয়েছে। আপনার ইনভয়েস প্রিভিউ নিচে দেওয়া হলো:
          </p>

          {/* ORDER ID & PHONE WITH COPY BUTTONS */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700 sm:text-sm">
              <span>Order ID: <strong className="text-gray-900">{orderNumber}</strong></span>
              <button
                onClick={() => handleCopy(orderNumber, "orderNumber")}
                className="text-gray-500 hover:text-gray-800 transition"
                title="Copy Order ID"
              >
                {copiedField === "orderNumber" ? (
                  <span className="text-xs text-green-600 font-bold">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700 sm:text-sm">
              <span>Phone: <strong className="text-gray-900">{phone}</strong></span>
              <button
                onClick={() => handleCopy(phone, "phone")}
                className="text-gray-500 hover:text-gray-800 transition"
                title="Copy Phone Number"
              >
                {copiedField === "phone" ? (
                  <span className="text-xs text-green-600 font-bold">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* FULL WIDTH TRACK ORDER BUTTON */}
          <div className="mt-6">
            <Link
              href={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`}
              className="block w-full rounded-xl bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
            >
              Track Order Page
            </Link>
          </div>
        </div>

        {/* INVOICE PREVIEW SECTION */}
        <section className="overflow-hidden rounded-2xl border border-[#E2E4EC] bg-white shadow-sm">
          {/* CONTROL BAR */}
          <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-base font-bold text-gray-900">
                Invoice Preview
              </h2>
            </div>

            <div>
              <a
                href={invoiceUrl}
                download={`invoice-${orderNumber}.pdf`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:text-sm"
              >
                Download PDF
              </a>
            </div>
          </div>

          {/* HTML INVOICE CARD */}
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
            </div>
          ) : (
            <div className="p-6 sm:p-12">
              <div className="mx-auto max-w-2xl rounded-xl border border-[#E2E4EC] bg-white p-6 sm:p-8">
                {/* BRAND HEADER */}
                <div className="text-center">
                  <h2 className="text-xl font-bold tracking-wider text-[#7B3FA0]">
                    INVOICE
                  </h2>
                  <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5A00] text-2xl font-black text-white">
                    S
                  </div>
                  <h3 className="text-lg font-bold text-[#171717]">ShopScape</h3>
                  <p className="text-xs text-[#777777]">
                    Mohammadpur, Dhaka, Bangladesh
                  </p>
                </div>

                <hr className="my-6 border-[#E2E4EC]" />

                {/* ORDER METADATA */}
                <div className="space-y-1.5 text-sm text-[#171717]">
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-600">Order ID</span>
                    <span>: {order?.orderNumber || orderNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-600">Mobile</span>
                    <span>: {order?.phone || phone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-600">Name</span>
                    <span>: {order?.fullName || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-600">Address</span>
                    <span>: {address || "N/A"}</span>
                  </div>
                  <div className="flex text-[#FF2E88] font-bold">
                    <span className="w-24">COD TK</span>
                    <span>: ৳{order?.total ? Number(order.total).toLocaleString("en-BD") : "0"}</span>
                  </div>
                </div>

                {/* PRODUCT TABLE */}
                <div className="mt-6 overflow-hidden rounded-lg border border-[#E2E4EC]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAFC] text-gray-700 border-b border-[#E2E4EC]">
                      <tr>
                        <th className="p-3 w-20">Image</th>
                        <th className="p-3">Product_Info</th>
                        <th className="p-3 w-24 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EC]">
                      {order?.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3">
                              {item.selectedImageUrl ? (
                                <img
                                  src={item.selectedImageUrl}
                                  alt={item.name}
                                  className="h-14 w-14 rounded-md object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400">
                                  No Image
                                </div>
                              )}
                            </td>
                            <td className="p-3 space-y-0.5">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              {item.selectedSize && (
                                <p className="text-gray-500">Size: {item.selectedSize}</p>
                              )}
                              {item.selectedColor && (
                                <p className="text-gray-500">Color: {item.selectedColor}</p>
                              )}
                              <p className="text-gray-500">
                                Qty: {item.quantity} X ৳{item.price}
                              </p>
                            </td>
                            <td className="p-3 text-right font-bold text-[#FF2E88]">
                              ৳{(Number(item.price) * Number(item.quantity)).toLocaleString("en-BD")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-400">
                            No product details found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-8 text-center text-xs text-gray-700">
                  Dear {order?.fullName || "Customer"}, thanks for confirming the order.
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
            <p className="text-sm text-gray-500">Loading invoice...</p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}