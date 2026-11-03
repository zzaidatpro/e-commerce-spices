'use client';

import React, { useState, useTransition } from 'react';
import { requestPasswordResetAction } from '@/actions/actionRequestPasswordReset';
import { Mail } from 'lucide-react';
import InputField from '@/components/atoms/InputField';
import SubmitButton from '@/components/atoms/SubmitButton';

export default function PasswordRecoveryPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await requestPasswordResetAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-xs">
        <h1 className="text-xl font-bold text-foreground text-center mb-2">
          Récupération du mot de passe
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-xl text-center font-medium">
            Un e-mail de réinitialisation vient de vous être envoyé. Veuillez vérifier votre boîte de réception.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Adresse E-mail"
              name="email"
              type="email"
              required
              placeholder="admin@exemple.com"
              icon={Mail}
              autoComplete="email"
            />

            <SubmitButton isPending={isPending} loadingText="Envoi en cours...">
              Envoyer le lien de réinitialisation
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}