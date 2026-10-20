'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, UserPlus, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@repo/ui';
import ThemeToggle from '../atoms/ThemeToggle';

interface AdminBarProps {
  className?: string;
}

export const AdminBar = ({ className }: AdminBarProps) => {
  return (
    <div className={cn("flex items-center justify-end gap-2 w-full", className)}>
      {/* Lien vers la page de Connexion */}
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        title="Connexion"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="max-[1100px]:hidden">Connexion</span>
      </Link>

      {/* Lien vers la page d'Inscription */}
      <Link
        href="/register"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-shop-dark-green text-white hover:bg-shop-dark-green/90 transition-colors shadow-sm"
        title="S'inscrire"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span className="max-[1100px]:hidden">S'inscrire</span>
      </Link>

      {/* Lien direct vers le Dashboard Admin */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-shop-orange text-white hover:bg-shop-orange/90 transition-colors shadow-sm"
        title="Accès Espace Administration"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span className="max-[1100px]:hidden">Admin</span>
      </Link>
      <ThemeToggle/>
    </div>
  );
};

export default AdminBar;