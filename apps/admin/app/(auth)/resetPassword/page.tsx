'use client';

import React from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-xs">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Réinitialisation
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Saisissez votre email pour recevoir les instructions de réinitialisation.
        </p>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Adresse Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre-email@exemple.com"
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Envoyer le lien
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-shop-orange font-semibold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}