"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

import {
  apiFetch,
  uploadFile,
  ApiError,
} from "@/lib/api";

import { formatBDT } from "@/lib/format";

import type {
  Order,
  PaymentMethod,
} from "@/lib/types";

/* =========================================================
   TYPES
========================================================= */

type Step =
  | "details"
  | "verify"
  | "success";

type DeliveryZone =
  | "DHAKA_CITY"
  | "DHAKA_SUBURBAN"
  | "OUTSIDE_DHAKA";

/* =========================================================
   DELIVERY CHARGES
========================================================= */

const DELIVERY_CHARGES: Record<
  DeliveryZone,
  number
> = {
  DHAKA_CITY: 70,
  DHAKA_SUBURBAN: 100,
  OUTSIDE_DHAKA: 120,
};

/* =========================================================
   DHAKA SUB-URBAN THANAS
========================================================= */

const DHAKA_SUBURBAN_THANAS = [
  "Ashulia",
  "Dhamrai",
  "Dohar",
  "Hemayetpur",
  "Keraniganj Model",
  "Nawabganj",
  "Savar",
  "South Keraniganj",
];

/* =========================================================
   DHAKA CITY THANAS
========================================================= */

const DHAKA_CITY_THANAS = [
  "Adabor",
  "Airport",
  "Badda",
  "Banani",
  "Bangshal",
  "Bhatara",
  "Cantonment",
  "Chak Bazar",
  "Darus Salam",
  "Dhanmondi",
  "Gandaria",
  "Gulshan",
  "Hazaribagh",
  "Jatrabari",
  "Kadamtali",
  "Kafrul",
  "Kalabagan",
  "Kamrangirchar",
  "Khilgaon",
  "Khilkhet",
  "Kotwali",
  "Lalbagh",
  "Mirpur",
  "Mohammadpur",
  "Motijheel",
  "Mugda",
  "Pallabi",
  "Paltan",
  "Ramna",
  "Rampura",
  "Sabujbagh",
  "Shah Ali",
  "Shahbag",
  "Sher-e-Bangla Nagar",
  "Shyampur",
  "Sutrapur",
  "Tejgaon",
  "Tejgaon Industrial",
  "Turag",
  "Uttara East",
  "Uttara West",
  "Wari",
];

/* =========================================================
   DIVISIONS
========================================================= */

const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

/* =========================================================
   DISTRICTS
========================================================= */

const DISTRICTS: Record<
  string,
  string[]
> = {
  ঢাকা: [
    "ঢাকা",
    "গাজীপুর",
    "নারায়ণগঞ্জ",
    "নরসিংদী",
    "মুন্সিগঞ্জ",
    "মানিকগঞ্জ",
    "মাদারীপুর",
    "রাজবাড়ী",
    "শরীয়তপুর",
    "ফরিদপুর",
    "গোপালগঞ্জ",
    "কিশোরগঞ্জ",
    "টাঙ্গাইল",
  ],

  চট্টগ্রাম: [
    "চট্টগ্রাম",
    "কক্সবাজার",
    "কুমিল্লা",
    "ব্রাহ্মণবাড়িয়া",
    "চাঁদপুর",
    "ফেনী",
    "লক্ষ্মীপুর",
    "নোয়াখালী",
    "রাঙ্গামাটি",
    "খাগড়াছড়ি",
    "বান্দরবান",
  ],

  রাজশাহী: [
    "রাজশাহী",
    "নাটোর",
    "নওগাঁ",
    "চাঁপাইনবাবগঞ্জ",
    "পাবনা",
    "সিরাজগঞ্জ",
    "বগুড়া",
    "জয়পুরহাট",
  ],

  খুলনা: [
    "খুলনা",
    "বাগেরহাট",
    "সাতক্ষীরা",
    "যশোর",
    "ঝিনাইদহ",
    "মাগুরা",
    "নড়াইল",
    "কুষ্টিয়া",
    "চুয়াডাঙ্গা",
    "মেহেরপুর",
  ],

  বরিশাল: [
    "বরিশাল",
    "ভোলা",
    "পটুয়াখালী",
    "পিরোজপুর",
    "ঝালকাঠি",
    "বরগুনা",
  ],

  সিলেট: [
    "সিলেট",
    "মৌলভীবাজার",
    "হবিগঞ্জ",
    "সুনামগঞ্জ",
  ],

  রংপুর: [
    "রংপুর",
    "দিনাজপুর",
    "ঠাকুরগাঁও",
    "পঞ্চগড়",
    "নীলফামারী",
    "লালমনিরহাট",
    "কুড়িগ্রাম",
    "গাইবান্ধা",
  ],

  ময়মনসিংহ: [
    "ময়মনসিংহ",
    "জামালপুর",
    "শেরপুর",
    "নেত্রকোনা",
  ],
};

