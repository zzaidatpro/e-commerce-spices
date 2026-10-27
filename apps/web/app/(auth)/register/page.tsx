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
    <div className="flex flex-col gap-6 max-w-md mx-auto py-12 px-4">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inscription</h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte en quelques secondes
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 shadow-sm"
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