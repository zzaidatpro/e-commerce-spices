'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Logo from '../atoms/logo';
import NavBar from '../molecules/navBar';
import AdminBar from '../molecules/AdminBar';
import { Badge } from '@repo/ui';
import { headerData } from '../atoms/headerData';
import { CartSheet } from '../molecules/CartSheet';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
               
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Logo />
        </div>
        
        {/* Navigation principale : Masquée sous 900px, affichée à partir de 900px */}
        <div className="hidden min-[900px]:flex items-center justify-center flex-1 px-8">
          <NavBar />
        </div>
       
        {/* Zone d'actions : AdminBar (icônes) + Panier + Menu Burger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AdminBar (toujours visible) */}
          <AdminBar />

          {/* Icône Panier */}
          <Link href="/cart" className="p-2 text-foreground hover:text-shop-orange relative transition-colors" aria-label="Panier">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-shop-light-green text-white text-[9px] font-bold">
                {totalItems}
              </Badge>
            )}
          </Link>

          {/* Bouton Burger : Affiché UNIQUEMENT en dessous de 900px */}
          <div className="flex min-[900px]:hidden items-center ml-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-shop-orange rounded-md transition-colors cursor-pointer"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isOpen ? <X className="w-6 h-6 text-shop-orange" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>
      
      {/* Menu mobile / tablette déroulant (Masqué au-delà de 900px) */}
      {isOpen && (
        <div className="min-[900px]:hidden w-full bg-background border-b border-border shadow-xl py-4 px-6 flex flex-col gap-3 z-50 animate-in slide-in-from-top-2 duration-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Navigation</span>
          <div className="flex flex-col gap-2 w-full">
            {headerData.map((item) => (
              <Link 
                key={item.href}  
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-shop-orange transition-colors py-2 border-b border-border/40"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      

    </header>
  );
}