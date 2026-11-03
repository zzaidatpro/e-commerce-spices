'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePasswordAction } from '@/actions/actionUpdatePassword';
import { Lock } from 'lucide-react';
import InputField from '@/components/atoms/InputField';
import SubmitButton from '@/components/atoms/SubmitButton';

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updatePasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccessMessage('Mot de passe mis à jour avec succès ! Redirection...');
        setTimeout(() => {
          router.push('/login?passwordUpdated=true');
        }, 2000);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-xs">
        <h1 className="text-xl font-bold text-foreground text-center mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Veuillez saisir votre nouveau mot de passe sécurisé.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-xl text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            icon={Lock}
          />

          <SubmitButton 
            isPending={isPending || Boolean(successMessage)} 
            loadingText="Mise à jour en cours..."
          >
            Enregistrer le nouveau mot de passe
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}