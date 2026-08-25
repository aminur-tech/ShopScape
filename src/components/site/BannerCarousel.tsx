"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Banner } from "@/lib/types";

const SLIDE_INTERVAL_MS = 5000;

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch<{ banners: Banner[] }>("/banners")
      .then((d) => setBanners(d.banners))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [banners]);

  if (banners === null) {
    return (
      <div className="h-[140px] sm:h-[200px] md:h-[260px] lg:h-[320px] xl:h-[380px] w-full rounded-md bg-gray-100 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const current = banners[index];

  const Slide = (
    <div className="relative h-[140px] sm:h-[200px] md:h-[260px] lg:h-[320px] xl:h-[380px] w-full overflow-hidden rounded-md bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.imageUrl}
        alt={current.title ?? "banner"}
        className="h-full w-full object-cover"
      />
    </div>
  );

  return (
    <div className="relative w-full">
      {current.linkUrl ? (
        <Link href={current.linkUrl}>{Slide}</Link>
      ) : (
        Slide
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`স্লাইড ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}