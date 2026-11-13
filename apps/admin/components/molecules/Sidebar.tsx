'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package } from 'lucide-react';
import { cn } from '@repo/ui'; 

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Tableau de bord',
      href: role === 'admin' ? '/admin' : '/manager',
      icon: LayoutDashboard,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Catalogue & Produits',
      href: '/admin/products', 
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
      href: '/admin/users', 
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Paramètres système',
      href: '/admin/settings', 
      icon: Settings,
      roles: ['admin'], 
    },
  ];
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex flex-col gap-1">
      {menuItems
        .filter((item) => item.roles.includes(role)) 
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