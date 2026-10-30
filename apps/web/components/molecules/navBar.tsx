'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu } from 'lucide-react';
import { cn } from '@repo/ui';
import { Badge } from '@repo/ui';
import { headerData } from '../atoms/headerData';
import { createUserClient } from '@repo/database/client';

interface NavBarProps {
  className?: string;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const NavBar = ({ className, cartItemCount = 0, onOpenCart }: NavBarProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createUserClient());

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className={cn("w-full border-none bg-transparent", className)}>
      <div className="text-sm capitalize font-semibold text-lightColor container mx-auto flex h-10 items-center justify-between px-4 sm:px-8">
        
       <nav className="hidden md:flex items-center gap-6">
      {headerData.map((item) => {
        return (
          <Link key={item.href}  href={item.href} className="hover:text-shop-light-green hooverEffect relative group"
          >
                <span className="absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop-light-green group-hover:w-1/2 hoverEffect group-hover:left-0" />
                <span className="absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop-light-green group-hover:w-1/2 hoverEffect group-hover:right-0" />
                      
            {item.label}
          </Link>
        );
      })}
    </nav>

       <div className="md:hidden flex items-center">
          <button className="p-2 text-foreground hover:text-shop-light-green rounded-md" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>

     <div className="flex items-center gap-3">
          
          <Link 
            href="/wishlist" 
            className="p-2 text-foreground/80 hover:text-shop-light-green hover:bg-secondary rounded-md transition-colors relative inline-flex items-center justify-center"
            aria-label="Favoris"
          >
            <Heart className="w-5 h-5" />
          </Link>

          <button 
            onClick={onOpenCart}
            className="p-2 text-foreground/80 hover:text-shop-light-green hover:bg-secondary rounded-md transition-colors relative inline-flex items-center justify-center"
            aria-label="Panier"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-shop-light-green text-white text-[10px] font-bold">
                {cartItemCount}
              </Badge>
            )}
          </button>

          {!loading && (
            <Link 
              href={user ? "/dashboard" : "/account"} 
              className="text-[10px] flex flex-row items-center space-x-1 font-black tracking-wider text-shop-dark-green hover:text-shop-light-green transition-colors duration-200 font-sans"
              title={user ? user.email : "Compte"}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[130px] lowercase">
                {user ? user.email : "Compte"}
              </span>
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
};

export default NavBar;