"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/lib/types";

/*
|--------------------------------------------------------------------------
| Cart Item
|--------------------------------------------------------------------------
*/

export type CartItem = {
  cartLineId: string;

  productId: string;
  name: string;

  price: number;

  image: string | null;

  selectedColor: string | null;
  selectedSize: string | null;

  maxStock: number;

  quantity: number;
};

/*
|--------------------------------------------------------------------------
| Cart Context Type
|--------------------------------------------------------------------------
*/

type CartContextType = {
  items: CartItem[];

  /**
   * Total quantity of all cart items.
   *
   * Example:
   * Product A = 2
   * Product B = 3
   * count = 5
   */
  count: number;

  /**
   * Add product to cart.
   */
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => void;

  /**
   * Remove cart item using cartLineId.
   */
  removeItem: (cartLineId: string) => void;

  /**
   * Update cart item quantity.
   */
  updateQuantity: (
    cartLineId: string,
    quantity: number
  ) => void;

  /**
   * Remove everything from cart.
   */
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
| Local Storage Key
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
  const [items, setItems] = useState<CartItem[]>(
    []
  );

  const [hydrated, setHydrated] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load cart from localStorage
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
  | Save cart to localStorage
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
    item: Omit<CartItem, "quantity">,
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
      |--------------------------------------------------------------------------
      | Existing item
      |--------------------------------------------------------------------------
      */

      if (existingItem) {
        const newQuantity = Math.min(
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
      |--------------------------------------------------------------------------
      | New item
      |--------------------------------------------------------------------------
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
      |--------------------------------------------------------------------------
      | Quantity 0 or less = remove item
      |--------------------------------------------------------------------------
      */

      if (quantity <= 0) {
        return currentItems.filter(
          (item) =>
            item.cartLineId !==
            cartLineId
        );
      }

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
  | Total Count
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | T-Shirt = 2
  | Saree   = 3
  |
  | count = 5
  |
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
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useCart Hook
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