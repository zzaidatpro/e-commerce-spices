'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, UserRound, UserCog, Users, ShoppingBag,
  Warehouse, TrendingUp, Heart, MessageSquare, Settings,
} from 'lucide-react';
import { cn } from '@repo/ui';

type Role = 'admin' | 'manager';

const MENU: { label: string; href: string; icon: typeof Package; roles: Role[] }[] = [
  { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { label: 'Produits', href: '/admin/products', icon: Package, roles: ['admin', 'manager'] },
  { label: 'Clients', href: '/admin/clients', icon: UserRound, roles: ['admin', 'manager'] },
  { label: 'Managers', href: '/admin/managers', icon: UserCog, roles: ['admin'] },
  { label: 'Utilisateurs', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Commandes', href: '/admin/orders', icon: ShoppingBag, roles: ['admin', 'manager'] },
  { label: 'Stock', href: '/admin/stock', icon: Warehouse, roles: ['admin', 'manager'] },
  { label: 'Meilleures ventes', href: '/admin/best-sellers', icon: TrendingUp, roles: ['admin', 'manager'] },
  { label: 'Favoris', href: '/admin/favoris', icon: Heart, roles: ['admin', 'manager'] },
  { label: 'Feedbacks', href: '/admin/feedback', icon: MessageSquare, roles: ['admin', 'manager'] },
  { label: 'Paramètres', href: '/admin/settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  // L'accueil n'est actif que sur /admin exactement
  const estActif = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex flex-col gap-1">
      {MENU.filter((item) => item.roles.includes(role as Role)).map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
              estActif(item.href)
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