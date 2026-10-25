'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // test avec fetch avant de mettre un resetPasswordAction
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur est survenue lors de l'envoi de l'e-mail.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer le lien de réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-muted-foreground">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {error}
        </div>
      )}

      {isSubmitted ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="p-4 bg-shop-orange/10 border border-shop-orange/30 text-shop-orange rounded-md text-sm">
            Un e-mail de réinitialisation a été envoyé à <strong>{email}</strong> si ce compte existe.
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-shop-orange hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      {!isSubmitted && (
        <div className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-shop-orange hover:underline font-medium">
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}