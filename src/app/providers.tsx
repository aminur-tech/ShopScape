"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
