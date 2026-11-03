export interface NavItem {
  label: string;
  href: string;
}

export const headerData: NavItem[] = [
  { label: "Accueil", href: "/" }, 
  { label: "Catalogue", href: "/catalog" },
  { label: "Origines & Terroirs", href: "/origines" },
  { label: "À propos", href: "/about" },
];