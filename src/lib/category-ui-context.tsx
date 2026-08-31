"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryUIContextValue = {
  isCategoryOpen: boolean;
  openCategory: () => void;
  closeCategory: () => void;
  toggleCategory: () => void;
};

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

const CategoryUIContext =
  createContext<CategoryUIContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function CategoryUIProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * Desktop sidebar default visible.
   *
   * Mobile CategorySidebar will automatically close
   * after mounting.
   */
  const [isCategoryOpen, setIsCategoryOpen] =
    useState(true);

  const openCategory = useCallback(() => {
    setIsCategoryOpen(true);
  }, []);

  const closeCategory = useCallback(() => {
    setIsCategoryOpen(false);
  }, []);

  const toggleCategory = useCallback(() => {
    setIsCategoryOpen((previous) => !previous);
  }, []);

  const value = useMemo(
    () => ({
      isCategoryOpen,
      openCategory,
      closeCategory,
      toggleCategory,
    }),
    [
      isCategoryOpen,
      openCategory,
      closeCategory,
      toggleCategory,
    ],
  );

  return (
    <CategoryUIContext.Provider value={value}>
      {children}
    </CategoryUIContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCategoryUI() {
  const context =
    useContext(CategoryUIContext);

  if (!context) {
    throw new Error(
      "useCategoryUI must be used inside CategoryUIProvider",
    );
  }

  return context;
}