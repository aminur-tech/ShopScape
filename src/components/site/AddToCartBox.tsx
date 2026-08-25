"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart-context";

import type { Product } from "@/lib/types";

type AddToCartBoxProps = {
  product: Product;
  selectedImage: string | null;
};

export function AddToCartBox({
  product,
  selectedImage,
}: AddToCartBoxProps) {
  const { addItem } = useCart();

  const router = useRouter();

  /*
   * =========================================================
   * SIZES
   * =========================================================
   */

  const availableSizes = useMemo(() => {
    return (product.sizes ?? [])
      .map((size) => size?.trim())
      .filter(
        (size): size is string =>
          Boolean(size)
      );
  }, [product.sizes]);

  const hasSizes =
    availableSizes.length > 0;

  /*
   * =========================================================
   * IMAGE
   * =========================================================
   */

  const currentImage =
    selectedImage ??
    product.images?.[0] ??
    null;

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    selectedSize,
    setSelectedSize,
  ] = useState<string | null>(
    availableSizes[0] ?? null
  );

  const [qty, setQty] = useState(1);

  const [added, setAdded] =
    useState(false);

  /*
   * =========================================================
   * PRICE
   * =========================================================
   */

  const price =
    Number(product.discountPrice) ||
    Number(product.price) ||
    0;

  /*
   * =========================================================
   * AVAILABILITY
   *
   * stock is ONLY used for:
   *
   * 1 = available
   * 0 = unavailable
   *
   * It is NOT used as quantity limit.
   * =========================================================
   */

  const stock =
    Number(product.stock) || 0;

  const outOfStock =
    stock <= 0;

  /*
   * =========================================================
   * RESET SIZE
   * =========================================================
   */

  useEffect(() => {
    setSelectedSize(
      availableSizes[0] ?? null
    );
  }, [
    product.id,
    availableSizes,
  ]);

  /*
   * =========================================================
   * RESET QUANTITY
   * =========================================================
   */

  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [product.id]);

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  const selectionRequired =
    hasSizes && !selectedSize;

  /*
   * =========================================================
   * CART LINE ID
   * =========================================================
   */

  const cartLineId = useMemo(() => {
    return [
      product.id,
      currentImage ?? "no-image",
      selectedSize ?? "no-size",
    ].join("__");
  }, [
    product.id,
    currentImage,
    selectedSize,
  ]);

  /*
   * =========================================================
   * ADD TO CART
   * =========================================================
   */

  function handleAdd() {
    if (outOfStock) return;

    if (selectionRequired) return;

    addItem(
      {
        cartLineId,

        productId: product.id,

        name: product.name,

        price,

        image: currentImage,

        selectedColor: null,

        selectedSize,

        /*
         * Unlimited product
         *
         * Keep a very large maxStock only if your
         * cart-context requires this property.
         *
         * It will NOT be used as real inventory.
         */
        maxStock: Number.MAX_SAFE_INTEGER,
      },
      qty
    );

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  /*
   * =========================================================
   * BUY NOW
   * =========================================================
   */

  function handleBuyNow() {
    if (outOfStock) return;

    if (selectionRequired) return;

    handleAdd();

    router.push("/cart");
  }

  /*
   * =========================================================
   * QUANTITY
   * =========================================================
   */

  function decreaseQty() {
    setQty((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseQty() {
    if (outOfStock) return;

    /*
     * IMPORTANT:
     *
     * Do NOT use Math.min(stock, ...)
     *
     * Product is unlimited.
     */

    setQty((current) =>
      current + 1
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="mt-6 space-y-6">

      {/* ================================================= */}
      {/* SIZE */}
      {/* ================================================= */}

      {hasSizes && (
        <section>

          <div className="mb-3 flex items-center justify-between">

            <div>

              <h3 className="text-sm font-semibold text-gray-900">
                সাইজ নির্বাচন করুন
              </h3>

              {selectedSize && (
                <p className="mt-1 text-xs text-gray-500">
                  নির্বাচিত:{" "}
                  <span className="font-medium text-gray-700">
                    {selectedSize}
                  </span>
                </p>
              )}

            </div>

            {product.sizeChart && (
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById(
                      "size-chart"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                      block: "center",
                    });
                }}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                সাইজ চার্ট দেখুন
              </button>
            )}

          </div>

          <div className="flex flex-wrap gap-2">

            {availableSizes.map(
              (size) => {

                const active =
                  selectedSize ===
                  size;

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(
                        size
                      )
                    }
                    aria-pressed={
                      active
                    }
                    className={`min-w-[56px] rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-600"
                    }`}
                  >
                    {size}
                  </button>
                );
              }
            )}

          </div>

        </section>
      )}

      {/* ================================================= */}
      {/* QUANTITY */}
      {/* ================================================= */}

      <section>

        <label className="mb-3 block text-sm font-semibold text-gray-900">
          পরিমাণ
        </label>

        <div className="flex items-center gap-4">

          <div className="flex h-11 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">

            {/* MINUS */}

            <button
              type="button"
              onClick={decreaseQty}
              disabled={
                outOfStock ||
                qty <= 1
              }
              aria-label="পরিমাণ কমান"
              className="flex h-full w-11 items-center justify-center text-xl text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            {/* QUANTITY */}

            <span className="flex h-full w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold">
              {qty}
            </span>

            {/* PLUS */}

            <button
              type="button"
              onClick={increaseQty}
              disabled={outOfStock}
              aria-label="পরিমাণ বাড়ান"
              className="flex h-full w-11 items-center justify-center text-xl text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>

          </div>

          <span
            className={`text-sm font-medium ${
              outOfStock
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {outOfStock
              ? "স্টকে নেই"
              : "স্টকে আছে"}
          </span>

        </div>

      </section>

      {/* ================================================= */}
      {/* SELECTED SUMMARY */}
      {/* ================================================= */}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

        <h3 className="text-sm font-semibold text-gray-900">
          আপনার নির্বাচন
        </h3>

        <div className="mt-3 space-y-3 text-sm text-gray-600">

          {/* IMAGE */}

          {currentImage && (
            <div className="flex items-center gap-3">

              <span className="w-12 text-gray-500">
                ছবি:
              </span>

              <img
                src={currentImage}
                alt={product.name}
                className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
              />

              <span className="font-medium text-gray-900">
                নির্বাচিত ছবি
              </span>

            </div>
          )}

          {/* SIZE */}

          {selectedSize && (
            <div>
              সাইজ:{" "}
              <strong className="text-gray-900">
                {selectedSize}
              </strong>
            </div>
          )}

          {/* QUANTITY */}

          <div>
            পরিমাণ:{" "}
            <strong className="text-gray-900">
              {qty}
            </strong>
          </div>

          {/* TOTAL */}

          <div className="flex items-center justify-between border-t border-gray-200 pt-3">

            <span>
              মোট:
            </span>

            <strong className="text-lg font-bold text-brand-600">
              ৳{" "}
              {(
                price * qty
              ).toLocaleString(
                "en-BD"
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* ACTION BUTTONS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <button
          type="button"
          disabled={
            outOfStock ||
            selectionRequired
          }
          onClick={handleAdd}
          className="rounded-xl border-2 border-brand-500 px-5 py-3 font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added
            ? "✓ কার্টে যোগ হয়েছে"
            : "কার্টে যোগ করুন"}
        </button>

        <button
          type="button"
          disabled={
            outOfStock ||
            selectionRequired
          }
          onClick={handleBuyNow}
          className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          এখনই কিনুন
        </button>

      </div>

      {/* ================================================= */}
      {/* SIZE VALIDATION */}
      {/* ================================================= */}

      {hasSizes &&
        !selectedSize && (
          <p className="text-sm font-medium text-red-500">
            অর্ডার করার আগে একটি
            সাইজ নির্বাচন করুন।
          </p>
        )}

      {/* ================================================= */}
      {/* OUT OF STOCK */}
      {/* ================================================= */}

      {outOfStock && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          এই প্রোডাক্টটি বর্তমানে
          স্টকে নেই।
        </div>
      )}

    </div>
  );
}