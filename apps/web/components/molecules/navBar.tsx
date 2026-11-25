"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Menu } from "lucide-react";
import { cn } from "@repo/ui";
import { Badge } from "@repo/ui";
import { menuPourRole, type RoleSite } from "@repo/lib";
import { useCart } from "@/lib-web/useCart";

interface NavBarProps {
  className?: string;
  role: RoleSite;
  onOpenCart?: () => void;
}

export const NavBar = ({ className, role, onOpenCart }: NavBarProps) => {
  const { totalItems, isHydrated } = useCart();
  const estLivreur = role === "livreur";
  const estClient = role === "client";
  const liens = menuPourRole(role);
  const quantite = isHydrated ? totalItems : 0;

  const boutonPanier = (
    <>
      <ShoppingCart className="w-5 h-5" />
      {quantite > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-shop-light-green text-white text-[10px] font-bold">
          {quantite}
        </Badge>
      )}
    </>
  );

  const classeIcone =
    "p-2 text-foreground/80 hover:text-shop-light-green hover:bg-secondary rounded-md transition-colors relative inline-flex items-center justify-center";

  return (
    <nav className={cn("w-full border-none bg-transparent", className)}>
      <div className="text-sm capitalize font-semibold text-lightColor container mx-auto flex h-10 items-center justify-between px-4 sm:px-8">
        <div className="hidden md:flex items-center gap-6">
          {liens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-shop-light-green hooverEffect relative group"
            >
              <span className="absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop-light-green group-hover:w-1/2 hoverEffect group-hover:left-0" />
              <span className="absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop-light-green group-hover:w-1/2 hoverEffect group-hover:right-0" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="md:hidden flex items-center">
          <button
            className="p-2 text-foreground hover:text-shop-light-green rounded-md"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {estClient && (
            <Link href="/wishlist" className={classeIcone} aria-label="Favoris">
              <Heart className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