/* =========================================================
   PAYMENT OPTIONS
========================================================= */

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "COD",
    label: "ক্যাশ অন ডেলিভারি",
    description:
      "পণ্য হাতে পেয়ে পেমেন্ট করুন",
  },
  {
    value: "BKASH",
    label: "bKash",
    description: "Send Money",
  },
  {
    value: "NAGAD",
    label: "Nagad",
    description: "Send Money",
  },
];

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const {
    items,
    clear,
  } = useCart();

  const {
    token,
    user,
  } = useAuth();

  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    step,
    setStep,
  ] = useState<Step>("details");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    order,
    setOrder,
  ] = useState<Order | null>(null);

  const [
    code,
    setCode,
  ] = useState("");

  const [
    paymentConfig,
    setPaymentConfig,
  ] = useState<{
    bkashNumber: string;
    nagadNumber: string;
  } | null>(null);

  const [
    uploadingProof,
    setUploadingProof,
  ] = useState(false);

  /* =======================================================
     FORM
  ======================================================= */

  const [
    form,
    setForm,
  ] = useState({
    fullName: "",

    email:
      user?.email ?? "",

    phone: "",

    division: "ঢাকা",

    district: "ঢাকা",

    thana: "",

    addressLine: "",

    deliveryZone:
      "DHAKA_CITY" as DeliveryZone,

    paymentMethod:
      "COD" as PaymentMethod,

    transactionId: "",

    paymentProofUrl: "",
  });

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal =
    items.reduce(
      (total, item) => {
        const price =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 0;

        return (
          total +
          price * quantity
        );
      },
      0
    );

  /* =======================================================
     DELIVERY CHARGE
  ======================================================= */

  const deliveryCharge =
    DELIVERY_CHARGES[
      form.deliveryZone
    ] ?? 120;

  /* =======================================================
     GRAND TOTAL
  ======================================================= */

  const grandTotal =
    subtotal +
    deliveryCharge;

  /* =======================================================
     LOAD PAYMENT CONFIG
  ======================================================= */

  useEffect(() => {
    apiFetch<{
      bkashNumber: string;
      nagadNumber: string;
    }>(
      "/checkout/payment-config"
    )
      .then(setPaymentConfig)
      .catch(() => {});
  }, []);

  /* =======================================================
     SYNC USER EMAIL
  ======================================================= */

  useEffect(() => {
    if (user?.email) {
      setForm(
        (previous) => ({
          ...previous,
          email:
            user.email ?? "",
        })
      );
    }
  }, [user?.email]);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function updateForm<
    K extends keyof typeof form
  >(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );
  }

  /* =======================================================
     DIVISION CHANGE
  ======================================================= */

  function handleDivisionChange(
    division: string
  ) {
    const districts =
      DISTRICTS[division] ??
      [];

    const firstDistrict =
      districts[0] ?? "";

    setForm(
      (previous) => ({
        ...previous,

        division,

        district:
          firstDistrict,

        thana: "",

        deliveryZone:
          division === "ঢাকা"
            ? "DHAKA_CITY"
            : "OUTSIDE_DHAKA",
      })
    );
  }

  /* =======================================================
     DISTRICT CHANGE
  ======================================================= */

  function handleDistrictChange(
    district: string
  ) {
    setForm(
      (previous) => ({
        ...previous,

        district,

        thana: "",

        deliveryZone:
          district === "ঢাকা"
            ? "DHAKA_CITY"
            : "OUTSIDE_DHAKA",
      })
    );
  }

  /* =======================================================
     THANA CHANGE
  ======================================================= */

  function handleThanaChange(
    thana: string
  ) {
    const isSubUrban =
      DHAKA_SUBURBAN_THANAS.includes(
        thana
      );

    setForm(
      (previous) => ({
        ...previous,

        thana,

        deliveryZone:
          isSubUrban
            ? "DHAKA_SUBURBAN"
            : "DHAKA_CITY",
      })
    );
  }

  /* =======================================================
     PAYMENT PROOF UPLOAD
  ======================================================= */

  async function handleProofSelected(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setUploadingProof(true);

    try {
      const {
        urls,
      } = await uploadFile(
        "/uploads/payment-proof",
        file,
        token
      );

      /*
       * IMPORTANT:
       * urls is string[]
       * paymentProofUrl expects string
       */
      updateForm(
        "paymentProofUrl",
        urls[0] ?? ""
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "পেমেন্ট স্ক্রিনশট আপলোড ব্যর্থ হয়েছে"
      );
    } finally {
      setUploadingProof(false);
    }
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateBeforeSendCode():
    string | null {
    if (
      !form.fullName.trim()
    ) {
      return "আপনার নাম দিন";
    }

    if (
      !form.email.trim()
    ) {
      return "ইমেইল দিন";
    }

    if (
      !form.phone.trim()
    ) {
      return "মোবাইল নম্বর দিন";
    }

    if (
      !/^01[3-9]\d{8}$/.test(
        form.phone.trim()
      )
    ) {
      return "সঠিক বাংলাদেশি মোবাইল নম্বর দিন";
    }

    if (!form.division) {
      return "বিভাগ নির্বাচন করুন";
    }

    if (!form.district) {
      return "জেলা নির্বাচন করুন";
    }

    if (
      !form.thana.trim()
    ) {
      return "থানা নির্বাচন/লিখুন";
    }

    if (
      !form.addressLine.trim()
    ) {
      return "সম্পূর্ণ ঠিকানা দিন";
    }

    if (
      form.paymentMethod !==
      "COD"
    ) {
      if (
        !form.transactionId.trim()
      ) {
        return "ট্রানজেকশন আইডি দিন";
      }

      if (
        !form.paymentProofUrl
      ) {
        return "পেমেন্ট স্ক্রিনশট আপলোড করুন";
      }
    }

    return null;
  }

  /* =======================================================
     SEND EMAIL CODE
  ======================================================= */

  async function handleSendCode(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    const validationError =
      validateBeforeSendCode();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setLoading(true);

    try {
      await apiFetch(
        "/checkout/send-code",
        {
          method: "POST",

          body: {
            email:
              form.email.trim(),
          },
        }
      );

      setStep("verify");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     VERIFY + CREATE ORDER
  ======================================================= */

  async function handleVerifyAndOrder(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (
      code.length !== 6
    ) {
      setError(
        "৬ সংখ্যার ভেরিফিকেশন কোড দিন"
      );

      return;
    }

    if (
      items.length === 0
    ) {
      setError(
        "আপনার কার্ট খালি"
      );

      return;
    }

    setLoading(true);

    try {
      /* =================================================
         VERIFY EMAIL
      ================================================= */

      const {
        verifiedToken,
      } =
        await apiFetch<{
          verifiedToken: string;
        }>(
          "/checkout/verify-code",
          {
            method: "POST",

            body: {
              email:
                form.email.trim(),

              code,
            },
          }
        );

      /* =================================================
         CREATE ORDER
      ================================================= */

      const {
        order: placedOrder,
      } =
        await apiFetch<{
          order: Order;
        }>(
          "/checkout",
          {
            method: "POST",

            token,

            body: {
              verifiedToken,

              items:
                items.map(
                  (item) => ({
                    productId:
                      item.productId,

                    quantity:
                      Number(
                        item.quantity
                      ),
                  })
                ),

              fullName:
                form.fullName.trim(),

              phone:
                form.phone.trim(),

              division:
                form.division,

              district:
                form.district,

              /*
               * =================================================
               * IMPORTANT FIX
               *
               * Backend expects "area"
               * Frontend form internally uses "thana"
               * =================================================
               */
              area:
                form.thana.trim(),

              addressLine:
                form.addressLine.trim(),

              deliveryZone:
                form.deliveryZone,

              paymentMethod:
                form.paymentMethod,

              transactionId:
                form.paymentMethod !==
                "COD"
                  ? form.transactionId.trim()
                  : undefined,

              paymentProofUrl:
                form.paymentMethod !==
                "COD"
                  ? form.paymentProofUrl
                  : undefined,
            },
          }
        );

      setOrder(
        placedOrder
      );

      clear();

      setStep("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "অর্ডার করতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (
    items.length === 0 &&
    step !== "success"
  ) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-5">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            আপনার কার্ট খালি
          </h1>

          <p className="text-gray-500 mt-2">
            চেকআউট করার জন্য প্রথমে একটি
            প্রোডাক্ট কার্টে যোগ করুন।
          </p>

          <button
            onClick={() =>
              router.push(
                "/products"
              )
            }
            className="mt-6 rounded-xl bg-brand-500 px-6 py-3 text-white font-semibold hover:bg-brand-600 transition"
          >
            কেনাকাটা শুরু করুন →
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     SUCCESS PAGE
  ======================================================= */

  if (
    step === "success" &&
    order
  ) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl text-green-600">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-5">
            অর্ডার সফলভাবে সম্পন্ন হয়েছে!
          </h1>

          <p className="text-gray-500 mt-2">
            আপনার অর্ডারটি আমরা পেয়েছি।
          </p>

          <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                অর্ডার নম্বর
              </span>

              <span className="font-bold text-brand-600">
                {order.orderNumber}
              </span>
            </div>

            <div className="border-t my-4" />

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                মোট মূল্য
              </span>

              <span className="font-bold">
                {formatBDT(
                  order.total
                )}
              </span>
            </div>
          </div>

          <p className="text-sm text-brand-600 font-medium mt-5">
            অর্ডারটি বর্তমানে অপেক্ষমান অবস্থায়
            আছে। আমাদের টিম যাচাই করে শীঘ্রই
            নিশ্চিত করবে।
          </p>

          <p className="text-sm text-gray-400 mt-2">
            অর্ডার নিশ্চিতকরণ ইমেইল আপনার কাছে
            পাঠানো হয়েছে।
          </p>

          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/track-order"
              className="rounded-xl bg-brand-500 px-5 py-3 text-white font-semibold hover:bg-brand-600"
            >
              অর্ডার ট্র্যাক করুন
            </a>

            <a
              href="/"
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              হোমে ফিরুন
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     CHECKOUT UI
  ======================================================= */

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">

        <div className="mb-7">
          <p className="text-sm text-brand-600 font-semibold">
            ShopScape
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            চেকআউট
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            আপনার তথ্য দিন এবং অর্ডার সম্পন্ন করুন
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-5">

            {/* =================================================
                DETAILS
            ================================================= */}

            {step === "details" && (
              <form
                onSubmit={
                  handleSendCode
                }
                className="space-y-5"
              >

                {/* CUSTOMER */}

                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-lg">
                      👤
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        কাস্টমারের তথ্য
                      </h2>

                      <p className="text-xs text-gray-500">
                        আপনার যোগাযোগের তথ্য দিন
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">

                    <Field
                      label="পুরো নাম"
                      required
                    >
                      <input
                        required
                        value={
                          form.fullName
                        }
                        onChange={(e) =>
                          updateForm(
                            "fullName",
                            e.target.value
                          )
                        }
                        placeholder="আপনার নাম লিখুন"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field
                      label="মোবাইল নম্বর"
                      required
                      hint="উদাহরণ: 017XXXXXXXX"
                    >
                      <input
                        required
                        value={
                          form.phone
                        }
                        onChange={(e) =>
                          updateForm(
                            "phone",
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        maxLength={11}
                        inputMode="numeric"
                        placeholder="01XXXXXXXXX"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field
                        label="ইমেইল"
                        required
                        hint="অর্ডার ভেরিফিকেশনের জন্য ব্যবহার করা হবে"
                      >
                        <input
                          required
                          type="email"
                          value={
                            form.email
                          }
                          onChange={(e) =>
                            updateForm(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="example@gmail.com"
                          className={
                            inputClass
                          }
                        />
                      </Field>
                    </div>

                  </div>
                </section>

                {/* DELIVERY */}

                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                      📍
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        ডেলিভারি ঠিকানা
                      </h2>

                      <p className="text-xs text-gray-500">
                        যেখানে পণ্যটি ডেলিভারি দিতে হবে
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">

                    <Field
                      label="বিভাগ"
                      required
                    >
                      <select
                        required
                        value={
                          form.division
                        }
                        onChange={(e) =>
                          handleDivisionChange(
                            e.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        {DIVISIONS.map(
                          (division) => (
                            <option
                              key={
                                division
                              }
                              value={
                                division
                              }
                            >
                              {
                                division
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field
                      label="জেলা"
                      required
                    >
                      <select
                        required
                        value={
                          form.district
                        }
                        onChange={(e) =>
                          handleDistrictChange(
                            e.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        <option value="">
                          জেলা নির্বাচন করুন
                        </option>

                        {(
                          DISTRICTS[
                            form.division
                          ] ?? []
                        ).map(
                          (district) => (
                            <option
                              key={
                                district
                              }
                              value={
                                district
                              }
                            >
                              {
                                district
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    {/* THANA */}

                    <div className="sm:col-span-2">
                      <Field
                        label="থানা"
                        required
                        hint={
                          form.district ===
                          "ঢাকা"
                            ? "আপনার এলাকার থানা নির্বাচন করুন"
                            : "আপনার থানার নাম লিখুন"
                        }
                      >

                        {form.district ===
                        "ঢাকা" ? (
                          <select
                            required
                            value={
                              form.thana
                            }
                            onChange={(e) =>
                              handleThanaChange(
                                e.target.value
                              )
                            }
                            className={
                              inputClass
                            }
                          >
                            <option value="">
                              থানা নির্বাচন করুন
                            </option>

                            <optgroup label="ঢাকা সিটি — ৳70">
                              {DHAKA_CITY_THANAS.map(
                                (thana) => (
                                  <option
                                    key={
                                      thana
                                    }
                                    value={
                                      thana
                                    }
                                  >
                                    {
                                      thana
                                    }
                                  </option>
                                )
                              )}
                            </optgroup>

                            <optgroup label="ঢাকা Sub-Urban — ৳100">
                              {DHAKA_SUBURBAN_THANAS.map(
                                (thana) => (
                                  <option
                                    key={
                                      thana
                                    }
                                    value={
                                      thana
                                    }
                                  >
                                    {
                                      thana
                                    }
                                  </option>
                                )
                              )}
                            </optgroup>
                          </select>
                        ) : (
                          <input
                            required
                            value={
                              form.thana
                            }
                            onChange={(e) =>
                              updateForm(
                                "thana",
                                e.target.value
                              )
                            }
                            placeholder="থানার নাম লিখুন"
                            className={
                              inputClass
                            }
                          />
                        )}

                      </Field>
                    </div>

                    {/* DELIVERY STATUS */}

                    {form.thana && (
                      <div className="sm:col-span-2">
                        <div
                          className={`rounded-xl border p-4 ${
                            form.deliveryZone ===
                            "DHAKA_SUBURBAN"
                              ? "border-amber-200 bg-amber-50"
                              : form.deliveryZone ===
                                "DHAKA_CITY"
                              ? "border-blue-200 bg-blue-50"
                              : "border-green-200 bg-green-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">

                            <div>
                              <p className="font-semibold text-gray-900">
                                {form.deliveryZone ===
                                "DHAKA_SUBURBAN"
                                  ? "ঢাকা Sub-Urban Delivery"
                                  : form.deliveryZone ===
                                    "DHAKA_CITY"
                                  ? "ঢাকা City Delivery"
                                  : "সারা বাংলাদেশ Delivery"}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                নির্বাচিত থানা:{" "}
                                {
                                  form.thana
                                }
                              </p>
                            </div>

                            <span className="font-bold text-lg whitespace-nowrap">
                              ৳
                              {
                                deliveryCharge
                              }
                            </span>

                          </div>
                        </div>
                      </div>
                    )}

                    {/* ADDRESS */}

                    <div className="sm:col-span-2">
                      <Field
                        label="সম্পূর্ণ ঠিকানা"
                        required
                        hint="বাড়ি/ফ্ল্যাট, রোড, ল্যান্ডমার্ক ইত্যাদি লিখুন"
                      >
                        <textarea
                          required
                          rows={4}
                          value={
                            form.addressLine
                          }
                          onChange={(e) =>
                            updateForm(
                              "addressLine",
                              e.target.value
                            )
                          }
                          placeholder="বাড়ি নং, রোড নং, ল্যান্ডমার্ক..."
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                  </div>
                </section>

                {/* PAYMENT */}

                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">
                      💳
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        পেমেন্ট পদ্ধতি
                      </h2>

                      <p className="text-xs text-gray-500">
                        আপনার পছন্দের পেমেন্ট পদ্ধতি নির্বাচন করুন
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">

                    {PAYMENT_OPTIONS.map(
                      (option) => {
                        const active =
                          form.paymentMethod ===
                          option.value;

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() =>
                              updateForm(
                                "paymentMethod",
                                option.value
                              )
                            }
                            className={`text-left rounded-xl border-2 p-4 transition ${
                              active
                                ? "border-brand-500 bg-brand-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">

                              <span className="font-semibold">
                                {
                                  option.label
                                }
                              </span>

                              <span
                                className={`w-4 h-4 rounded-full border ${
                                  active
                                    ? "border-brand-500 bg-brand-500"
                                    : "border-gray-300"
                                }`}
                              />

                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              {
                                option.description
                              }
                            </p>
                          </button>
                        );
                      }
                    )}

                  </div>

                  {/* ONLINE PAYMENT */}

                  {form.paymentMethod !==
                    "COD" &&
                    paymentConfig && (
                      <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-5">

                        <div className="mb-4">

                          <p className="font-semibold text-gray-900">
                            {
                              form.paymentMethod ===
                              "BKASH"
                                ? "bKash"
                                : "Nagad"
                            }{" "}
                            Send Money
                          </p>

                          <p className="text-sm text-gray-600 mt-1">
                            নিচের নম্বরে টাকা Send Money
                            করে Transaction ID দিন।
                          </p>

                          <div className="mt-3 rounded-lg bg-white border border-orange-100 px-4 py-3">
                            <span className="text-lg font-bold text-brand-600">
                              {
                                form.paymentMethod ===
                                "BKASH"
                                  ? paymentConfig.bkashNumber
                                  : paymentConfig.nagadNumber
                              }
                            </span>
                          </div>

                        </div>

                        <div className="space-y-4">

                          <Field
                            label="Transaction ID (TrxID)"
                            required
                          >
                            <input
                              required
                              value={
                                form.transactionId
                              }
                              onChange={(e) =>
                                updateForm(
                                  "transactionId",
                                  e.target.value
                                )
                              }
                              placeholder="যেমন: 8N7A6B5C4D"
                              className={
                                inputClass
                              }
                            />
                          </Field>

                          <Field
                            label="Payment Screenshot"
                            required
                          >
                            {form.paymentProofUrl ? (
                              <div className="flex items-center gap-4">

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    form.paymentProofUrl
                                  }
                                  alt="Payment proof"
                                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    updateForm(
                                      "paymentProofUrl",
                                      ""
                                    );

                                    if (
                                      fileInputRef.current
                                    ) {
                                      fileInputRef.current.value =
                                        "";
                                    }
                                  }}
                                  className="text-sm font-medium text-red-500 hover:underline"
                                >
                                  ছবি পরিবর্তন করুন
                                </button>

                              </div>
                            ) : (
                              <input
                                ref={
                                  fileInputRef
                                }
                                type="file"
                                accept="image/*"
                                onChange={
                                  handleProofSelected
                                }
                                disabled={
                                  uploadingProof
                                }
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                              />
                            )}

                            {uploadingProof && (
                              <p className="text-xs text-gray-500 mt-2">
                                স্ক্রিনশট আপলোড হচ্ছে...
                              </p>
                            )}
                          </Field>

                        </div>
                      </div>
                    )}

                </section>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingProof
                  }
                  className="w-full rounded-xl bg-brand-500 py-3.5 text-white font-bold shadow-sm hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "ভেরিফিকেশন কোড পাঠানো হচ্ছে..."
                    : "অর্ডার কনফার্ম করতে এগিয়ে যান →"}
                </button>

              </form>
            )}

            {/* =================================================
                VERIFY
            ================================================= */}

            {step === "verify" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

                <div className="text-center max-w-md mx-auto">

                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 flex items-center justify-center text-2xl">
                    ✉️
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mt-5">
                    ইমেইল ভেরিফাই করুন
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold text-gray-700">
                      {
                        form.email
                      }
                    </span>{" "}
                    এ একটি ৬ সংখ্যার verification
                    code পাঠানো হয়েছে।
                  </p>

                  <form
                    onSubmit={
                      handleVerifyAndOrder
                    }
                    className="mt-7 space-y-4"
                  >

                    <input
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) =>
                        setCode(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      inputMode="numeric"
                      placeholder="000000"
                      className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />

                    {error && (
                      <p className="text-sm text-red-500">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        code.length !==
                          6
                      }
                      className="w-full rounded-xl bg-brand-500 py-3.5 text-white font-bold hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading
                        ? "অর্ডার তৈরি হচ্ছে..."
                        : "ভেরিফাই করে অর্ডার করুন"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep(
                          "details"
                        );
                      }}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      ← তথ্য পরিবর্তন করুন
                    </button>

                  </form>

                </div>
              </div>
            )}

          </div>

          {/* =================================================
              RIGHT - ORDER SUMMARY
          ================================================= */}

          <aside className="lg:sticky lg:top-24">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-100">

                <h2 className="font-bold text-gray-900">
                  অর্ডার সামারি
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {items.length} টি প্রোডাক্ট
                </p>

              </div>

              <div className="p-5">

                <div className="space-y-4">

                  {items.map(
                    (item) => (
                      <div
                        key={
                          item.productId
                        }
                        className="flex gap-3"
                      >

                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            🛍️
                          </div>
                        )}

                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatBDT(
                              Number(
                                item.price
                              ) *
                                Number(
                                  item.quantity
                                )
                            )}
                          </p>

                        </div>
                      </div>
                    )
                  )}

                </div>

                <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      পণ্যের মূল্য
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatBDT(
                        subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      ডেলিভারি চার্জ
                    </span>

                    <span className="font-semibold text-gray-800">
                      {formatBDT(
                        deliveryCharge
                      )}
                    </span>
                  </div>

                </div>

                <div className="border-t border-gray-200 mt-5 pt-5">

                  <div className="flex justify-between items-center gap-4">

                    <div>
                      <p className="font-bold text-gray-900">
                        সর্বমোট
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        পণ্য + ডেলিভারি
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-brand-600">
                      {formatBDT(
                        grandTotal
                      )}
                    </span>

                  </div>

                </div>

                {form.thana && (
                  <div
                    className={`mt-5 rounded-xl p-4 border ${
                      form.deliveryZone ===
                      "DHAKA_SUBURBAN"
                        ? "bg-amber-50 border-amber-100"
                        : form.deliveryZone ===
                          "DHAKA_CITY"
                        ? "bg-blue-50 border-blue-100"
                        : "bg-green-50 border-green-100"
                    }`}
                  >

                    <p className="text-xs font-semibold text-gray-700">
                      🚚 আপনার ডেলিভারি
                    </p>

                    <div className="mt-2 flex justify-between gap-3">

                      <div>

                        <p className="text-sm font-semibold text-gray-800">
                          {form.deliveryZone ===
                          "DHAKA_SUBURBAN"
                            ? "ঢাকা Sub-Urban"
                            : form.deliveryZone ===
                              "DHAKA_CITY"
                            ? "ঢাকা City"
                            : "সারা বাংলাদেশ"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {
                            form.thana
                          }
                        </p>

                      </div>

                      <span className="font-bold">
                        ৳
                        {
                          deliveryCharge
                        }
                      </span>

                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">

                  <p className="text-sm font-semibold text-gray-800">
                    🚚 ডেলিভারি চার্জ
                  </p>

                  <div className="mt-3 space-y-2.5 text-sm">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        ঢাকা সিটি
                      </span>

                      <span className="font-semibold">
                        ৳70
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        ঢাকা Sub-Urban
                      </span>

                      <span className="font-semibold">
                        ৳100
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        সারা বাংলাদেশ
                      </span>

                      <span className="font-semibold">
                        ৳120
                      </span>
                    </div>

                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-400 leading-5">
                  🔒 আপনার ব্যক্তিগত তথ্য নিরাপদে
                  সংরক্ষণ করা হয়।
                </div>

              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">

      <span className="block text-sm font-medium text-gray-700 mb-1.5">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </span>

      {children}

      {hint && (
        <span className="block text-xs text-gray-400 mt-1">
          {hint}
        </span>
      )}

    </label>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition";