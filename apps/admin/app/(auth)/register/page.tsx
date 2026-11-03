'use client';

import React, { useState, useTransition } from 'react';
import { registerUser } from '@/actions/actionRegisteruser';
import { Mail, Lock, User, Phone, Calendar, MessageSquare } from 'lucide-react';
import InputField from '@/components/atoms/InputField';
import SubmitButton from '@/components/atoms/SubmitButton';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg p-6 bg-card border border-border rounded-2xl shadow-xs">
        <h1 className="text-xl font-bold text-foreground text-center mb-2">Créer un compte Admin</h1>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Complétez les informations ci-dessous pour soumettre votre demande d&apos;inscription.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-xl text-center font-medium">
            Votre demande d&apos;inscription a été envoyée avec succès ! Un administrateur doit valider votre compte avant que vous puissiez vous connecter.
            <div className="mt-4">
              <Link href="/login" className="text-shop-orange font-semibold hover:underline">
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nom & Prénom sur la même ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Nom"
                name="nom"
                type="text"
                required
                placeholder="Votre nom"
                icon={User}
              />
              <InputField
                label="Prénom"
                name="prenom"
                type="text"
                required
                placeholder="Votre prénom"
                icon={User}
              />
            </div>

            {/* Email */}
            <InputField
              label="Adresse Email"
              name="email"
              type="email"
              required
              placeholder="exemple@domaine.com"
              icon={Mail}
              autoComplete="email"
            />

            {/* Mot de passe */}
            <InputField
              label="Mot de passe"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              icon={Lock}
              autoComplete="new-password"
            />

            {/* Téléphone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Téléphone"
                name="telephone"
                type="tel"
                required
                placeholder="0612345678"
                icon={Phone}
              />
              <InputField
                label="WhatsApp"
                name="whatsapp"
                type="tel"
                placeholder="0612345678"
                icon={MessageSquare}
              />
            </div>

            {/* Date de naissance & Rôle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Date de naissance"
                name="date_naissance"
                type="date"
                required
                icon={Calendar}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="text-xs font-semibold text-foreground">
                  Rôle demandé
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="manager"
                  className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50 cursor-pointer h-[42px]"
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <SubmitButton isPending={isPending} loadingText="Soumission de la demande...">
              Envoyer la demande d'inscription
            </SubmitButton>
          </form>
        )}

        {!success && (
          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}