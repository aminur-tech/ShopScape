export function formatBDT(
  amount: number | null | undefined
): string {
  const safeAmount =
    typeof amount === "number" &&
    Number.isFinite(amount)
      ? amount
      : 0;

  return `৳ ${safeAmount.toLocaleString(
    "en-BD"
  )}`;
}

export const STATUS_LABELS_BN: Record<
  string,
  string
> = {
  PENDING: "অপেক্ষমান",
  CONFIRMED: "নিশ্চিত হয়েছে",
  PROCESSING: "প্রসেসিং চলছে",
  SHIPPED: "পাঠানো হয়েছে",
  DELIVERED: "ডেলিভারি হয়েছে",
  CANCELLED: "বাতিল হয়েছে",
};