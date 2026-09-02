import Link from "next/link";

const COMPANY_LINKS = [
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/terms", label: "টার্মস এন্ড কন্ডিশন" },
  { href: "/contact", label: "যোগাযোগের ঠিকানা" },
];

const ECOMMERCE_LINKS = [
  { href: "/products?featured=true", label: "সেলস ক্যাম্পেইন" },
  { href: "/products?featured=true", label: "ফেভারিট প্রোডাক্ট" },
  { href: "/return-policy", label: "অর্ডার ও রিটার্ন পলিসি" },
];

const CUSTOMER_LINKS = [
  { href: "/account", label: "মাই প্রোফাইল" },
  { href: "/account?tab=orders", label: "মাই অর্ডার লিস্ট" },
];

export function Footer() {
  return (
    <footer className="mt-10 bg-brand-500 text-white">
      <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-sm">
        <div>
          <p className="text-xl font-bold mb-3">ShopScape</p>
          <p className="flex items-start gap-1">📞 কল করুন 01632370620 (whatsapp)</p>
          <p className="flex items-start gap-1 mt-1">
            📍 ঠিকানাঃ শপ-২৩০, এমজি প্লাজা, মহাম্মদপুর, ঢাকা-১২০৭, বাংলাদেশ
          </p>
        </div>

        <FooterColumn title="কোম্পানি" links={COMPANY_LINKS} />
        <FooterColumn title="ই-কমার্স" links={ECOMMERCE_LINKS} />
        <FooterColumn title="কাস্টমার" links={CUSTOMER_LINKS} />
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs">
        Copyright © {new Date().getFullYear()} All Rights by ShopScape.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-semibold border-b border-white/30 pb-2 mb-3 inline-block">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
