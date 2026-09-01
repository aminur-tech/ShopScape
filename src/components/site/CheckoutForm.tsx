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

import bdData from "@/data/bangladesh-geo.json";

/* ==========================================================================
   TYPES
========================================================================== */

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

type Props = {
    items: CartLine[];
    onSuccess?: (order: Order) => void;
};

/* ==========================================================================
   DELIVERY
========================================================================== */

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

const DELIVERY_CHARGES = {
    DHAKA_CITY: 70,
    DHAKA_SUBURBAN: 100,
    OUTSIDE_DHAKA: 120,
} as const;

type DeliveryZone = keyof typeof DELIVERY_CHARGES;

/* ==========================================================================
   HELPERS
========================================================================== */

function getDeliveryZone(
    division: string,
    district: string,
    area: string
): DeliveryZone {
    if (
        division === "Dhaka" &&
        district === "Dhaka"
    ) {
        return DHAKA_SUBURBAN_AREAS.includes(area)
            ? "DHAKA_SUBURBAN"
            : "DHAKA_CITY";
    }

    return "OUTSIDE_DHAKA";
}

/* ==========================================================================
   COMPONENT
========================================================================== */

export default function CheckoutForm({
    items,
    onSuccess,
}: Props) {
    const router = useRouter();
    const { clearCart } = useCart();

    /* ------------------------------------------------------------------------
       CUSTOMER
    ------------------------------------------------------------------------ */

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    /* ------------------------------------------------------------------------
       ADDRESS
    ------------------------------------------------------------------------ */

    const [division, setDivision] = useState("");
    const [district, setDistrict] = useState("");
    const [area, setArea] = useState("");
    const [addressLine, setAddressLine] = useState("");

    /* ------------------------------------------------------------------------
       PAYMENT
    ------------------------------------------------------------------------ */

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("COD");

    const [transactionId, setTransactionId] =
        useState("");

    /* ------------------------------------------------------------------------
       UI
    ------------------------------------------------------------------------ */

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ==========================================================================
       GEO DATA
    ========================================================================== */

    const divisions = bdData as Division[];

    const selectedDivision = divisions.find(
        (item) => item.name === division
    );

    const districts =
        selectedDivision?.districts ?? [];

    const selectedDistrict = districts.find(
        (item) => item.name === district
    );

    const areas =
        selectedDistrict?.upazilas ?? [];

    /* ==========================================================================
       DELIVERY
    ========================================================================== */

    const deliveryZone = useMemo(
        () =>
            getDeliveryZone(
                division,
                district,
                area
            ),
        [division, district, area]
    );

    const deliveryFee =
        DELIVERY_CHARGES[deliveryZone];

    /* ==========================================================================
       PRICING
    ========================================================================== */

    const subtotal = useMemo(() => {
        return items.reduce(
            (total, item) =>
                total +
                item.price * item.quantity,
            0
        );
    }, [items]);

    const total =
        subtotal + deliveryFee;

    /* ==========================================================================
       SUBMIT
    ========================================================================== */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        /* ----------------------------------------------------------------------
           EMPTY CART
        ---------------------------------------------------------------------- */

        if (items.length === 0) {
            setError(
                "আপনার cart খালি।"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           CUSTOMER VALIDATION
        ---------------------------------------------------------------------- */

        const cleanName =
            fullName.trim();

        const cleanPhone =
            phone.trim();

        const cleanEmail =
            email.trim();

        /* ----------------------------------------------------------------------
           NAME
        ---------------------------------------------------------------------- */

        if (!cleanName) {
            setError(
                "অনুগ্রহ করে আপনার নাম দিন।"
            );
            return;
        }

        if (cleanName.length < 2) {
            setError(
                "সঠিক পূর্ণ নাম দিন।"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           PHONE
        ---------------------------------------------------------------------- */

        if (
            !/^01[3-9]\d{8}$/.test(
                cleanPhone
            )
        ) {
            setError(
                "সঠিক বাংলাদেশি মোবাইল নম্বর দিন। যেমন: 01XXXXXXXXX"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           OPTIONAL EMAIL
        ---------------------------------------------------------------------- */

        if (
            cleanEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanEmail
            )
        ) {
            setError(
                "সঠিক Email address দিন।"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           ADDRESS
        ---------------------------------------------------------------------- */

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
                "Area / Upazila নির্বাচন করুন।"
            );
            return;
        }

        const cleanAddress =
            addressLine.trim();

        if (
            cleanAddress.length < 4
        ) {
            setError(
                "সম্পূর্ণ ঠিকানা দিন।"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           PAYMENT
        ---------------------------------------------------------------------- */

        const cleanTransactionId =
            transactionId.trim();

        if (
            paymentMethod !== "COD" &&
            !cleanTransactionId
        ) {
            setError(
                "Transaction ID দিন।"
            );
            return;
        }

        /* ----------------------------------------------------------------------
           BUILD ITEMS
        ---------------------------------------------------------------------- */

        const orderItems =
            items.map((item) => {
                const itemData: {
                    productId: string;
                    quantity: number;
                    selectedColor?: string;
                    selectedSize?: string;
                    selectedImageUrl?: string;
                } = {
                    productId:
                        item.productId,

                    quantity:
                        item.quantity,
                };

                if (
                    item.selectedColor
                ) {
                    itemData.selectedColor =
                        item.selectedColor;
                }

                if (
                    item.selectedSize
                ) {
                    itemData.selectedSize =
                        item.selectedSize;
                }

                if (item.image) {
                    itemData.selectedImageUrl =
                        item.image;
                }

                return itemData;
            });

        /* ----------------------------------------------------------------------
           PAYLOAD
        ---------------------------------------------------------------------- */

        const payload: Record<
            string,
            unknown
        > = {
            fullName: cleanName,

            phone: cleanPhone,

            division,

            district,

            area,

            addressLine:
                cleanAddress,

            paymentMethod,

            items: orderItems,
        };

        if (cleanEmail) {
            payload.guestEmail =
                cleanEmail;
        }

        if (cleanTransactionId) {
            payload.transactionId =
                cleanTransactionId;
        }

        /* ----------------------------------------------------------------------
           DEBUG
        ---------------------------------------------------------------------- */

        console.log(
            "ORDER PAYLOAD:",
            payload
        );

        /* ----------------------------------------------------------------------
           API REQUEST
        ---------------------------------------------------------------------- */

        try {
            setLoading(true);

            const response =
                await apiFetch<{
                    order: Order;
                }>(
                    "/checkout",
                    {
                        method: "POST",
                        body: payload,
                    }
                );

            console.log(
                "ORDER CREATED:",
                response
            );

            const order =
                response.order;

            if (!order) {
                throw new Error(
                    "Backend থেকে order data পাওয়া যায়নি।"
                );
            }

            /* ------------------------------------------------------------------
               SUCCESS
            ------------------------------------------------------------------ */

            clearCart();

            onSuccess?.(order);

            router.push(
                `/order-success?orderNumber=${encodeURIComponent(
                    order.orderNumber
                )}&phone=${encodeURIComponent(
                    cleanPhone
                )}`
            );

        } catch (err) {
            console.error(
                "Order creation failed:",
                err
            );

            if (
                err instanceof Error
            ) {
                setError(
                    err.message
                );
            } else {
                setError(
                    "অর্ডার তৈরি করা যায়নি। আবার চেষ্টা করুন।"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    /* ==========================================================================
       UI
    ========================================================================== */

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-3"
        >
            {/* ==================================================================
                LEFT SIDE
            ================================================================== */}

            <div className="space-y-6 lg:col-span-2">

                {/* ==============================================================
                    CUSTOMER INFORMATION
                ============================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">

                    <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm">
                            1
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Customer Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                আপনার যোগাযোগের তথ্য দিন
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        {/* Name */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) =>
                                    setFullName(
                                        e.target.value
                                    )
                                }
                                placeholder="আপনার পূর্ণ নাম"
                                autoComplete="name"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            />
                        </div>

                        {/* Phone */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
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
                                inputMode="numeric"
                                autoComplete="tel"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                ডেলিভারি সংক্রান্ত প্রয়োজনে এই নম্বরে যোগাযোগ করা হবে।
                            </p>
                        </div>

                        {/* Email */}

                        <div className="sm:col-span-2">

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email

                                <span className="ml-2 text-xs font-normal text-gray-400">
                                    Optional
                                </span>
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="example@email.com"
                                autoComplete="email"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Email না দিলেও অর্ডার করা যাবে।
                            </p>
                        </div>
                    </div>
                </section>

                {/* ==============================================================
                    DELIVERY ADDRESS
                ============================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">

                    <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm">
                            2
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Delivery Address
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                যেখানে আপনার অর্ডারটি ডেলিভারি করতে হবে
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        {/* Division */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Division

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
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
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            >
                                <option value="">
                                    বিভাগ নির্বাচন করুন
                                </option>

                                {divisions.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.name
                                            }
                                            value={
                                                item.name
                                            }
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                District

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
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
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                required
                            >
                                <option value="">
                                    জেলা নির্বাচন করুন
                                </option>

                                {districts.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.name
                                            }
                                            value={
                                                item.name
                                            }
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Area / Upazila

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <select
                                value={area}
                                onChange={(e) =>
                                    setArea(
                                        e.target.value
                                    )
                                }
                                disabled={!district}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                required
                            >
                                <option value="">
                                    এলাকা নির্বাচন করুন
                                </option>

                                {areas.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.name
                                            }
                                            value={
                                                item.name
                                            }
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Address

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={addressLine}
                                onChange={(e) =>
                                    setAddressLine(
                                        e.target.value
                                    )
                                }
                                placeholder="বাসা, রোড, গ্রাম, বাজার ইত্যাদি"
                                autoComplete="street-address"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            />
                        </div>
                    </div>

                    {/* Delivery Charge */}

                    {division &&
                        district &&
                        area && (
                            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Delivery Charge
                                        </p>

                                        <p className="mt-0.5 text-xs text-green-700">
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

                                    <span className="text-base font-bold text-green-700">
                                        ৳
                                        {deliveryFee.toLocaleString(
                                            "en-BD"
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                </section>

                {/* ==============================================================
                    PAYMENT METHOD
                ============================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">

                    <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm">
                            3
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Payment Method
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                আপনার পছন্দের payment method নির্বাচন করুন
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">

                        {/* COD */}

                        <label
                            className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                paymentMethod === "COD"
                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
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

                                    setTransactionId(
                                        ""
                                    );
                                }}
                                className="sr-only"
                            />

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        paymentMethod ===
                                        "COD"
                                            ? "border-green-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {paymentMethod ===
                                        "COD" && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                                    )}
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Cash on Delivery
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        পণ্য হাতে পেয়ে পেমেন্ট
                                    </p>
                                </div>
                            </div>
                        </label>

                        {/* BKASH */}

                        <label
                            className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                paymentMethod === "BKASH"
                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
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
                                onChange={() => {
                                    setPaymentMethod(
                                        "BKASH"
                                    );
                                }}
                                className="sr-only"
                            />

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        paymentMethod ===
                                        "BKASH"
                                            ? "border-green-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {paymentMethod ===
                                        "BKASH" && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                                    )}
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        bKash
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Mobile payment
                                    </p>
                                </div>
                            </div>
                        </label>

                        {/* NAGAD */}

                        <label
                            className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                paymentMethod === "NAGAD"
                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
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
                                onChange={() => {
                                    setPaymentMethod(
                                        "NAGAD"
                                    );
                                }}
                                className="sr-only"
                            />

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        paymentMethod ===
                                        "NAGAD"
                                            ? "border-green-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {paymentMethod ===
                                        "NAGAD" && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                                    )}
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Nagad
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Mobile payment
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Transaction ID */}

                    {paymentMethod !==
                        "COD" && (
                        <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Transaction ID

                                <span className="ml-1 text-red-500">
                                    *
                                </span>
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
                                placeholder="যেমন: 8N7ABC123"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                                required
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Payment সম্পন্ন করার পর আপনার Transaction ID এখানে দিন।
                            </p>
                        </div>
                    )}
                </section>

                {/* ==============================================================
                    ERROR
                ============================================================== */}

                {error && (
                    <div
                        role="alert"
                        className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <span className="text-lg">
                            ⚠️
                        </span>

                        <div>
                            <p className="font-semibold">
                                অর্ডার করা যায়নি
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================================================================
                ORDER SUMMARY
            ================================================================== */}

            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">

                {/* Header */}

                <div className="flex items-center justify-between">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Order Summary
                    </h2>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {items.length}{" "}
                        {items.length === 1
                            ? "Item"
                            : "Items"}
                    </span>
                </div>

                {/* Items */}

                <div className="mt-5 space-y-4">

                    {items.map(
                        (item) => (
                            <div
                                key={
                                    item.cartLineId
                                }
                                className="flex gap-3"
                            >

                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">

                                    {item.image ? (
                                        <img
                                            src={
                                                item.image
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                                        {item.name}
                                    </p>

                                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">

                                        <p>
                                            Qty:{" "}
                                            {
                                                item.quantity
                                            }
                                        </p>

                                        {item.selectedColor && (
                                            <p>
                                                Color:{" "}
                                                {
                                                    item.selectedColor
                                                }
                                            </p>
                                        )}

                                        {item.selectedSize && (
                                            <p>
                                                Size:{" "}
                                                {
                                                    item.selectedSize
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="shrink-0 text-sm font-semibold text-gray-900">
                                    ৳
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toLocaleString(
                                        "en-BD"
                                    )}
                                </p>
                            </div>
                        )
                    )}
                </div>

                <div className="my-5 border-t border-gray-200" />

                {/* Pricing */}

                <div className="space-y-3 text-sm">

                    <div className="flex justify-between">

                        <span className="text-gray-500">
                            Subtotal
                        </span>

                        <span className="font-medium text-gray-900">
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

                        <span className="font-medium text-green-700">
                            ৳
                            {deliveryFee.toLocaleString(
                                "en-BD"
                            )}
                        </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">

                        <div className="flex items-center justify-between">

                            <span className="text-base font-semibold text-gray-900">
                                Total
                            </span>

                            <span className="text-xl font-bold text-green-700">
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
                    className="mt-6 w-full rounded-xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                            Processing...
                        </span>
                    ) : (
                        `Place Order • ৳${total.toLocaleString(
                            "en-BD"
                        )}`
                    )}
                </button>

                {/* Security */}

                <div className="mt-4 space-y-2 text-center text-xs text-gray-500">

                    <p>
                        🔒 আপনার তথ্য নিরাপদে সংরক্ষণ করা হবে।
                    </p>

                    <p>
                        অর্ডার করার মাধ্যমে আপনি আমাদের terms & conditions মেনে নিচ্ছেন।
                    </p>
                </div>
            </aside>
        </form>
    );
}