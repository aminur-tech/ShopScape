const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/* =========================================================
   API ERROR
========================================================= */

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);

    this.status = status;

    this.name = "ApiError";
  }
}

/* =========================================================
   FETCH OPTIONS
========================================================= */

type FetchOptions = {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

  body?: unknown;

  token?: string | null;

  cache?: RequestCache;
};

/* =========================================================
   API FETCH
========================================================= */

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const res = await fetch(
    `${API_URL}${path}`,
    {
      method:
        options.method ?? "GET",

      headers: {
        "Content-Type":
          "application/json",

        ...(options.token
          ? {
              Authorization: `Bearer ${options.token}`,
            }
          : {}),
      },

      body:
        options.body !== undefined
          ? JSON.stringify(
              options.body
            )
          : undefined,

      cache:
        options.cache ??
        "no-store",
    }
  );

  const data =
    await res
      .json()
      .catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        "কিছু একটা সমস্যা হয়েছে",

      res.status
    );
  }

  return data as T;
}

/* =========================================================
   MULTIPLE FILE UPLOAD
========================================================= */

export async function uploadFiles(
  path: string,
  files: File[],
  token?: string | null
): Promise<{
  success: boolean;
  message: string;
  urls: string[];
}> {
  if (
    !files ||
    files.length === 0
  ) {
    throw new ApiError(
      "কোনো ছবি নির্বাচন করা হয়নি",
      400
    );
  }

  if (
    files.length > 20
  ) {
    throw new ApiError(
      "একসাথে সর্বোচ্চ 20টি ছবি আপলোড করা যাবে",
      400
    );
  }

  const formData =
    new FormData();

  for (
    const file of files
  ) {
    formData.append(
      "files",
      file
    );
  }

  const res = await fetch(
    `${API_URL}${path}`,
    {
      method: "POST",

      headers: token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : undefined,

      /*
       * Do NOT set Content-Type.
       * Browser will automatically
       * add multipart boundary.
       */
      body: formData,
    }
  );

  const data =
    await res
      .json()
      .catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        "ছবি আপলোড ব্যর্থ হয়েছে",

      res.status
    );
  }

  return data;
}

/* =========================================================
   SINGLE FILE UPLOAD
========================================================= */

export async function uploadFile(
  path: string,
  file: File,
  token?: string | null
): Promise<{
  success: boolean;
  message: string;
  urls: string[];
}> {
  return uploadFiles(
    path,
    [file],
    token
  );
}

/* =========================================================
   DOWNLOAD INVOICE
========================================================= */

export async function downloadMyInvoice(
  orderId: string,
  token: string,
  filename: string
) {
  const res = await fetch(
    `${API_URL}/orders/${orderId}/invoice`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new ApiError(
      "ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে",
      res.status
    );
  }

  const blob =
    await res.blob();

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );
}

/* =========================================================
   PUBLIC INVOICE URL
========================================================= */

export function publicInvoiceUrl(
  orderNumber: string,
  phone: string
): string {
  const params =
    new URLSearchParams({
      orderNumber,
      phone,
    });

  return `${API_URL}/orders/track/invoice?${params.toString()}`;
}