"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import {
  apiFetch,
  ApiError,
  uploadFiles,
} from "@/lib/api";

import { formatBDT } from "@/lib/format";

import type {
  Category,
  Product,
} from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  sizeChart: string;
  sizes: string[];
  categoryId: string;
  images: string[];

  // শুধু available / unavailable
  isInStock: boolean;

  isFeatured: boolean;
  isActive: boolean;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  discountPercent: "",
  sizeChart: "",
  sizes: [],
  categoryId: "",
  images: [],
  isInStock: true,
  isFeatured: false,
  isActive: true,
};

const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

export function ProductForm({
  product,
}: {
  product?: Product;
}) {
  const { token } = useAuth();
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [form, setForm] =
    useState<FormState>(EMPTY);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  /*
   * =========================================================
   * LOAD CATEGORIES
   * =========================================================
   */

  useEffect(() => {
    apiFetch<{ categories: Category[] }>(
      "/categories"
    )
      .then((data) => {
        setCategories(data.categories);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  /*
   * =========================================================
   * LOAD EXISTING PRODUCT
   * =========================================================
   */

  useEffect(() => {
    if (!product) {
      setForm(EMPTY);
      return;
    }

    setForm({
      name: product.name,

      description:
        product.description ?? "",

      price: String(product.price),

      discountPercent:
        product.discountPercent != null
          ? String(product.discountPercent)
          : "",

      sizeChart:
        product.sizeChart ?? "",

      sizes:
        product.sizes ?? [],

      categoryId:
        product.categoryId ?? "",

      images:
        product.images ?? [],

      isInStock:
        product.stock > 0,

      isFeatured:
        product.isFeatured ?? false,

      isActive:
        product.isActive ?? true,
    });
  }, [product]);

  /*
   * =========================================================
   * MULTIPLE IMAGE UPLOAD
   * =========================================================
   */

  async function handleImagesSelected(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      e.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    if (!token) {
      setError(
        "আপনি লগইন করেননি। আবার লগইন করুন।"
      );
      return;
    }

    setError("");

    const totalImages =
      form.images.length + files.length;

    if (totalImages > 20) {
      setError(
        "একটি প্রোডাক্টে সর্বোচ্চ ২০টি ছবি রাখা যাবে।"
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setUploading(true);

    try {
      const result = await uploadFiles(
        "/uploads/admin",
        files,
        token
      );

      if (
        !result.success ||
        !result.urls ||
        result.urls.length === 0
      ) {
        throw new ApiError(
          "Supabase থেকে কোনো image URL পাওয়া যায়নি।",
          500
        );
      }

      setForm((current) => ({
        ...current,

        images: [
          ...current.images,
          ...result.urls,
        ],
      }));
    } catch (err) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        err
      );

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

  /*
   * =========================================================
   * REMOVE IMAGE
   * =========================================================
   */

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,

      images:
        current.images.filter(
          (image) => image !== url
        ),
    }));
  }

  /*
   * =========================================================
   * MAKE MAIN IMAGE
   * =========================================================
   */

  function makeMainImage(url: string) {
    setForm((current) => {
      const otherImages =
        current.images.filter(
          (image) => image !== url
        );

      return {
        ...current,

        images: [
          url,
          ...otherImages,
        ],
      };
    });
  }

  /*
   * =========================================================
   * SIZE
   * =========================================================
   */

  function toggleSize(size: string) {
    setForm((current) => {
      const exists =
        current.sizes.includes(size);

      return {
        ...current,

        sizes: exists
          ? current.sizes.filter(
            (item) => item !== size
          )
          : [
            ...current.sizes,
            size,
          ],
      };
    });
  }

  /*
   * =========================================================
   * PRICE
   * =========================================================
   */

  const priceNum =
    Number(form.price) || 0;

  const discountPercentNum =
    form.discountPercent.trim() !== ""
      ? Number(form.discountPercent)
      : null;

  const finalPrice =
    discountPercentNum != null
      ? Math.round(
        priceNum -
        (priceNum *
          discountPercentNum) /
        100
      )
      : priceNum;

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    /*
     * Name
     */

    if (!form.name.trim()) {
      setError(
        "প্রোডাক্টের নাম দিন"
      );
      return;
    }

    /*
     * Price
     */

    if (priceNum <= 0) {
      setError(
        "সঠিক প্রোডাক্ট মূল্য দিন"
      );
      return;
    }

    /*
     * Category
     */

    if (!form.categoryId) {
      setError(
        "একটি ক্যাটাগরি নির্বাচন করুন"
      );
      return;
    }

    /*
     * Images
     */

    if (form.images.length === 0) {
      setError(
        "কমপক্ষে একটি প্রোডাক্ট ছবি যোগ করুন"
      );
      return;
    }

    /*
     * Discount
     */

    if (
      discountPercentNum != null &&
      (
        discountPercentNum < 0 ||
        discountPercentNum > 100
      )
    ) {
      setError(
        "ছাড় ০ থেকে ১০০ শতাংশের মধ্যে হতে হবে"
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim() ||
          undefined,

        price: priceNum,

        discountPercent:
          discountPercentNum ??
          undefined,

        sizeChart:
          form.sizeChart.trim() ||
          undefined,

        /*
         * [] হলে no size
         */
        sizes: form.sizes,

        /*
         * IMPORTANT:
         *
         * stock এখন quantity limit নয়।
         *
         * 1 = available
         * 0 = unavailable
         */
        stock:
          form.isInStock
            ? 1
            : 0,

        categoryId:
          form.categoryId,

        images:
          form.images,

        isFeatured:
          form.isFeatured,

        isActive:
          form.isActive,
      };

      /*
       * UPDATE
       */

      if (product) {
        await apiFetch(
          `/admin/products/${product.id}`,
          {
            method: "PUT",
            token,
            body: payload,
          }
        );
      }

      /*
       * CREATE
       */

      else {
        await apiFetch(
          "/admin/products",
          {
            method: "POST",
            token,
            body: payload,
          }
        );
      }

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "প্রোডাক্ট সেভ করতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl space-y-6"
    >
      {/* ================================================= */}
      {/* BASIC INFORMATION */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="প্রোডাক্ট তথ্য"
          description="প্রোডাক্টের নাম এবং বিস্তারিত তথ্য যোগ করুন।"
        />

        <div className="space-y-4">
          <Field label="প্রোডাক্টের নাম">
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="যেমনঃ Premium Cotton T-Shirt"
              className={inputClass}
            />
          </Field>

          <Field label="বিবরণ">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              rows={5}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
              className={inputClass}
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Customer যেন প্রোডাক্টটি সম্পর্কে
              পরিষ্কার ধারণা পায়।
            </p>
          </Field>
        </div>
      </section>

      {/* ================================================= */}
      {/* IMAGES */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="প্রোডাক্টের ছবি"
          description="একসাথে একাধিক ছবি select করে upload করতে পারবেন।"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.images.map(
            (url, index) => (
              <div
                key={`${url}-${index}`}
                className={`group relative aspect-square overflow-hidden rounded-xl border bg-gray-50 ${index === 0
                    ? "border-brand-500 ring-2 ring-brand-500/20"
                    : "border-gray-200"
                  }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product image ${index + 1
                    }`}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                  {index === 0
                    ? "প্রধান ছবি"
                    : `ছবি ${index + 1}`}
                </div>

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      makeMainImage(url)
                    }
                    className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-800 shadow hover:bg-white"
                  >
                    প্রধান করুন
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    removeImage(url)
                  }
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white transition hover:bg-red-600"
                  aria-label="ছবি মুছুন"
                >
                  ×
                </button>
              </div>
            )
          )}

          {/* MULTIPLE UPLOAD */}

          <label
            className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${uploading
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "cursor-pointer border-gray-300 text-gray-400 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
              }`}
          >
            {uploading ? (
              <>
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />

                <span className="text-xs">
                  আপলোড হচ্ছে...
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl leading-none">
                  +
                </span>

                <span className="mt-1 text-xs font-medium">
                  একাধিক ছবি যোগ করুন
                </span>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={
                handleImagesSelected
              }
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          প্রথম ছবিটি প্রধান ছবি হিসেবে ব্যবহার হবে।
          একসাথে একাধিক ছবি select করতে পারবেন।
        </p>
      </section>

      {/* ================================================= */}
      {/* PRICE */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="মূল্য নির্ধারণ"
          description="প্রোডাক্টের মূল মূল্য এবং discount দিন।"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="মূল দাম (৳)">
            <input
              required
              type="number"
              min={1}
              step={1}
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
              placeholder="0"
              className={inputClass}
            />
          </Field>

          <Field label="ছাড় (%) — ঐচ্ছিক">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={
                form.discountPercent
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  discountPercent:
                    e.target.value,
                })
              }
              placeholder="যেমনঃ 10"
              className={inputClass}
            />
          </Field>
        </div>

        {discountPercentNum !=
          null &&
          priceNum > 0 &&
          discountPercentNum >=
          0 &&
          discountPercentNum <=
          100 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  মূল দাম
                </span>

                <span className="text-sm text-gray-400 line-through">
                  {formatBDT(priceNum)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {discountPercentNum}% ছাড়ের পর
                </span>

                <span className="text-lg font-bold text-brand-600">
                  {formatBDT(finalPrice)}
                </span>
              </div>
            </div>
          )}
      </section>

      {/* ================================================= */}
      {/* STOCK + CATEGORY */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="স্টক ও ক্যাটাগরি"
          description="প্রোডাক্টটি বর্তমানে available কিনা এবং কোন category-এর তা নির্ধারণ করুন।"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="স্টক স্ট্যাটাস">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    isInStock: true,
                  })
                }
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${form.isInStock
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-500"
                  }`}
              >
                ✓ আছে
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    isInStock: false,
                  })
                }
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${!form.isInStock
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-500"
                  }`}
              >
                ✕ নেই
              </button>
            </div>
          </Field>

          <Field label="ক্যাটাগরি">
            <select
              required
              value={
                form.categoryId
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId:
                    e.target.value,
                })
              }
              className={inputClass}
            >
              <option value="">
                ক্যাটাগরি নির্বাচন করুন
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </Field>
        </div>
      </section>

      {/* ================================================= */}
      {/* SIZES */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="সাইজ"
          description="এই প্রোডাক্টের available size নির্বাচন করুন। Size না থাকলে কিছু select করার দরকার নেই।"
        />

        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(
            (size) => {
              const selected =
                form.sizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    toggleSize(size)
                  }
                  className={`min-w-[58px] rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${selected
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:bg-brand-50"
                    }`}
                >
                  {size}
                </button>
              );
            }
          )}
        </div>

        {form.sizes.length > 0 ? (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              নির্বাচিত সাইজ
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {form.sizes.join(", ")}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            কোনো সাইজ নেই — Customer সরাসরি quantity নির্বাচন করতে পারবে।
          </p>
        )}
      </section>

      {/* ================================================= */}
      {/* SIZE CHART */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <Field label="সাইজ চার্ট — ঐচ্ছিক">
          <textarea
            value={form.sizeChart}
            onChange={(e) =>
              setForm({
                ...form,
                sizeChart:
                  e.target.value,
              })
            }
            rows={5}
            placeholder={`S — বুক: 36", লম্বা: 28"
