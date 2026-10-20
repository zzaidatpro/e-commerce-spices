'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || "Impossible de créer le compte.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inscription</h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Zoheir Zaidat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Création en cours...' : "S'inscrire"}
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