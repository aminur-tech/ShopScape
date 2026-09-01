"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

import type {
  CartLine,
  Order,
  PaymentMethod,
} from "@/lib/types";

/*
|--------------------------------------------------------------------------
| Bangladesh Geo Types
|--------------------------------------------------------------------------
*/

type Upazila = {
  name: string;
  bn_name: string;
};

type District = {
  name: string;
  bn_name: string;
  upazilas: Upazila[];
};

type Division = {
  name: string;
  bn_name: string;
  districts: District[];
};

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type Props = {
  items: CartLine[];

  onSuccess?: (
    order: Order
  ) => void;
};

/*
|--------------------------------------------------------------------------
| Delivery Zones
|--------------------------------------------------------------------------
*/

const DHAKA_SUBURBAN_AREAS = [
  "Ashulia",
  "Dhamrai",
  "Dohar",
  "Hemayetpur",
  "Keraniganj Model",
  "Nawabganj",
  "Savar",
  "South Keraniganj",
];

/*
|--------------------------------------------------------------------------
| Delivery Charges
|--------------------------------------------------------------------------
*/

const DELIVERY_CHARGES = {
  DHAKA_CITY: 70,
  DHAKA_SUBURBAN: 100,
  OUTSIDE_DHAKA: 120,
};

/*
|--------------------------------------------------------------------------
| Bangladesh Data
|--------------------------------------------------------------------------
|
| আপনার existing JSON path অনুযায়ী import করুন।
|--------------------------------------------------------------------------
*/

