import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <CategoryNav />
      <main className="flex-1 container-page py-6">{children}</main>
      <Footer />
    </div>
  );
}
