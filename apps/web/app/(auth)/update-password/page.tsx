'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserClient } from '@repo/database/client';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const [supabase] = useState(() => createUserClient());

  useEffect(() => {
    const handlePasswordResetSession = async () => {
      try {
        // 1. Récupérer les paramètres de l'URL (notamment le 'code')
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          // Si un code est présent dans l'URL, on l'échange contre une session valide
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        // 2. Vérifier si une session active est bien présente après l'échange
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError("Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.");
        }
      } catch (err: any) {
        setError(err.message || "Le lien de réinitialisation est invalide ou a expiré.");
      } finally {
        setIsInitializing(false);
      }
    };

    handlePasswordResetSession();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="w-8 h-8 animate-spin text-shop-orange" />
        <p className="text-xs text-muted-foreground">Vérification du lien de sécurité...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-muted-foreground">
          Veuillez saisir votre nouveau mot de passe ci-dessous.
        </p>
      </div>

      {error && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium text-center">
            {error}
          </div>
          <a
            href="/reset-password"
            className="text-center text-xs font-semibold text-shop-orange hover:underline"
          >
            Faire une nouvelle demande de réinitialisation
          </a>
        </div>
      )}

      {success ? (
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Mot de passe mis à jour avec succès ! Redirection en cours...
          </p>
        </div>
      ) : (
        !error && (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-medium text-foreground">Nouveau mot de passe</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-9 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-medium text-foreground">Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/95 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}
            </button>
          </form>
        )
      )}
    </div>
  );
}