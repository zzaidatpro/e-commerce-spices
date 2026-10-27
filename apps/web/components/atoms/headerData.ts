export interface NavItem {
  label: string;
  href: string;
}

export const headerData: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/origines" },
  { label: "Catalogue", href: "/catalog" },
  { label: "À propos", href: "/about" },
];