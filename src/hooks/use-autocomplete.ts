"use client";

import { useEffect, useState } from "react";
import { autocompleteSearch, type AutocompleteResponse } from "@/lib/api";

const emptyData: AutocompleteResponse = { suggestions: [], categories: [], keywords: [] };

export function useAutocomplete(query: string) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = query.trim();
    if (!value) {
      setData(emptyData);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await autocompleteSearch(value, controller.signal));
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") {
          setData(emptyData);
          setError("সাজেশন আনা যায়নি");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 275);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { data, loading, error };
}
