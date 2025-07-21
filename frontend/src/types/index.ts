export interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  image: string;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  selected?: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ProductAction {
  type: 'add_to_cart' | 'view_cart' | 'checkout' | 'view_details' | 'continue_shopping' | 'provide_address' | 'confirm_payment' | 'place_order';
  label: string;
  productId?: string;
  product?: Product; // Added for action buttons to access product image
  payload?: any;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  products?: Product[];
  actions?: ProductAction[];
  type: 'text' | 'product' | 'welcome' | 'cart' | 'checkout' | 'order_confirmation';
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentQuery: string;
  cart: CartItem[];
  checkoutStep: 'idle' | 'address' | 'payment' | 'confirmed';
  shippingAddress?: ShippingAddress;
  orderNumber?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}