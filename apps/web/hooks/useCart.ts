'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export const useCart = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...cartStore,
    cart: isHydrated ? cartStore.cart : [],
    totalItems: isHydrated ? cartStore.getTotalItems() : 0,
    totalPrice: isHydrated ? cartStore.getTotalPrice() : 0,
    isHydrated,
  };
};