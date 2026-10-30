'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import {loginAction} from '@/actions/actionsLogin' ;

const initialState = {
  success: false,
  message: '',  
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Connexion</h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte.
        </p>
      </div>

      {state?.message && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md text-center">
          {state.message}
        </div>
      )}

      {/* Le formulaire utilise l'action serveur directement */}
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Adresse email
          </label>
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
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange"
          />
        </div>

        <button
          type="submit"
          id='btn_login'
          disabled={isPending}
          className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Pas de compte ?{' '}
        <Link href="/register" className="text-shop-orange hover:underline font-medium">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}