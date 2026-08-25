export function TopBar() {
  const items = [
    { icon: "📞", label: "সাপোর্ট সেন্টার: 01327694078 (whatsapp)" },
    { icon: "💳", label: "ক্যাশ অন ডেলিভারি" },
    { icon: "✔️", label: "মানসম্মত প্রোডাক্ট" },
    { icon: "✉️", label: "সারা বাংলাদেশ হোম ডেলিভারি" },
  ];
  return (
    <div className="hidden md:block bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
      <div className="container-page flex items-center justify-between py-2">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
