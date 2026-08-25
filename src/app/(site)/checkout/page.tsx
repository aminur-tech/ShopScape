"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";
import { formatBDT } from "@/lib/format";
import type { Order, PaymentMethod } from "@/lib/types";

type Step = "details" | "verify" | "success";

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

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "COD", label: "ক্যাশ অন ডেলিভারি" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { token, user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [code, setCode] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<{ bkashNumber: string; nagadNumber: string } | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: user?.email ?? "",
    phone: "",
    division: "ঢাকা",
    district: "",
    area: "",
    addressLine: "",
    paymentMethod: "COD" as PaymentMethod,
    transactionId: "",
    paymentProofUrl: "",
  });

  useEffect(() => {
    apiFetch<{ bkashNumber: string; nagadNumber: string }>("/checkout/payment-config")
      .then(setPaymentConfig)
      .catch(() => {});
  }, []);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleProofSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingProof(true);
    try {
      const { url } = await uploadFile("/uploads/payment-proof", file);
      updateForm("paymentProofUrl", url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "স্ক্রিনশট আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploadingProof(false);
    }
  }

  function validateBeforeSendCode(): string | null {
    if (form.paymentMethod !== "COD") {
      if (!form.transactionId.trim()) return "ট্রানজেকশন আইডি দিন";
      if (!form.paymentProofUrl) return "পেমেন্ট স্ক্রিনশট আপলোড করুন";
    }
    return null;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validationError = validateBeforeSendCode();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/checkout/send-code", { method: "POST", body: { email: form.email } });
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "কোড পাঠাতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { verifiedToken } = await apiFetch<{ verifiedToken: string }>("/checkout/verify-code", {
        method: "POST",
        body: { email: form.email, code },
      });

      const { order: placedOrder } = await apiFetch<{ order: Order }>("/checkout", {
        method: "POST",
        token,
        body: {
          verifiedToken,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          fullName: form.fullName,
          phone: form.phone,
          division: form.division,
          district: form.district,
          area: form.area,
          addressLine: form.addressLine,
          paymentMethod: form.paymentMethod,
          transactionId: form.paymentMethod !== "COD" ? form.transactionId : undefined,
          paymentProofUrl: form.paymentMethod !== "COD" ? form.paymentProofUrl : undefined,
        },
      });

      setOrder(placedOrder);
      clear();
      setStep("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "অর্ডার করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">আপনার কার্ট খালি, চেকআউট করার জন্য প্রথমে প্রোডাক্ট যোগ করুন।</p>
        <button onClick={() => router.push("/products")} className="text-brand-600 font-medium hover:underline">
          কেনাকাটা করুন →
        </button>
      </div>
    );
  }

  if (step === "success" && order) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-xl font-semibold mb-2">অর্ডার সম্পন্ন হয়েছে!</h1>
        <p className="text-gray-600">
          আপনার অর্ডার নম্বরঃ <span className="font-semibold text-brand-600">{order.orderNumber}</span>
        </p>
        <p className="text-gray-600 mt-1">মোট মূল্যঃ {formatBDT(order.total)}</p>
        <p className="text-sm text-brand-600 font-medium mt-3">
          অর্ডারটি বর্তমানে &ldquo;অপেক্ষমান&rdquo; অবস্থায় আছে — আমাদের টিম যাচাই করে শীঘ্রই নিশ্চিত করবে।
        </p>
        <p className="text-sm text-gray-400 mt-2">অর্ডার নিশ্চিতকরণ ইমেইল আপনার কাছে পাঠানো হয়েছে।</p>
        <div className="mt-6 flex justify-center gap-4">
          <a href="/track-order" className="text-brand-600 font-medium hover:underline">অর্ডার ট্র্যাক করুন</a>
          <a href="/" className="text-brand-600 font-medium hover:underline">হোমে ফিরুন</a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <div className="lg:col-span-2">
        <h1 className="text-xl font-semibold mb-4">চেকআউট</h1>

        {step === "details" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <Field label="পুরো নাম">
              <input required value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} className={inputClass} />
            </Field>
            <Field label="ইমেইল (ভেরিফিকেশন কোডের জন্য)">
              <input required type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className={inputClass} />
            </Field>
            <Field label="ফোন নম্বর">
              <input required value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="বিভাগ">
                <select value={form.division} onChange={(e) => updateForm("division", e.target.value)} className={inputClass}>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="জেলা">
                <input required value={form.district} onChange={(e) => updateForm("district", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="এলাকা">
              <input required value={form.area} onChange={(e) => updateForm("area", e.target.value)} className={inputClass} />
            </Field>
            <Field label="সম্পূর্ণ ঠিকানা">
              <textarea required value={form.addressLine} onChange={(e) => updateForm("addressLine", e.target.value)} className={inputClass} rows={3} />
            </Field>

            <Field label="পেমেন্ট পদ্ধতি">
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("paymentMethod", opt.value)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                      form.paymentMethod === opt.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {form.paymentMethod !== "COD" && paymentConfig && (
              <div className="rounded-md border border-brand-100 bg-brand-50 p-4 space-y-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{form.paymentMethod === "BKASH" ? "bKash" : "Nagad"}</span> এ Send Money করুনঃ{" "}
                  <span className="font-semibold text-brand-700">
                    {form.paymentMethod === "BKASH" ? paymentConfig.bkashNumber : paymentConfig.nagadNumber}
                  </span>
                </p>
                <Field label="ট্রানজেকশন আইডি (TrxID)">
                  <input
                    required
                    value={form.transactionId}
                    onChange={(e) => updateForm("transactionId", e.target.value)}
                    className={inputClass}
                    placeholder="যেমনঃ 8N7A6B5C4D"
                  />
                </Field>
                <Field label="পেমেন্ট স্ক্রিনশট">
                  {form.paymentProofUrl ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.paymentProofUrl} alt="payment proof" className="h-16 w-16 rounded object-cover border border-gray-200" />
                      <button type="button" onClick={() => updateForm("paymentProofUrl", "")} className="text-sale text-sm">
                        মুছে আবার দিন
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProofSelected}
                      disabled={uploadingProof}
                      className="text-sm"
                    />
                  )}
                  {uploadingProof && <p className="text-xs text-gray-500 mt-1">আপলোড হচ্ছে...</p>}
                </Field>
              </div>
            )}

            {error && <p className="text-sale text-sm">{error}</p>}

            <button disabled={loading || uploadingProof} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
              {loading ? "কোড পাঠানো হচ্ছে..." : "ইমেইল ভেরিফিকেশন কোড পাঠান"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyAndOrder} className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{form.email}</span> এ একটি ৬-সংখ্যার কোড পাঠানো হয়েছে। কোডটি নিচে দিন।
            </p>
            <Field label="ভেরিফিকেশন কোড">
              <input
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} tracking-[0.5em] text-center text-lg`}
              />
            </Field>

            {error && <p className="text-sale text-sm">{error}</p>}

            <button disabled={loading} className="w-full rounded-md bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 disabled:opacity-50">
              {loading ? "অর্ডার করা হচ্ছে..." : "কোড নিশ্চিত করে অর্ডার করুন"}
            </button>
            <button type="button" onClick={() => setStep("details")} className="w-full text-sm text-gray-500">
              ← তথ্য পরিবর্তন করুন
            </button>
          </form>
        )}
      </div>

      <div className="border border-gray-100 rounded-md p-5 h-fit">
        <h2 className="font-semibold mb-4">অর্ডার সামারি</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{i.name} × {i.quantity}</span>
            <span>{formatBDT(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
          <span>সাবটোটাল</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">ডেলিভারি চার্জ অর্ডার নিশ্চিত হওয়ার পর যোগ হবে (ঢাকা: ৳৭০, ঢাকার বাইরে: ৳১২০)</p>
        <p className="text-xs text-gray-500 mt-3">
          পেমেন্ট পদ্ধতিঃ {PAYMENT_OPTIONS.find((o) => o.value === form.paymentMethod)?.label}
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
