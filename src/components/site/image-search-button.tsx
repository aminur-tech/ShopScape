"use client";

import { Image as ImageIcon } from "lucide-react";
import { ChangeEvent, RefObject } from "react";

type ImageSearchButtonProps = {
  inputRef: RefObject<HTMLInputElement>;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ImageSearchButton({
  inputRef,
  disabled,
  onChange,
}: ImageSearchButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="ছবি দিয়ে সার্চ করুন"
        title="ছবি দিয়ে সার্চ করুন"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onChange}
        className="hidden"
      />
    </>
  );
}
