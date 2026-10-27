import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
};


export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Sépare les caractères des accents
    .replace(/[\u0300-\u036f]/g, '')     // Supprime les accents
    .toLowerCase()
    .trim()
    .replace(/&/g, 'et')                // Remplace & par 'et'
    .replace(/[^a-z0-9 -]/g, '')        // Supprime les caractères spéciaux
    .replace(/\s+/g, '-')               // Remplace les espaces par des tirets
    .replace(/-+/g, '-');              // Évite les tirets multiples
}