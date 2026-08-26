import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* STICKY HEADER AREA */}
      <div className="sticky top-0 z-50">
        <TopBar />
        <Header />
        <CategoryNav />
      </div>

      {/* PAGE CONTENT */}
      <main className="flex-1 container-page py-6">
        {children}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}