import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type Role = 'client' | 'manager' | 'livreur' | 'admin';
export type Compte = { id: string; email: string };
export type Comptes = Record<Role, Compte>;

const RACINE = path.resolve(__dirname, '..');
const FICHIER = path.join(RACINE, 'e2e', '.comptes.json');

export function ecrireComptes(comptes: Comptes): void {
  mkdirSync(path.dirname(FICHIER), { recursive: true });
  writeFileSync(FICHIER, JSON.stringify(comptes, null, 2), 'utf8');
}

export function lireComptes(): Comptes {
  if (!existsSync(FICHIER)) {
    throw new Error(
      `Comptes e2e introuvables (${FICHIER}). globalSetup n'a pas abouti : relancez et lisez la première erreur.`
    );
  }
  return JSON.parse(readFileSync(FICHIER, 'utf8')) as Comptes;
}