M — বুক: 38", লম্বা: 29"
L — বুক: 40", লম্বা: 30"
XL — বুক: 42", লম্বা: 31"`}
            className={inputClass}
          />
        </Field>
      </section>

      {/* ================================================= */}
      {/* SETTINGS */}
      {/* ================================================= */}

      <section className={sectionClass}>
        <SectionHeader
          title="প্রোডাক্ট সেটিংস"
          description="Homepage এবং customer visibility নিয়ন্ত্রণ করুন।"
        />

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={
                form.isFeatured
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  isFeatured:
                    e.target.checked,
                })
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-gray-900">
                Featured Product
              </p>

              <p className="text-xs text-gray-500">
                Homepage বা featured section-এ দেখানো হবে।
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive:
                    e.target.checked,
                })
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-gray-900">
                Active Product
              </p>

              <p className="text-xs text-gray-500">
                Customer-দের কাছে প্রোডাক্টটি visible থাকবে।
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* SUBMIT */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          disabled={
            loading ||
            uploading
          }
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          বাতিল
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            uploading
          }
          className="rounded-lg bg-brand-500 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "সেভ হচ্ছে..."
            : product
              ? "প্রোডাক্ট আপডেট করুন"
              : "প্রোডাক্ট যোগ করুন"}
        </button>
      </div>
    </form>
  );
}

/*
 * =========================================================
 * REUSABLE COMPONENTS
 * =========================================================
 */

const sectionClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}