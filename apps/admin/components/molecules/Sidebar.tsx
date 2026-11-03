'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package } from 'lucide-react';
import { cn } from '@repo/ui'; // ou vos classes utilitaires

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  // Définir les liens communs ou spécifiques
  const menuItems = [
    {
      label: 'Tableau de bord',
      href: role === 'admin' ? '/admin' : '/manager',
      icon: LayoutDashboard,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Catalogue & Produits',
      href: '/admin/products', // ou partagé
      icon: Package,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Commandes',
      href: '/admin/orders',
      icon: ShoppingBag,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Gestion des Utilisateurs',
      href: '/admin/users', // Réservé strictement aux admins
      icon: Users,
      roles: ['admin'], // <--- Visible uniquement par l'admin
    },
    {
      label: 'Paramètres système',
      href: '/admin/settings', // Réservé strictement aux admins
      icon: Settings,
      roles: ['admin'], // <--- Visible uniquement par l'admin
    },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {menuItems
        .filter((item) => item.roles.includes(role)) // Filtrage conditionnel selon le rôle
        .map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-shop-orange text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}