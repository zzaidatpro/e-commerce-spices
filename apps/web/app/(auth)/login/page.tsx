'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Appel à NextAuth (Credentials provider par exemple)
      const result = await signIn('credentials', {
        redirect: false, // Empêche la redirection automatique pour gérer les erreurs
        email,
        password,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
      } else {
        // Redirection vers le tableau de bord ou la page d'accueil après succès
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Connexion</h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mot de passe
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-shop-orange hover:underline font-medium"
            >
              Oublié ?
            </Link>
          </div>
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
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Vous n'avez pas de compte ?{' '}
        <Link href="/register" className="text-shop-orange hover:underline font-medium">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}