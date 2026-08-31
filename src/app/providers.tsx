"use client";

import type { ReactNode } from "react";

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CategoryUIProvider } from "@/lib/category-ui-context";

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <CategoryUIProvider>
          {children}
        </CategoryUIProvider>
      </CartProvider>
    </AuthProvider>
  );
}