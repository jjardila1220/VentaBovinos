import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bovine, Invoice, BuyerData } from '../types/database.ts';
import { bovineService } from '../services/bovineService.ts';
import { salesService } from '../services/salesService.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: Bovine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (bovine: Bovine) => { success: boolean; message?: string };
  removeFromCart: (bovineId: string) => void;
  clearCart: () => void;
  isInCart: (bovineId: string) => boolean;
  completeCheckout: (buyer: BuyerData, paymentMethod: string) => Invoice;
  lastInvoice: Invoice | null;
  setLastInvoice: (invoice: Invoice | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'ganadocarnes_cart_items_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Bovine[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  const isInCart = (bovineId: string) => {
    return items.some((b) => b.id.toLowerCase() === bovineId.toLowerCase());
  };

  const addToCart = (bovine: Bovine): { success: boolean; message?: string } => {
    if (isInCart(bovine.id)) {
      return { success: false, message: 'Este ejemplar ya se encuentra en su carrito.' };
    }

    try {
      // Mark as Reservado in bovineService (Business Rule)
      const currentUserId = user?.id || 'guest_user';
      bovineService.reserve(bovine.id, currentUserId);

      setItems((prev) => [...prev, { ...bovine, status: 'Reservado' }]);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Este bovino ya no está disponible' };
    }
  };

  const removeFromCart = (bovineId: string) => {
    const currentUserId = user?.id || 'guest_user';
    // Release back to Disponible (Business Rule)
    bovineService.release(bovineId, currentUserId);
    setItems((prev) => prev.filter((b) => b.id.toLowerCase() !== bovineId.toLowerCase()));
  };

  const clearCart = () => {
    const currentUserId = user?.id || 'guest_user';
    items.forEach((b) => {
      bovineService.release(b.id, currentUserId);
    });
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const shipping = 0; // Envío gratis en plataforma
  const total = subtotal + shipping;

  const completeCheckout = (buyer: BuyerData, paymentMethod: string): Invoice => {
    if (items.length === 0) {
      throw new Error('El carrito está vacío.');
    }

    const invoiceItems = items.map((b) => ({
      bovineId: b.id,
      name: b.name,
      breed: b.breed,
      category: b.category,
      price: b.price
    }));

    const invoice = salesService.createSale({
      buyer,
      items: invoiceItems,
      paymentMethod,
      userName: user?.name || buyer.name || 'Cliente Particular',
      userId: user?.id
    });

    setItems([]);
    setLastInvoice(invoice);
    return invoice;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        subtotal,
        shipping,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        completeCheckout,
        lastInvoice,
        setLastInvoice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
