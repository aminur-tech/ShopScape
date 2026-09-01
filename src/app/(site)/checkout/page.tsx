"use client";

import CheckoutForm from "@/components/site/CheckoutForm";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items } = useCart();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            আপনার তথ্য ও ডেলিভারি ঠিকানা দিন
          </p>
        </div>

        <CheckoutForm
          items={items}
          onSuccess={(order) => {
            console.log("Order created:", order);
          }}
        />
      </div>
    </main>
  );
}