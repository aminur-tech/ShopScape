"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (token && id) {
      apiFetch<{ product: Product }>(`/admin/products/${id}`, { token })
        .then((d) => setProduct(d.product))
        .catch(() => {});
    }
  }, [token, id]);

  if (!product) return <p className="text-gray-500">লোড হচ্ছে...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">প্রোডাক্ট এডিট করুন</h1>
      <ProductForm product={product} />
    </div>
  );
}
