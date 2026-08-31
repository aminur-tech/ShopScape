import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "./providers";

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}