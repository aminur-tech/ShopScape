import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopScape",
  description: "সারা বাংলাদেশে হোম ডেলিভারি - ক্যাশ অন ডেলিভারি",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="font-sans antialiased bg-white text-[15px]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
