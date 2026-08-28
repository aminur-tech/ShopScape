"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

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

/* ========================================================================= */
/* Types                                                                    */
/* ========================================================================= */

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

type FormState = {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  sizeChart: string;

  sizes: string[];

  parentCategoryId: string;
  categoryId: string;

  images: string[];

  isInStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
};

/* ========================================================================= */
/* Initial State                                                             */
/* ========================================================================= */

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  discountPercent: "",
  sizeChart: "",

  sizes: [],

  parentCategoryId: "",
  categoryId: "",

  images: [],

  isInStock: true,
  isFeatured: false,
  isActive: true,
};

/* ========================================================================= */
/* Default Sizes                                                             */
/* ========================================================================= */

const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

/* ========================================================================= */
/* Component                                                                 */
/* ========================================================================= */

export function ProductForm({
  product,
}: {
  product?: Product;
}) {
  const { token } = useAuth();

  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* ----------------------------------------------------------------------- */
  /* Categories                                                              */
  /* ----------------------------------------------------------------------- */

  const [categories, setCategories] =
    useState<CategoryWithChildren[]>([]);

  const [categoryLoading, setCategoryLoading] =
    useState(true);

  /* ----------------------------------------------------------------------- */
  /* Form                                                                    */
  /* ----------------------------------------------------------------------- */

  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  /* ----------------------------------------------------------------------- */
  /* Custom Size                                                             */
  /* ----------------------------------------------------------------------- */

  const [customSize, setCustomSize] =
    useState("");

  const [
    showCustomSizeInput,
    setShowCustomSizeInput,
  ] = useState(false);

  /* ----------------------------------------------------------------------- */
  /* States                                                                  */
  /* ----------------------------------------------------------------------- */

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  /* ========================================================================= */
  /* LOAD ADMIN CATEGORIES                                                    */
  /* ========================================================================= */

  useEffect(() => {
    if (!token) {
      setCategoryLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      setCategoryLoading(true);

      try {
        /*
         * IMPORTANT:
         *
         * এখানে /categories ব্যবহার করা যাবে না।
         *
         * /admin/categories endpoint শুধুমাত্র
         * parent/root categories return করবে।
         *
         * প্রতিটি parent-এর children-এর মধ্যে
         * subcategory থাকবে।
         */

        const data =
          await apiFetch<{
            categories: CategoryWithChildren[];
          }>("/admin/categories", {
            token,
          });

        if (!cancelled) {
          setCategories(
            data.categories ?? []
          );
        }
      } catch (err) {
        console.error(
          "CATEGORY LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setCategories([]);

          setError(
            err instanceof ApiError
              ? err.message
              : "ক্যাটাগরি লোড করতে সমস্যা হয়েছে"
          );
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ========================================================================= */
  /* LOAD EXISTING PRODUCT                                                     */
  /* ========================================================================= */

  useEffect(() => {
    if (!product) {
      setForm(EMPTY_FORM);
      return;
    }

    const productCategory =
      product.category;

    /*
     * Product category হতে পারে:
     *
     * 1. Parent category
     * 2. Subcategory
     */

    const isSubcategory =
      Boolean(productCategory?.parentId);

    const parentCategoryId =
      isSubcategory
        ? productCategory?.parentId ?? ""
        : product.categoryId ?? "";

    const categoryId =
      product.categoryId ?? "";

    setForm({
      name: product.name ?? "",

      description:
        product.description ?? "",

      price:
        String(product.price ?? ""),

      discountPercent:
        product.discountPercent != null
          ? String(
              product.discountPercent
            )
          : "",

      sizeChart:
        product.sizeChart ?? "",

      sizes:
        product.sizes ?? [],

      parentCategoryId,

      categoryId,

      images:
        product.images ?? [],

      isInStock:
        Number(product.stock ?? 0) > 0,

      isFeatured:
        product.isFeatured ?? false,

      isActive:
        product.isActive ?? true,
    });
  }, [product]);

  /* ========================================================================= */
  /* SELECTED PARENT                                                           */
  /* ========================================================================= */

  const selectedParentCategory =
    categories.find(
      (category) =>
        category.id ===
        form.parentCategoryId
    );

  const subcategories =
    selectedParentCategory?.children ?? [];

  /* ========================================================================= */
  /* HELPERS                                                                   */
  /* ========================================================================= */

  function updateForm(
    changes: Partial<FormState>
  ) {
    setForm((current) => ({
      ...current,
      ...changes,
    }));
  }

  /* ========================================================================= */
  /* PARENT CATEGORY CHANGE                                                     */
  /* ========================================================================= */

  function handleParentCategoryChange(
    parentId: string
  ) {
    const parent =
      categories.find(
        (category) =>
          category.id === parentId
      );

    const children =
      parent?.children ?? [];

    /*
     * যদি parent-এর কোনো subcategory না থাকে,
     * তাহলে parent category-ই final category হবে।
     *
     * যদি subcategory থাকে,
     * তাহলে categoryId empty থাকবে।
     */

    updateForm({
      parentCategoryId: parentId,

      categoryId:
        children.length > 0
          ? ""
          : parentId,
    });

    setError("");
  }

  /* ========================================================================= */
  /* SUBCATEGORY CHANGE                                                        */
  /* ========================================================================= */

  function handleSubcategoryChange(
    subcategoryId: string
  ) {
    updateForm({
      categoryId:
        subcategoryId,
    });

    setError("");
  }

  /* ========================================================================= */
  /* IMAGE UPLOAD                                                              */
  /* ========================================================================= */

  async function handleImagesSelected(
    e: ChangeEvent<HTMLInputElement>
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
      form.images.length +
      files.length;

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
      const result =
        await uploadFiles(
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
          "কোনো image URL পাওয়া যায়নি।",
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

  /* ========================================================================= */
  /* REMOVE IMAGE                                                              */
  /* ========================================================================= */

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,

      images:
        current.images.filter(
          (image) => image !== url
        ),
    }));
  }

  /* ========================================================================= */
  /* MAKE MAIN IMAGE                                                           */
  /* ========================================================================= */

  function makeMainImage(url: string) {
    setForm((current) => {
      const otherImages =
        current.images.filter(
          (image) =>
            image !== url
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

  /* ========================================================================= */
  /* ADD SIZE                                                                  */
  /* ========================================================================= */

  function addSize(sizeValue?: string) {
    const value = (
      sizeValue ?? customSize
    ).trim();

    if (!value) {
      return;
    }

    const alreadyExists =
      form.sizes.some(
        (size) =>
          size.toLowerCase() ===
          value.toLowerCase()
      );

    if (alreadyExists) {
      setError(
        `"${value}" সাইজটি ইতিমধ্যে যোগ করা হয়েছে।`
      );

      return;
    }

    setError("");

    setForm((current) => ({
      ...current,

      sizes: [
        ...current.sizes,
        value,
      ],
    }));

    setCustomSize("");

    setShowCustomSizeInput(false);
  }

  /* ========================================================================= */
  /* CUSTOM SIZE KEYDOWN                                                       */
  /* ========================================================================= */

  function handleCustomSizeKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();

      addSize();
    }

    if (e.key === "Escape") {
      setCustomSize("");

      setShowCustomSizeInput(false);
    }
  }

  /* ========================================================================= */
  /* REMOVE SIZE                                                               */
  /* ========================================================================= */

  function removeSize(size: string) {
    setForm((current) => ({
      ...current,

      sizes:
        current.sizes.filter(
          (item) =>
            item !== size
        ),
    }));
  }

  /* ========================================================================= */
  /* TOGGLE DEFAULT SIZE                                                       */
  /* ========================================================================= */

  function toggleSize(size: string) {
    const exists =
      form.sizes.includes(size);

    if (exists) {
      removeSize(size);
      return;
    }

    setError("");

    setForm((current) => ({
      ...current,

      sizes: [
        ...current.sizes,
        size,
      ],
    }));
  }

  /* ========================================================================= */
  /* PRICE                                                                     */
  /* ========================================================================= */

  const priceNum =
    Number(form.price) || 0;

  const discountPercentNum =
    form.discountPercent.trim() !== ""
      ? Number(
          form.discountPercent
        )
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

  /* ========================================================================= */
  /* SELECTED CATEGORY NAME                                                    */
  /* ========================================================================= */

  function getSelectedCategoryLabel() {
    if (!form.categoryId) {
      return "";
    }

    const parent =
      categories.find(
        (category) =>
          category.id ===
          form.parentCategoryId
      );

    if (!parent) {
      return "";
    }

    const child =
      parent.children?.find(
        (item) =>
          item.id ===
          form.categoryId
      );

    if (child) {
      return `${parent.name} → ${child.name}`;
    }

    return parent.name;
  }

  /* ========================================================================= */
  /* SUBMIT                                                                     */
  /* ========================================================================= */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    /* --------------------------------------------------------------------- */
    /* Name                                                                  */
    /* --------------------------------------------------------------------- */

    if (!form.name.trim()) {
      setError(
        "প্রোডাক্টের নাম দিন"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Price                                                                 */
    /* --------------------------------------------------------------------- */

    if (priceNum <= 0) {
      setError(
        "সঠিক প্রোডাক্ট মূল্য দিন"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Parent Category                                                       */
    /* --------------------------------------------------------------------- */

    if (!form.parentCategoryId) {
      setError(
        "একটি ক্যাটাগরি নির্বাচন করুন"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Final Category                                                        */
    /* --------------------------------------------------------------------- */

    if (!form.categoryId) {
      setError(
        subcategories.length > 0
          ? "একটি সাবক্যাটাগরি নির্বাচন করুন"
          : "একটি ক্যাটাগরি নির্বাচন করুন"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Images                                                                */
    /* --------------------------------------------------------------------- */

    if (form.images.length === 0) {
      setError(
        "কমপক্ষে একটি প্রোডাক্ট ছবি যোগ করুন"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Discount                                                              */
    /* --------------------------------------------------------------------- */

    if (
      discountPercentNum != null &&
      (
        !Number.isInteger(
          discountPercentNum
        ) ||
        discountPercentNum < 0 ||
        discountPercentNum > 100
      )
    ) {
      setError(
        "ছাড় ০ থেকে ১০০ শতাংশের মধ্যে পূর্ণ সংখ্যা হতে হবে"
      );

      return;
    }

    /* --------------------------------------------------------------------- */
    /* Token                                                                 */
    /* --------------------------------------------------------------------- */

    if (!token) {
      setError(
        "আপনি লগইন করেননি। আবার লগইন করুন।"
      );

      return;
    }

    setLoading(true);

    try {
      const payload = {
        name:
          form.name.trim(),

        description:
          form.description.trim() ||
          undefined,

        price:
          priceNum,

        discountPercent:
          discountPercentNum ??
          undefined,

        sizeChart:
          form.sizeChart.trim() ||
          undefined,

        sizes:
          form.sizes,

        /*
         * 1 = in stock
         * 0 = out of stock
         */
        stock:
          form.isInStock
            ? 1
            : 0,

        /*
         * Final category:
         *
         * Subcategory ID
         * অথবা
         * Parent category ID
         */
        categoryId:
          form.categoryId,

        images:
          form.images,

        isFeatured:
          form.isFeatured,

        isActive:
          form.isActive,
      };

      if (product) {
        await apiFetch(
          `/admin/products/${product.id}`,
          {
            method: "PUT",
            token,
            body: payload,
          }
        );
      } else {
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
      console.error(
        "PRODUCT SAVE ERROR:",
        err
      );

      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "প্রোডাক্ট সেভ করতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================================= */
  /* UI                                                                        */
  /* ========================================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl space-y-6"
    >
      {/* =================================================================== */}
      {/* BASIC INFORMATION                                                    */}
      {/* =================================================================== */}

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
                updateForm({
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
                updateForm({
                  description:
                    e.target.value,
                })
              }
              rows={5}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
              className={inputClass}
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Customer যেন প্রোডাক্টটি
              সম্পর্কে পরিষ্কার ধারণা পায়।
            </p>
          </Field>
        </div>
      </section>

      {/* =================================================================== */}
      {/* IMAGES                                                               */}
      {/* =================================================================== */}

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
                className={`group relative aspect-square overflow-hidden rounded-xl border bg-gray-50 ${
                  index === 0
                    ? "border-brand-500 ring-2 ring-brand-500/20"
                    : "border-gray-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product image ${
                    index + 1
                  }`}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                  {index === 0
                    ? "প্রধান ছবি"
                    : `ছবি ${
                        index + 1
                      }`}
                </div>

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      makeMainImage(
                        url
                      )
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

          {form.images.length < 20 && (
            <label
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                uploading
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

                  <span className="mt-1 text-center text-xs font-medium">
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
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          প্রথম ছবিটি প্রধান ছবি হিসেবে
          ব্যবহার হবে। সর্বোচ্চ ২০টি ছবি।
        </p>
      </section>

      {/* =================================================================== */}
      {/* PRICE                                                                */}
      {/* =================================================================== */}

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
                updateForm({
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
                updateForm({
                  discountPercent:
                    e.target.value,
                })
              }
              placeholder="যেমনঃ 10"
              className={inputClass}
            />
          </Field>
        </div>

        {discountPercentNum != null &&
          priceNum > 0 &&
          discountPercentNum >= 0 &&
          discountPercentNum <= 100 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  মূল দাম
                </span>

                <span className="text-sm text-gray-400 line-through">
                  {formatBDT(
                    priceNum
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {
                    discountPercentNum
                  }
                  % ছাড়ের পর
                </span>

                <span className="text-lg font-bold text-brand-600">
                  {formatBDT(
                    finalPrice
                  )}
                </span>
              </div>
            </div>
          )}
      </section>

      {/* =================================================================== */}
      {/* CATEGORY + STOCK                                                     */}
      {/* =================================================================== */}

      <section className={sectionClass}>
        <SectionHeader
          title="স্টক ও ক্যাটাগরি"
          description="প্রোডাক্টের category এবং stock status নির্বাচন করুন।"
        />

        <div className="space-y-4">
          {/* ================================================================= */}
          {/* CATEGORY                                                           */}
          {/* ================================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="মূল ক্যাটাগরি">
              <select
                required
                value={
                  form.parentCategoryId
                }
                onChange={(e) =>
                  handleParentCategoryChange(
                    e.target.value
                  )
                }
                disabled={
                  categoryLoading
                }
                className={`${inputClass} ${
                  categoryLoading
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : ""
                }`}
              >
                <option value="">
                  {categoryLoading
                    ? "ক্যাটাগরি লোড হচ্ছে..."
                    : "ক্যাটাগরি নির্বাচন করুন"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            {/* =============================================================== */}
            {/* SUBCATEGORY                                                      */}
            {/* =============================================================== */}

            <Field label="সাবক্যাটাগরি">
              <select
                value={
                  form.categoryId
                }
                onChange={(e) =>
                  handleSubcategoryChange(
                    e.target.value
                  )
                }
                disabled={
                  !form.parentCategoryId ||
                  subcategories.length ===
                    0
                }
                className={`${inputClass} ${
                  !form.parentCategoryId ||
                  subcategories.length ===
                    0
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : ""
                }`}
              >
                {!form.parentCategoryId ? (
                  <option value="">
                    আগে ক্যাটাগরি নির্বাচন করুন
                  </option>
                ) : subcategories.length ===
                  0 ? (
                  <option
                    value={
                      form.parentCategoryId
                    }
                  >
                    এই ক্যাটাগরিতে সাবক্যাটাগরি নেই
                  </option>
                ) : (
                  <>
                    <option value="">
                      সাবক্যাটাগরি নির্বাচন করুন
                    </option>

                    {subcategories.map(
                      (subcategory) => (
                        <option
                          key={
                            subcategory.id
                          }
                          value={
                            subcategory.id
                          }
                        >
                          {
                            subcategory.name
                          }
                        </option>
                      )
                    )}
                  </>
                )}
              </select>
            </Field>
          </div>

          {/* ================================================================= */}
          {/* CATEGORY INFO                                                      */}
          {/* ================================================================= */}

          {form.categoryId && (
            <div className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-xs text-brand-600">
                নির্বাচিত ক্যাটাগরি
              </p>

              <p className="mt-1 text-sm font-semibold text-brand-700">
                {getSelectedCategoryLabel()}
              </p>
            </div>
          )}

          {/* ================================================================= */}
          {/* STOCK                                                              */}
          {/* ================================================================= */}

          <Field label="স্টক স্ট্যাটাস">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    isInStock: true,
                  })
                }
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                  form.isInStock
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                ✓ আছে
              </button>

              <button
                type="button"
                onClick={() =>
                  updateForm({
                    isInStock: false,
                  })
                }
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                  !form.isInStock
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                ✕ নেই
              </button>
            </div>
          </Field>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SIZES                                                                */}
      {/* =================================================================== */}

      <section className={sectionClass}>
        <SectionHeader
          title="সাইজ"
          description="Default size নির্বাচন করুন অথবা + বাটনে নিজের মতো নতুন size যোগ করুন।"
        />

        {/* DEFAULT SIZE BUTTONS */}

        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(
            (size) => {
              const selected =
                form.sizes.includes(
                  size
                );

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    toggleSize(
                      size
                    )
                  }
                  className={`min-w-[58px] rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:bg-brand-50"
                  }`}
                >
                  {size}
                </button>
              );
            }
          )}

          {/* NEW SIZE */}

          <button
            type="button"
            onClick={() => {
              setError("");

              setShowCustomSizeInput(
                (current) =>
                  !current
              );
            }}
            className="inline-flex min-w-[72px] items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-brand-400 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:border-brand-500 hover:bg-brand-100"
            title="নতুন সাইজ যোগ করুন"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-sm leading-none text-white">
              +
            </span>

            <span>
              নতুন
            </span>
          </button>
        </div>

        {/* CUSTOM SIZE INPUT */}

        {showCustomSizeInput && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800">
                নতুন সাইজ যোগ করুন
              </p>

              <p className="mt-1 text-xs text-gray-500">
                যেমন: 1-8 Years, Free Size,
                28, 30 অথবা 32
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                autoFocus
                type="text"
                value={
                  customSize
                }
                onChange={(e) =>
                  setCustomSize(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleCustomSizeKeyDown
                }
                placeholder="যেমন: 1-8 Years"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() =>
                  addSize()
                }
                disabled={
                  !customSize.trim()
                }
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                যোগ করুন
              </button>
            </div>
          </div>
        )}

        {/* SELECTED SIZES */}

        {form.sizes.length > 0 ? (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-gray-500">
              নির্বাচিত সাইজ
            </p>

            <div className="flex flex-wrap gap-2">
              {form.sizes.map(
                (size) => (
                  <div
                    key={size}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                  >
                    <span>
                      {size}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSize(
                          size
                        )
                      }
                      className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-brand-500 transition hover:bg-red-100 hover:text-red-600"
                      aria-label={`${size} remove`}
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">
              কোনো সাইজ নির্বাচন করা হয়নি।
              Size না থাকলে Customer সরাসরি
              quantity নির্বাচন করতে পারবে।
            </p>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* SIZE CHART                                                           */}
      {/* =================================================================== */}

      <section className={sectionClass}>
        <Field label="সাইজ চার্ট — ঐচ্ছিক">
          <textarea
            value={
              form.sizeChart
            }
            onChange={(e) =>
              updateForm({
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

      {/* =================================================================== */}
      {/* SETTINGS                                                             */}
      {/* =================================================================== */}

      <section className={sectionClass}>
        <SectionHeader
          title="প্রোডাক্ট সেটিংস"
          description="Homepage এবং customer visibility নিয়ন্ত্রণ করুন।"
        />

        <div className="space-y-3">
          {/* FEATURED */}

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={
                form.isFeatured
              }
              onChange={(e) =>
                updateForm({
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
                Homepage বা featured
                section-এ দেখানো হবে।
              </p>
            </div>
          </label>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(e) =>
                updateForm({
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
                Customer-দের কাছে
                প্রোডাক্টটি visible থাকবে।
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* =================================================================== */}
      {/* ERROR                                                                */}
      {/* =================================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUBMIT                                                               */}
      {/* =================================================================== */}

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
            uploading ||
            categoryLoading
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

/* ========================================================================= */
/* Reusable Components                                                       */
/* ========================================================================= */

const sectionClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

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
  children: ReactNode;
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