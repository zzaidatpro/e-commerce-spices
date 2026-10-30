'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSheet = ({ isOpen, onClose }: CartSheetProps) => {
  const { cart, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
        
        {/* En-tête du panier */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-shop-orange" />
            <h2 className="text-base font-bold text-foreground">
              Votre Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste enrichie des articles */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
              <div className="p-4 bg-secondary/40 rounded-full border border-border/60">
                <ShoppingCart className="w-10 h-10 stroke-1 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium">Votre panier est actuellement vide.</p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-shop-orange text-white text-xs font-semibold rounded-xl hover:bg-shop-orange/90 transition-colors shadow-xs cursor-pointer"
              >
                Découvrir nos épices
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-3 bg-background border border-border/80 rounded-2xl shadow-2xs hover:border-border transition-colors"
              >
                {/* Image du produit */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary/40 shrink-0 border border-border/40">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground font-medium">
                      Tej Patta
                    </div>
                  )}
                </div>

                {/* Détails du produit */}
                <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {item.name}
                  </h4>
                  {item.weight && (
                    <span className="text-[11px] text-muted-foreground">
                      {item.weight}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.price.toFixed(2)} Da
                    </span>
                    <span className="text-xs font-extrabold text-shop-orange">
                      {(item.price * item.quantity).toFixed(2)} Da
                    </span>
                  </div>
                </div>

                {/* Contrôles de quantité & Suppression */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                    title="Supprimer l'article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 border border-border rounded-lg bg-secondary/30 px-1.5 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-background transition-colors"
                      aria-label="Diminuer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-background transition-colors"
                      aria-label="Augmenter"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pied du panier avec total et redirection */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-secondary/20 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Sous-total :</span>
              <span className="font-extrabold text-foreground text-base">
                {totalPrice.toFixed(2)} Da
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full py-2.5 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs rounded-xl text-center transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Voir le panier complet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={clearCart}
                className="w-full py-1 text-[11px] text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};