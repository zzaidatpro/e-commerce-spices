'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Logo from '../atoms/logo';
import NavBar from '../molecules/navBar';
import AdminBar from '../molecules/AdminBar';
import { Badge } from '@repo/ui';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between md:grid md:grid-cols-[10%_50%_40%] max-[1100px]:grid-cols-[15%_45%_40%]">
        
        {/* 1. Logo */}
        <div className="flex items-center justify-start">
          <Logo />
        </div>

        {/* 2. NavBar */}
        <div className="hidden md:flex items-center justify-center w-full">
          <NavBar />
        </div>

        {/* 3. AdminBar & Actions */}
        <div className="hidden md:flex items-center justify-end w-full">
          <AdminBar />
        </div>

        {/* --- SECTION MOBILE (Bouton Burger & Icônes) --- */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart" className="p-2 text-foreground/85 hover:text-shop-orange relative" aria-label="Panier">
            <ShoppingCart className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-shop-orange text-white text-[9px] font-bold">
              2
            </Badge>
          </Link>

          <div 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-shop-orange rounded-md transition-colors"
              aria-label="Ouvrir le menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>

      {/* --- MENU MOBILE DÉROULANT (LARGEUR 200PX) --- */}
      {isOpen && (
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="md:hidden absolute top-16 right-0 w-200px bg-background border-l border-b border-border shadow-xl py-4 px-4 flex flex-col gap-3 items-end text-right z-50 animate-in slide-in-from-right duration-800 ease-in-out"
        >
         {/* Section Navigation */}
          <div className="flex flex-col gap-2 w-full items-end">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-shop-orange transition-colors py-1">Accueil</Link>
            <Link href="/shop" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-shop-orange transition-colors py-1">Boutique</Link>
            <Link href="/categories" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-shop-orange transition-colors py-1">Catégories</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-shop-orange transition-colors py-1">À propos</Link>
          </div>

          <hr className="border-border w-full my-1" />

          {/* Section Authentification & Administration */}
          <div className="flex flex-col gap-2 w-full items-end">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mon Compte</span>
            <div className="flex flex-col gap-2 w-full items-end">
              <AdminBar />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}