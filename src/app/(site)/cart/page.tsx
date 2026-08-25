"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    count,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  /*
   * =========================================================
   * TOTAL
   * =========================================================
   */

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  /*
   * =========================================================
   * EMPTY CART
   * =========================================================
   */

  if (items.length === 0) {
    return (
      <main className="container-page py-12">

        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            🛍️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            আপনার কার্ট খালি
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            আপনার পছন্দের প্রোডাক্টগুলো
            কার্টে যোগ করুন।
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            শপিং শুরু করুন
          </Link>

        </div>

      </main>
    );
  }

  /*
   * =========================================================
   * CART PAGE
   * =========================================================
   */

  return (
    <main className="container-page py-8">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            শপিং কার্ট
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            মোট {count} টি পণ্য
          </p>

        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-sm font-medium text-red-500 hover:underline"
        >
          কার্ট খালি করুন
        </button>

      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* ================================================= */}
        {/* CART ITEMS */}
        {/* ================================================= */}

        <div className="space-y-4">

          {items.map((item) => {

            const itemTotal =
              item.price *
              item.quantity;

            return (
              <div
                key={item.cartLineId}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >

                <div className="flex gap-4">

                  {/* IMAGE */}

                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🛍️
                      </div>
                    )}

                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2 className="font-semibold text-gray-900">
                          {item.name}
                        </h2>

                        {/* SIZE */}

                        {item.selectedSize && (
                          <p className="mt-1 text-sm text-gray-500">
                            সাইজ:{" "}
                            <span className="font-medium text-gray-800">
                              {item.selectedSize}
                            </span>
                          </p>
                        )}

                        {/* COLOR */}

                        {item.selectedColor && (
                          <p className="mt-1 text-sm text-gray-500">
                            কালার:{" "}
                            <span className="font-medium text-gray-800">
                              {item.selectedColor}
                            </span>
                          </p>
                        )}

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.cartLineId
                          )
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>

                    </div>

                    {/* PRICE */}

                    <div className="mt-3 text-sm text-gray-500">
                      {formatBDT(
                        item.price
                      )}{" "}
                      ×{" "}
                      {item.quantity}
                    </div>

                    {/* BOTTOM */}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">

                      {/* QUANTITY */}

                      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-gray-200">

                        {/* MINUS */}

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartLineId,
                              Math.max(
                                1,
                                item.quantity -
                                  1
                              )
                            )
                          }
                          disabled={
                            item.quantity <=
                            1
                          }
                          className="flex h-full w-10 items-center justify-center text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        {/* NUMBER */}

                        <span className="flex h-full w-10 items-center justify-center border-x border-gray-200 text-sm font-semibold">
                          {item.quantity}
                        </span>

                        {/* PLUS */}

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartLineId,
                              item.quantity +
                                1
                            )
                          }
                          className="flex h-full w-10 items-center justify-center text-lg text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>

                      </div>

                      {/* TOTAL */}

                      <div className="text-lg font-bold text-brand-600">
                        {formatBDT(
                          itemTotal
                        )}
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* ================================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================================= */}

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            অর্ডার সামারি
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between text-sm text-gray-600">

              <span>
                পণ্য ({count})
              </span>

              <span className="font-medium text-gray-900">
                {formatBDT(
                  subtotal
                )}
              </span>

            </div>

            <div className="flex justify-between text-sm text-gray-600">

              <span>
                ডেলিভারি
              </span>

              <span className="font-medium text-gray-900">
                পরে নির্ধারণ হবে
              </span>

            </div>

            <div className="border-t border-gray-200 pt-4">

              <div className="flex items-center justify-between">

                <span className="font-semibold text-gray-900">
                  মোট
                </span>

                <span className="text-xl font-bold text-brand-600">
                  {formatBDT(
                    subtotal
                  )}
                </span>

              </div>

            </div>

          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            Checkout করুন
          </Link>

          <Link
            href="/products"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            আরও শপিং করুন
          </Link>

        </aside>

      </div>

    </main>
  );
}