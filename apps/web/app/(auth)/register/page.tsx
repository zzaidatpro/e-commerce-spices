'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerUser } from '@/actions/actionRegister';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await registerUser(formData);
      } catch (err: any) {
        
        setError(err.message || "Une erreur est survenue lors de l'inscription.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inscription</h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte et configurez vos informations de livraison
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {error}
        </div>
      )}

      <form action={registerUser} className="flex flex-col gap-6">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-shop-orange uppercase tracking-wider border-b border-border pb-1">
            Informations personnelles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="nom" className="text-sm font-medium text-foreground">Nom</label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                placeholder="Zaidat"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="prenom" className="text-sm font-medium text-foreground">Prénom</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                placeholder="Zoheir"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Adresse e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nom@exemple.com"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="telephone" className="text-sm font-medium text-foreground">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="0600000000"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">WhatsApp</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="+213..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="dateNaissance" className="text-sm font-medium text-foreground">Date de naissance</label>
              <input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-shop-orange uppercase tracking-wider border-b border-border pb-1">
            Adresse de livraison
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 text-left col-span-1">
              <label htmlFor="numero" className="text-sm font-medium text-foreground">N°</label>
              <input
                id="numero"
                name="numero"
                type="text"
                placeholder="12"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left col-span-2">
              <label htmlFor="rue" className="text-sm font-medium text-foreground">Rue</label>
              <input
                id="rue"
                name="rue"
                type="text"
                placeholder="Rue Didouche Mourad"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="cite" className="text-sm font-medium text-foreground">Cité / Quartier</label>
              <input
                id="cite"
                name="cite"
                type="text"
                placeholder="Dély Ibrahim"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="ville" className="text-sm font-medium text-foreground">Ville</label>
              <input
                id="ville"
                name="ville"
                type="text"
                placeholder="Alger"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="codePostal" className="text-sm font-medium text-foreground">Code postal</label>
              <input
                id="codePostal"
                name="codePostal"
                type="text"
                placeholder="16047"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="lieu" className="text-sm font-medium text-foreground">Type de lieu</label>
              <select
                id="lieu"
                name="lieu"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              >
                <option value="maison">Maison</option>
                <option value="magasin">Magasin</option>
                <option value="depot">Dépôt</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="urlGoogleMap" className="text-sm font-medium text-foreground">Lien Google Maps (URL)</label>
              <input
                id="urlGoogleMap"
                name="urlGoogleMap"
                type="url"
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 mt-4 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending ? 'Création en cours...' : "S'inscrire"}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-shop-orange hover:underline font-medium">
          Se connecter
        </Link>
      </div>
    </div>
  );
}