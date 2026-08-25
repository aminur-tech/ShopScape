export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};



export type Product = {
  id: string;
  name: string;
  slug: string;

  description?: string | null;

  price: number;

  discountPercent?: number | null;
  discountPrice?: number | null;

  sizeChart?: string | null;

  // Product-level sizes
  sizes: string[];

  // 0 = out of stock
  // 1+ = in stock
  stock: number;

  images: string[];

  isFeatured: boolean;

  // এখানে optional রাখার দরকার নেই
  isActive: boolean;

  categoryId?: string;

  category?: {
    name: string;
    slug: string;
  };
};

export type Banner = {
  id: string;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive?: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedImageUrl?: string | null;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "BKASH" | "NAGAD";

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | string;
  transactionId?: string | null;
  paymentProofUrl?: string | null;

  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;

  subtotal: number;
  deliveryFee: number;
  total: number;

  items: OrderItem[];

  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
};

export type CartLine = {
  /**
   * Unique cart line ID.
   * Same product with different color/size
   * must become different cart lines.
   */
  cartLineId: string;

  productId: string;
  name: string;
  price: number;

  image?: string | null;

  quantity: number;
  maxStock: number;

  selectedColor?: string | null;
  selectedSize?: string | null;
};