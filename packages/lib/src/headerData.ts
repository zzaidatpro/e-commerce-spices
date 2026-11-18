export type RoleSite = 'client' | 'livreur' | null;

export interface NavItem {
  label: string;
  href: string;
}

// guest
export const menuVitrine: NavItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Nos Produits', href: '/products' },
  { label: 'Les origines', href: '/origines' },
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Client
export const menuClient: NavItem[] = [
  ...menuVitrine,
  { label: 'Mon espace', href: '/dashboard' },
];

// Livreur
export const menuLivreur: NavItem[] = [
  { label: 'Mes livraisons', href: '/livraisons' },
  { label: 'Contact', href: '/contact' },
];

export function menuPourRole(role: RoleSite): NavItem[] {
  if (role === 'livreur') return menuLivreur;
  if (role === 'client') return menuClient;
  return menuVitrine;
}

export const headerData = menuVitrine;