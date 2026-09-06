import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";

import { Providers } from "./providers";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "ShopScape",
  description: "ShopScape Online Store",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}