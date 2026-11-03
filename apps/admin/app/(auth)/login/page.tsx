'use client';

import React, { useState, useTransition } from 'react';
import { loginAdmin } from '@/actions/actionAdminAuth';
import { Mail, Lock } from 'lucide-react';
import InputField from '@/components/atoms/InputField';
import SubmitButton from '@/components/atoms/SubmitButton';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAdmin(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-xs">
        <h1 className="text-xl font-bold text-foreground text-center mb-6">Connexion</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="votre@email.com"
            icon={Mail}
          />

          <InputField
            label="Mot de passe"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            icon={Lock}
          />

          <SubmitButton isPending={isPending} loadingText="Connexion en cours...">
            Se connecter
          </SubmitButton>
        </form>
        <div className="flex items-center justify-between mt-4 text-xs">
        <Link 
          href="/password-recovery" 
          className="text-xs text-shop-orange hover:underline font-medium self-start"
        >
          Mot de passe oublié ?
        </Link>
        <Link 
          href="/register" 
          className="text-xs text-shop-orange hover:underline font-medium self-end"
        >
          Créer un compte
        </Link>
       
      </div>
    </div>
    </div>
  );
}