import bdData from "@/data/bangladesh-geo.json";

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CheckoutForm({
  items,
  onSuccess,
}: Props) {
  const router = useRouter();

  const { clearCart } = useCart();

  /*
  |--------------------------------------------------------------------------
  | Customer Information
  |--------------------------------------------------------------------------
  */

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Address
  |--------------------------------------------------------------------------
  */

  const [division, setDivision] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [area, setArea] =
    useState("");

  const [addressLine, setAddressLine] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Payment
  |--------------------------------------------------------------------------
  */

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  const [transactionId, setTransactionId] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Loading / Error
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Verification
  |--------------------------------------------------------------------------
  */

  const [verificationCode, setVerificationCode] =
    useState("");

  const [verificationSent, setVerificationSent] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Geo Data
  |--------------------------------------------------------------------------
  */

  const divisions =
    bdData as Division[];

  const selectedDivision =
    divisions.find(
      (item) =>
        item.name === division
    );

  const districts =
    selectedDivision?.districts ?? [];

  const selectedDistrict =
    districts.find(
      (item) =>
        item.name === district
    );

  const areas =
    selectedDistrict?.upazilas ?? [];

  /*
  |--------------------------------------------------------------------------
  | Delivery Zone
  |--------------------------------------------------------------------------
  */

  const deliveryZone = useMemo(() => {
    if (
      division === "Dhaka" &&
      district === "Dhaka"
    ) {
      return "DHAKA_CITY";
    }

    if (
      division === "Dhaka" &&
      DHAKA_SUBURBAN_AREAS.includes(
        area
      )
    ) {
      return "DHAKA_SUBURBAN";
    }

    return "OUTSIDE_DHAKA";
  }, [
    division,
    district,
    area,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Delivery Fee
  |--------------------------------------------------------------------------
  */

  const deliveryFee =
    DELIVERY_CHARGES[
      deliveryZone
    ];

  /*
  |--------------------------------------------------------------------------
  | Subtotal
  |--------------------------------------------------------------------------
  */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );
  }, [items]);

  /*
  |--------------------------------------------------------------------------
  | Total
  |--------------------------------------------------------------------------
  */

  const total =
    subtotal + deliveryFee;

  /*
  |--------------------------------------------------------------------------
  | Send Verification Code
  |--------------------------------------------------------------------------
  */

  async function handleSendVerificationCode() {
    setError("");

    if (!email.trim()) {
      setError(
        "অনুগ্রহ করে email দিন।"
      );
      return;
    }

    try {
      setLoading(true);

      await apiFetch(
        "/orders/send-verification-code",
        {
          method: "POST",

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      setVerificationSent(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Verification code পাঠানো যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Email
  |--------------------------------------------------------------------------
  */

  async function handleVerifyEmail() {
    setError("");

    if (!verificationCode.trim()) {
      setError(
        "Verification code দিন।"
      );
      return;
    }

    try {
      setLoading(true);

      await apiFetch(
        "/orders/verify-email",
        {
          method: "POST",

          body: JSON.stringify({
            email: email.trim(),
            code:
              verificationCode.trim(),
          }),
        }
      );

      setVerified(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Form Submit
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    /*
    |----------------------------------------------------------------------
    | Basic Validation
    |----------------------------------------------------------------------
    */

    if (!fullName.trim()) {
      setError(
        "আপনার নাম দিন।"
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "আপনার phone number দিন।"
      );
      return;
    }

    if (!division) {
      setError(
        "Division নির্বাচন করুন।"
      );
      return;
    }

    if (!district) {
      setError(
        "District নির্বাচন করুন।"
      );
      return;
    }

    if (!area) {
      setError(
        "Area নির্বাচন করুন।"
      );
      return;
    }

    if (!addressLine.trim()) {
      setError(
        "সম্পূর্ণ address দিন।"
      );
      return;
    }

    /*
    |----------------------------------------------------------------------
    | Email Verification
    |----------------------------------------------------------------------
    */

    if (
      email.trim() &&
      !verified
    ) {
      setError(
        "অর্ডার করার আগে email verify করুন।"
      );
      return;
    }

    /*
    |----------------------------------------------------------------------
    | Online Payment Validation
    |----------------------------------------------------------------------
    */

    if (
      paymentMethod !== "COD" &&
      !transactionId.trim()
    ) {
      setError(
        "Transaction ID দিন।"
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "আপনার cart খালি।"
      );
      return;
    }

    /*
    |----------------------------------------------------------------------
    | Submit
    |----------------------------------------------------------------------
    */

    try {
      setLoading(true);

      const payload = {
        fullName:
          fullName.trim(),

        phone:
          phone.trim(),

        guestEmail:
          email.trim() || null,

        division,

        district,

        area,

        addressLine:
          addressLine.trim(),

        paymentMethod,

        transactionId:
          transactionId.trim() ||
          null,

        items: items.map(
          (item) => ({
            productId:
              item.productId,

            quantity:
              item.quantity,

            selectedColor:
              item.selectedColor,

            selectedSize:
              item.selectedSize,

            selectedImageUrl:
              item.image,
          })
        ),
      };

      /*
      |--------------------------------------------------------------------
      | Create Order
      |--------------------------------------------------------------------
      */

      const order =
        await apiFetch<Order>(
          "/orders",
          {
            method: "POST",

            body: JSON.stringify(
              payload
            ),
          }
        );

      /*
      |--------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------
      */

      clearCart();

      onSuccess?.(order);

      /*
      |--------------------------------------------------------------------
      | Redirect
      |--------------------------------------------------------------------
      */

      router.push(
        `/order-success?orderNumber=${encodeURIComponent(
          order.orderNumber
        )}`
      );
    } catch (err) {
      console.error(
        "Order creation failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Order তৈরি করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-3"
    >
      {/* ================================================================
          LEFT
      ================================================================ */}

      <div className="space-y-6 lg:col-span-2">
        {/* --------------------------------------------------------------
            Customer Information
        -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Name */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                placeholder="আপনার নাম"
                className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-black"
                required
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-black"
                required
              />
            </div>

            {/* Email */}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(
                      e.target.value
                    );
                    setVerified(false);
                    setVerificationSent(false);
                  }}
                  placeholder="example@email.com"
                  className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-black"
                />

                <button
                  type="button"
                  onClick={
                    handleSendVerificationCode
                  }
                  disabled={
                    loading ||
                    !email.trim() ||
                    verified
                  }
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verified
                    ? "Verified"
                    : verificationSent
                    ? "Resend Code"
                    : "Verify Email"}
                </button>
              </div>

              {verified && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Email verified successfully
                </p>
              )}

              {/* Verification */}

              {verificationSent &&
                !verified && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        verificationCode
                      }
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value
                        )
                      }
                      placeholder="Verification code"
                      className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={
                        handleVerifyEmail
                      }
                      disabled={loading}
                      className="rounded-lg border border-black px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------
            Delivery Address
        -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Address
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Division */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Division
              </label>

              <select
                value={division}
                onChange={(e) => {
                  setDivision(
                    e.target.value
                  );
                  setDistrict("");
                  setArea("");
                }}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black"
                required
              >
                <option value="">
                  Select Division
                </option>

                {divisions.map(
                  (item) => (
                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.bn_name ||
                        item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* District */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                District
              </label>

              <select
                value={district}
                onChange={(e) => {
                  setDistrict(
                    e.target.value
                  );
                  setArea("");
                }}
                disabled={!division}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black disabled:bg-gray-100"
                required
              >
                <option value="">
                  Select District
                </option>

                {districts.map(
                  (item) => (
                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.bn_name ||
                        item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Area */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Area / Upazila
              </label>

              <select
                value={area}
                onChange={(e) =>
                  setArea(
                    e.target.value
                  )
                }
                disabled={!district}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black disabled:bg-gray-100"
                required
              >
                <option value="">
                  Select Area
                </option>

                {areas.map(
                  (item) => (
                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.bn_name ||
                        item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Address */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Address
              </label>

              <input
                type="text"
                value={addressLine}
                onChange={(e) =>
                  setAddressLine(
                    e.target.value
                  )
                }
                placeholder="বাসা, রোড, গ্রাম ইত্যাদি"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                required
              />
            </div>
          </div>

          {/* Delivery Fee */}

          {division &&
            district &&
            area && (
              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Delivery Charge
                  </span>

                  <span className="font-semibold text-gray-900">
                    ৳{deliveryFee}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {deliveryZone ===
                    "DHAKA_CITY" &&
                    "Dhaka City"}

                  {deliveryZone ===
                    "DHAKA_SUBURBAN" &&
                    "Dhaka Suburban"}

                  {deliveryZone ===
                    "OUTSIDE_DHAKA" &&
                    "Outside Dhaka"}
                </p>
              </div>
            )}
        </section>

        {/* --------------------------------------------------------------
            Payment
        -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Method
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {/* COD */}

            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                paymentMethod ===
                "COD"
                  ? "border-black bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={
                  paymentMethod ===
                  "COD"
                }
                onChange={() => {
                  setPaymentMethod(
                    "COD"
                  );
                  setTransactionId("");
                }}
                className="mr-2"
              />

              <span className="font-medium">
                Cash on Delivery
              </span>
            </label>

            {/* bKash */}

            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                paymentMethod ===
                "BKASH"
                  ? "border-black bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="BKASH"
                checked={
                  paymentMethod ===
                  "BKASH"
                }
                onChange={() =>
                  setPaymentMethod(
                    "BKASH"
                  )
                }
                className="mr-2"
              />

              <span className="font-medium">
                bKash
              </span>
            </label>

            {/* Nagad */}

            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                paymentMethod ===
                "NAGAD"
                  ? "border-black bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="NAGAD"
                checked={
                  paymentMethod ===
                  "NAGAD"
                }
                onChange={() =>
                  setPaymentMethod(
                    "NAGAD"
                  )
                }
                className="mr-2"
              />

              <span className="font-medium">
                Nagad
              </span>
            </label>
          </div>

          {/* Transaction ID */}

          {paymentMethod !==
            "COD" && (
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Transaction ID
              </label>

              <input
                type="text"
                value={
                  transactionId
                }
                onChange={(e) =>
                  setTransactionId(
                    e.target.value
                  )
                }
                placeholder="আপনার transaction ID"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
                required
              />
            </div>
          )}
        </section>

        {/* --------------------------------------------------------------
            Error
        -------------------------------------------------------------- */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* ================================================================
          RIGHT - ORDER SUMMARY
      ================================================================ */}

      <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Order Summary
        </h2>

        {/* Items */}

        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartLineId}
              className="flex gap-3"
            >
              {/* Image */}

              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Info */}

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-gray-900">
                  {item.name}
                </p>

                <div className="mt-1 text-xs text-gray-500">
                  Qty: {item.quantity}
                </div>

                {item.selectedColor && (
                  <div className="text-xs text-gray-500">
                    Color:{" "}
                    {item.selectedColor}
                  </div>
                )}

                {item.selectedSize && (
                  <div className="text-xs text-gray-500">
                    Size:{" "}
                    {item.selectedSize}
                  </div>
                )}
              </div>

              {/* Price */}

              <div className="text-right text-sm font-semibold">
                ৳
                {(
                  item.price *
                  item.quantity
                ).toLocaleString(
                  "en-BD"
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}

        <div className="my-5 border-t" />

        {/* Pricing */}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">
              Subtotal
            </span>

            <span className="font-medium">
              ৳
              {subtotal.toLocaleString(
                "en-BD"
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Delivery
            </span>

            <span className="font-medium">
              ৳
              {deliveryFee.toLocaleString(
                "en-BD"
              )}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold">
                Total
              </span>

              <span className="text-lg font-bold">
                ৳
                {total.toLocaleString(
                  "en-BD"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}

        <button
          type="submit"
          disabled={
            loading ||
            items.length === 0
          }
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : `Place Order • ৳${total.toLocaleString(
                "en-BD"
              )}`}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          অর্ডার করার মাধ্যমে আপনি আমাদের
          terms & conditions মেনে নিচ্ছেন।
        </p>
      </aside>
    </form>
  );
}