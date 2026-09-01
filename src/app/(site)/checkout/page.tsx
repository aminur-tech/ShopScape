"use client";

import CheckoutForm from "@/components/site/CheckoutForm";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
    const { items } = useCart();

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
            <div className="mx-auto max-w-7xl">

                {/* Page Header */}

                <div className="mb-8">

                    <div className="mb-3 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Secure Checkout
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Checkout
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        আপনার তথ্য ও ডেলিভারি ঠিকানা দিন
                    </p>
                </div>

                {/* Checkout */}

                <CheckoutForm
                    items={items}
                    onSuccess={(order) => {
                        console.log(
                            "Order created:",
                            order
                        );
                    }}
                />
            </div>
        </main>
    );
}