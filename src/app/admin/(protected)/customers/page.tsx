"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    if (token) {
      apiFetch<{ customers: AdminCustomer[] }>("/admin/customers", { token }).then((d) => setCustomers(d.customers)).catch(() => {});
    }
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">কাস্টমার</h1>
      <table className="w-full text-sm border border-gray-100 rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2.5">নাম</th>
            <th className="text-left px-4 py-2.5">ইমেইল</th>
            <th className="text-left px-4 py-2.5">ফোন</th>
            <th className="text-left px-4 py-2.5">অর্ডার সংখ্যা</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t border-gray-50">
              <td className="px-4 py-2.5">{c.name}</td>
              <td className="px-4 py-2.5 text-gray-500">{c.email}</td>
              <td className="px-4 py-2.5 text-gray-500">{c.phone ?? "-"}</td>
              <td className="px-4 py-2.5">{c._count.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && <p className="text-gray-500 mt-4">কোনো কাস্টমার নেই।</p>}
    </div>
  );
}
