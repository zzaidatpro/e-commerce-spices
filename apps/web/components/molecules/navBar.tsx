'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu } from 'lucide-react';
import { cn } from '@repo/ui';
import { Badge } from '@repo/ui';

interface NavBarProps {
  className?: string;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const NavBar = ({ className, cartItemCount = 0, onOpenCart }: NavBarProps) => {
  return (
    <nav className={cn("sticky top-0 z-50 w-full border-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60", className)}>
      <div className="container mx-auto flex h-10 items-center justify-between px-4 sm:px-8">
        
        {/* Navigation principale (gauche) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/80">
          <Link href="/" className="hover:text-shop-orange transition-colors">Accueil</Link>
          <Link href="/shop" className="hover:text-shop-orange transition-colors">Boutique</Link>
          <Link href="/categories" className="hover:text-shop-orange transition-colors">Catégories</Link>
          <Link href="/about" className="hover:text-shop-orange transition-colors">A propos</Link>
        </nav>

        {/* Menu mobile */}
        <div className="md:hidden flex items-center">
          <button className="p-2 text-foreground hover:text-shop-orange rounded-md" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Actions de droite */}
        <div className="flex items-center gap-3">
          
          <Link 
            href="/wishlist" 
            className="p-2 text-foreground/80 hover:text-shop-orange hover:bg-secondary rounded-md transition-colors relative inline-flex items-center justify-center"
            aria-label="Favoris"
          >
            <Heart className="w-5 h-5" />
          </Link>

          <button 
            onClick={onOpenCart}
            className="p-2 text-foreground/80 hover:text-shop-orange hover:bg-secondary rounded-md transition-colors relative inline-flex items-center justify-center"
            aria-label="Panier"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-shop-orange text-white text-[10px] font-bold">
                {cartItemCount}
              </Badge>
            )}
          </button>

          <Link 
            href="/account" 
            className="text-[10px] flex flex-row uppercase space-x-1 font-black tracking-wider text-shop-dark-green hover:text-shop-light-green transition-colors duration-200  font-sans"
          >
            <User className="w-4 h-4" />
            <span>Compte</span>
          </Link>

        </div>

      </div>
    </nav>
  );
};

export default NavBar;