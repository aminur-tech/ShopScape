"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

import type { Banner } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminBannersPage() {
  const { token } = useAuth();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Load Banners                                                             */
  /* ------------------------------------------------------------------------ */

  async function load() {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch<{ banners: Banner[] }>(
        "/admin/banners",
        {
          token,
        }
      );

      setBanners(data.banners ?? []);
    } catch (err) {
      console.error("Banner load error:", err);

      setError(
        err instanceof ApiError
          ? err.message
          : "ব্যানার লোড করা যায়নি"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Initial Load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!token) return;

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ------------------------------------------------------------------------ */
  /* Upload Multiple Images                                                   */
  /* ------------------------------------------------------------------------ */

  async function handleFileSelected(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files ?? []);

    if (!files.length || !token) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      let sortOrder = banners.length + 1;

      for (const file of files) {
        const result = await uploadFile(
          "/uploads/admin",
          file,
          token
        );

        const url = result.urls?.[0];

        if (!url) {
          throw new Error(
            `"${file.name}" আপলোডের পর image URL পাওয়া যায়নি`
          );
        }

        await apiFetch("/admin/banners", {
          method: "POST",
          token,
          body: {
            imageUrl: url,
            sortOrder,
          },
        });

        sortOrder++;
      }

      await load();
    } catch (err) {
      console.error("Banner upload error:", err);

      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "ছবি আপলোড ব্যর্থ হয়েছে"
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Toggle Active Status                                                     */
  /* ------------------------------------------------------------------------ */

  async function handleToggleActive(
    banner: Banner
  ) {
    if (!token) return;

    try {
      setError("");

      await apiFetch(
        `/admin/banners/${banner.id}`,
        {
          method: "PUT",
          token,
          body: {
            isActive:
              banner.isActive === false,
          },
        }
      );

      await load();
    } catch (err) {
      console.error(
        "Banner status error:",
        err
      );

      setError(
        err instanceof ApiError
          ? err.message
          : "স্ট্যাটাস পরিবর্তন করা যায়নি"
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete Banner                                                            */
  /* ------------------------------------------------------------------------ */

  async function handleDelete(id: string) {
    if (!token) return;

    const confirmed = window.confirm(
      "এই ব্যানারটি মুছে ফেলতে চান?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/admin/banners/${id}`,
        {
          method: "DELETE",
          token,
        }
      );

      await load();
    } catch (err) {
      console.error(
        "Banner delete error:",
        err
      );

      setError(
        err instanceof ApiError
          ? err.message
          : "ব্যানার মুছে ফেলা যায়নি"
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full space-y-5 pb-24 lg:pb-10">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            ব্যানার
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm">
            হোম পেজের ক্যারোসেলে যেই ব্যানারগুলো
            স্লাইড হবে
          </p>
        </div>

        {/* Upload Button */}

        <label
          className={[
            "inline-flex min-h-10 w-full shrink-0 items-center justify-center",
            "rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
            "shadow-sm transition sm:w-auto",
            uploading
              ? "cursor-not-allowed bg-brand-500 opacity-60"
              : "cursor-pointer bg-brand-500 hover:bg-brand-600 active:scale-[0.98]",
          ].join(" ")}
        >
          {uploading
            ? "আপলোড হচ্ছে..."
            : "+ নতুন ব্যানার"}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelected}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* ================================================================== */}
      {/* Stats                                                               */}
      {/* ================================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            মোট ব্যানার
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {banners.length.toLocaleString("en-BD")}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {banners
              .filter(
                (banner) =>
                  banner.isActive !== false
              )
              .length.toLocaleString("en-BD")}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-medium text-gray-500">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {banners
              .filter(
                (banner) =>
                  banner.isActive === false
              )
              .length.toLocaleString("en-BD")}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Error                                                               */}
      {/* ================================================================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm leading-5 text-sale">
            {error}
          </p>
        </div>
      )}

      {/* ================================================================== */}
      {/* Banner Section                                                      */}
      {/* ================================================================== */}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Section Header */}

        <div className="flex flex-col gap-1 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              সকল ব্যানার
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Banner order এবং active status পরিচালনা করুন
            </p>
          </div>

          {loading && (
            <span className="text-xs text-gray-400">
              লোড হচ্ছে...
            </span>
          )}
        </div>

        {/* ================================================================= */}
        {/* Loading                                                           */}
        {/* ================================================================= */}

        {loading ? (
          <BannerSkeleton />
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                uploading={uploading}
                onToggle={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}

/* ========================================================================== */
/* Banner Card                                                                */
/* ========================================================================== */

function BannerCard({
  banner,
  uploading,
  onToggle,
  onDelete,
}: {
  banner: Banner;
  uploading: boolean;
  onToggle: (banner: Banner) => void;
  onDelete: (id: string) => void;
}) {
  const active = banner.isActive !== false;

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* ------------------------------------------------------------------ */}
      {/* Image                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative aspect-[3/1] min-h-[110px] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imageUrl}
          alt={banner.title ?? "Banner"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Status */}

        <div className="absolute right-2 top-2">
          {active ? (
            <span className="inline-flex rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
              Active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-gray-700/80 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-3 sm:p-4">
        {/* Banner Info */}

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400">
              Sort Order
            </p>

            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              #{banner.sortOrder}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-medium text-gray-400">
              Status
            </p>

            <p
              className={[
                "mt-0.5 text-xs font-semibold",
                active
                  ? "text-green-600"
                  : "text-gray-500",
              ].join(" ")}
            >
              {active
                ? "সক্রিয়"
                : "নিষ্ক্রিয়"}
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Actions                                                          */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggle(banner)}
            disabled={uploading}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {active
              ? "নিষ্ক্রিয় করুন"
              : "সক্রিয় করুন"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(banner.id)}
            disabled={uploading}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-sale transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            মুছুন
          </button>
        </div>
      </div>
    </article>
  );
}

/* ========================================================================== */
/* Banner Skeleton                                                            */
/* ========================================================================== */

function BannerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(
        (item) => (
          <div
            key={item}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white"
          >
            <div className="aspect-[3/1] animate-pulse bg-gray-100" />

            <div className="space-y-3 p-4">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />

              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />

                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyState() {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
        🖼️
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-800">
        এখনো কোনো ব্যানার নেই
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
        উপরের &quot;+ নতুন ব্যানার&quot; বাটনে
        ক্লিক করে banner image upload করুন।
      </p>
    </div>
  );
}