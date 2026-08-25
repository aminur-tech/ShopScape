"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";
import type { Banner } from "@/lib/types";

export default function AdminBannersPage() {
  const { token } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!token) return;
    const data = await apiFetch<{ banners: Banner[] }>("/admin/banners", { token });
    setBanners(data.banners);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setError("");
    setUploading(true);
    try {
      const { url } = await uploadFile("/uploads/admin", file, token);
      await apiFetch("/admin/banners", {
        method: "POST",
        token,
        body: { imageUrl: url, sortOrder: banners.length + 1 },
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleToggleActive(banner: Banner) {
    await apiFetch(`/admin/banners/${banner.id}`, {
      method: "PUT",
      token,
      body: { isActive: !banner.isActive },
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("এই ব্যানারটি মুছে ফেলতে চান?")) return;
    await apiFetch(`/admin/banners/${id}`, { method: "DELETE", token });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">ব্যানার</h1>
          <p className="text-sm text-gray-500 mt-1">হোম পেজের ক্যারোসেলে যেই ব্যানারগুলো স্লাইড হবে</p>
        </div>
        <label className="rounded-md bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 cursor-pointer">
          {uploading ? "আপলোড হচ্ছে..." : "+ নতুন ব্যানার"}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelected} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error && <p className="text-sale text-sm mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="border border-gray-100 rounded-md overflow-hidden">
            <div className="aspect-[3/1] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt={banner.title ?? ""} className="h-full w-full object-cover" />
            </div>
            <div className="p-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">ক্রম: {banner.sortOrder}</span>
              <div className="flex gap-3">
                <button onClick={() => handleToggleActive(banner)} className="text-brand-600 hover:underline">
                  {banner.isActive === false ? "সক্রিয় করুন" : "নিষ্ক্রিয় করুন"}
                </button>
                <button onClick={() => handleDelete(banner.id)} className="text-sale hover:underline">মুছুন</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {banners.length === 0 && <p className="text-gray-500">এখনো কোনো ব্যানার নেই। উপরের বাটনে ছবি আপলোড করুন।</p>}
    </div>
  );
}
