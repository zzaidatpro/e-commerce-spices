'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag 
} from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, totalPrice, totalItems, isHydrated } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Frais de livraison (offerts à partir de 5000 Da)
  const shippingThreshold = 5000;
  const shippingCost = totalPrice >= shippingThreshold || totalPrice === 0 ? 0 : 400;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'TEJ10') {
      const discountAmount = totalPrice * 0.1;
      setDiscount(discountAmount);
      setPromoSuccess('Code promo appliqué (-10%)');
    } else {
      setPromoError('Code promo invalide.');
    }
  };

  const finalTotal = Math.max(0, totalPrice - discount + shippingCost);

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-64 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Votre Panier
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {totalItems === 0
              ? 'Votre panier est actuellement vide.'
              : `${totalItems} article${totalItems > 1 ? 's' : ''} dans votre panier.`}
          </p>
        </div>

        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-shop-orange hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer vos achats
        </Link>
      </div>

      {cart.length === 0 ? (
        /* État Panier Vide */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-secondary/20 border border-border/60 rounded-2xl text-center gap-4">
          <div className="p-4 bg-background border border-border/80 rounded-full shadow-xs">
            <ShoppingBag className="w-12 h-12 text-muted-foreground stroke-1" />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="text-lg font-bold text-foreground">Votre panier est vide</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Découvrez notre sélection d'épices d'exception, mélanges artisanaux et sauces épicées.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-2 px-6 py-2.5 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        /* Grille Panier : Liste des produits à gauche, Récapitulatif à droite */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Liste des articles (8 colonnes) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Produits
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              >
                Vider le panier
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background border border-border/70 rounded-2xl shadow-2xs hover:border-border transition-colors"
                >
                  {/* Image & Infos */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-secondary/40 shrink-0 border border-border/40">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                          Tej Patta
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5 text-left">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm font-bold text-foreground hover:text-shop-orange transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.weight && (
                        <span className="text-xs text-muted-foreground">
                          Origine/Format : {item.weight}
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-shop-orange sm:hidden mt-1">
                        {item.price.toFixed(2)} Da
                      </span>
                    </div>
                  </div>

                  {/* Contrôle de quantité & Prix unitaire */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs text-muted-foreground">Prix unitaire</span>
                      <span className="text-sm font-bold text-foreground">
                        {item.price.toFixed(2)} Da
                      </span>
                    </div>

                    {/* Sélecteur de quantité */}
                    <div className="flex items-center gap-2 border border-border rounded-xl bg-secondary/30 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-background transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-background transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total de la ligne */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-foreground w-20 text-right">
                        {(item.price * item.quantity).toFixed(2)} Da
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                        title="Supprimer du panier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Garanties & Livraison info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-3 p-3.5 bg-secondary/20 border border-border/50 rounded-xl">
                <Truck className="w-5 h-5 text-shop-orange shrink-0" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-foreground">Livraison rapide</h4>
                  <p className="text-[11px] text-muted-foreground">Offerte dès 5 000 Da d'achats</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-secondary/20 border border-border/50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-shop-dark-green shrink-0" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-foreground">Paiement sécurisé</h4>
                  <p className="text-[11px] text-muted-foreground">Paiement à la livraison ou en ligne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif de Commande (4 colonnes) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20">
            <div className="p-6 bg-background border border-border/80 rounded-2xl shadow-sm flex flex-col gap-5 text-left">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
                Récapitulatif de commande
              </h3>

              {/* Détails financiers */}
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span className="font-semibold text-foreground">{totalPrice.toFixed(2)} Da</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600 font-medium">
                    <span>Réduction code promo</span>
                    <span>-{discount.toFixed(2)} Da</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Frais de livraison</span>
                  <span className="font-semibold text-foreground">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">Offerte</span>
                    ) : (
                      `${shippingCost.toFixed(2)} Da`
                    )}
                  </span>
                </div>

                <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-foreground">Total TTC</span>
                  <span className="text-lg sm:text-xl font-extrabold text-shop-orange">
                    {finalTotal.toFixed(2)} Da
                  </span>
                </div>
              </div>

              {/* Formulaire Code Promo */}
              <form onSubmit={handleApplyPromo} className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-shop-orange" />
                  <span>Code de réduction</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Ex: TEJ10"
                    className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs rounded-xl border border-border transition-colors cursor-pointer"
                  >
                    Appliquer
                  </button>
                </div>
                {promoError && <span className="text-[11px] text-red-500 font-medium">{promoError}</span>}
                {promoSuccess && <span className="text-[11px] text-green-600 font-medium">{promoSuccess}</span>}
              </form>

              {/* Bouton passer à la commande */}
              <Link
                href="/checkout"
                className="w-full py-3 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}