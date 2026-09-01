"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartLine } from "@/lib/types";

/*
|--------------------------------------------------------------------------
| Cart Context Type
|--------------------------------------------------------------------------
*/

type CartContextType = {
  items: CartLine[];

  count: number;

  addItem: (
    item: Omit<CartLine, "quantity">,
    quantity?: number
  ) => void;

  removeItem: (
    cartLineId: string
  ) => void;

  updateQuantity: (
    cartLineId: string,
    quantity: number
  ) => void;

  clearCart: () => void;
};

/*
|--------------------------------------------------------------------------
| Context
|--------------------------------------------------------------------------
*/

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| Local Storage
|--------------------------------------------------------------------------
*/

const CART_STORAGE_KEY = "shopscape-cart";

/*
|--------------------------------------------------------------------------
| Cart Provider
|--------------------------------------------------------------------------
*/

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartLine[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const storedCart =
        window.localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (storedCart) {
        const parsedCart =
          JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Save Cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [items, hydrated]);

  /*
  |--------------------------------------------------------------------------
  | Add Item
  |--------------------------------------------------------------------------
  */

  function addItem(
    item: Omit<CartLine, "quantity">,
    quantity = 1
  ) {
    if (quantity <= 0) return;
    if (item.maxStock <= 0) return;

    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (cartItem) =>
            cartItem.cartLineId ===
            item.cartLineId
        );

      /*
      |----------------------------------------------------------------------
      | Existing Item
      |----------------------------------------------------------------------
      */

      if (existingItem) {
        const newQuantity =
          Math.min(
            existingItem.quantity +
              quantity,
            existingItem.maxStock
          );

        return currentItems.map(
          (cartItem) =>
            cartItem.cartLineId ===
            item.cartLineId
              ? {
                  ...cartItem,
                  quantity:
                    newQuantity,
                }
              : cartItem
        );
      }

      /*
      |----------------------------------------------------------------------
      | New Item
      |----------------------------------------------------------------------
      */

      const safeQuantity =
        Math.min(
          quantity,
          item.maxStock
        );

      return [
        ...currentItems,
        {
          ...item,
          quantity:
            safeQuantity,
        },
      ];
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Remove Item
  |--------------------------------------------------------------------------
  */

  function removeItem(
    cartLineId: string
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.cartLineId !==
          cartLineId
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Update Quantity
  |--------------------------------------------------------------------------
  */

  function updateQuantity(
    cartLineId: string,
    quantity: number
  ) {
    setItems((currentItems) => {
      /*
      |----------------------------------------------------------------------
      | Quantity <= 0
      |----------------------------------------------------------------------
      */

      if (quantity <= 0) {
        return currentItems.filter(
          (item) =>
            item.cartLineId !==
            cartLineId
        );
      }

      /*
      |----------------------------------------------------------------------
      | Update
      |----------------------------------------------------------------------
      */

      return currentItems.map(
        (item) => {
          if (
            item.cartLineId !==
            cartLineId
          ) {
            return item;
          }

          const safeQuantity =
            Math.min(
              quantity,
              item.maxStock
            );

          return {
            ...item,
            quantity:
              safeQuantity,
          };
        }
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Clear Cart
  |--------------------------------------------------------------------------
  */

  function clearCart() {
    setItems([]);
  }

  /*
  |--------------------------------------------------------------------------
  | Total Quantity
  |--------------------------------------------------------------------------
  */

  const count = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [items]);

  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = useMemo<CartContextType>(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, count]
  );

  /*
  |--------------------------------------------------------------------------
  | Provider
  |--------------------------------------------------------------------------
  */

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useCart
|--------------------------------------------------------------------------
*/

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}