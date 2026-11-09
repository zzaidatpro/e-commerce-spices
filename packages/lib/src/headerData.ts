export interface NavItem {
  label: string;
  href: string;
}

export const headerData: NavItem[] = [
  { label: "Accueil", href: "/" }, 
  { label: "Nos Produits", href: "/products" },
  { label: "Les origines", href: "/origines" },
  { label: "À propos", href: "/about" },
];