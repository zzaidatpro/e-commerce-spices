export interface NavItem {
  label: string;
  href: string;
}

export const headerData: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/products" },
  { label: "Catégories", href: "/categories" },
  { label: "À propos", href: "/about" },
];