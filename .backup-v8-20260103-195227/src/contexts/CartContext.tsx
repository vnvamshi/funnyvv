import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
  category: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  discount?: number;
  shipping?: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  deliveryDate: Date;
  trackingNumber?: string;
  createdAt: Date;
}

interface CartContextValue {
  cart: CartState;
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInCart: (productId: number) => boolean;
  getCartItem: (productId: number) => CartItem | undefined;
  createOrder: (paymentMethod: string) => Order;
  verifyOTP: (otp: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  const addToCart = useCallback((product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevCart.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          items: updatedItems,
          total,
          itemCount
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          vendor: product.vendor,
          category: product.category
        };
        
        const updatedItems = [...prevCart.items, newItem];
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          items: updatedItems,
          total,
          itemCount
        };
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.productId !== productId);
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: updatedItems,
        total,
        itemCount
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: updatedItems,
        total,
        itemCount
      };
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0
    });
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.total;
  }, [cart.total]);

  const getCartItemCount = useCallback(() => {
    return cart.itemCount;
  }, [cart.itemCount]);

  const isInCart = useCallback((productId: number) => {
    return cart.items.some(item => item.productId === productId);
  }, [cart.items]);

  const getCartItem = useCallback((productId: number) => {
    return cart.items.find(item => item.productId === productId);
  }, [cart.items]);

  const createOrder = useCallback((paymentMethod: string): Order => {
    const orderId = `VV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3); // 3-7 days
    
    return {
      orderId,
      userId: 'current-user', // This should come from auth context
      items: [...cart.items],
      totalAmount: cart.total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      deliveryDate,
      createdAt: new Date()
    };
  }, [cart]);

  const verifyOTP = useCallback((otp: string): boolean => {
    // For testing: only 111222 is correct
    return otp === '111222';
  }, []);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
    createOrder,
    verifyOTP
  }), [
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
    createOrder,
    verifyOTP
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
