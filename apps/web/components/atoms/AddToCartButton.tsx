'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@repo/database';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  onAdded?: () => void;
  className?: string;
}

export const AddToCartButton = ({ product, onAdded, className }: AddToCartButtonProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    addItem(product, 1);
    
    if (onAdded) {
      onAdded();
    }
  };

  return (
    <button
      onClick={handleAdd}
      className={
        className ||
        "flex items-center justify-center gap-2 w-full py-2 px-3 bg-shop-orange hover:bg-shop-orange/90 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
      }
      title="Ajouter au panier"
    >
      <ShoppingBag className="w-4 h-4" />
      <span>Ajouter au panier</span>
    </button>
  );
};

export default AddToCartButton;