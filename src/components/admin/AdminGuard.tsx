"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return <p className="p-10 text-center text-gray-500">লোড হচ্ছে...</p>;
  }

  return <>{children}</>;
}
