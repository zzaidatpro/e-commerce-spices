'use client';

import { useActionState } from 'react';
import { creerCompteStaffAction  } from '@/actions/actionUserManagement';

const champ =
  'w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50';

export function CreerCompteStaffForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) =>
      creerCompteStaffAction (formData),
    null
  );

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      {state?.error && (
        <p className="sm:col-span-2 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 p-3 bg-green-500/10 border border-green-500/30 text-green-600 text-xs rounded-xl">
          Compte créé. Communiquez le mot de passe à la personne concernée.
        </p>
      )}

      <input name="nom" required placeholder="Nom" className={champ} />
      <input name="prenom" required placeholder="Prénom" className={champ} />
      <input name="email" type="email" required placeholder="Adresse e-mail" className={champ} />
      <input name="telephone" type="tel" placeholder="Téléphone" className={champ} />
      <input name="password" type="password" required minLength={8} placeholder="Mot de passe provisoire" className={champ} />

      <select name="role" defaultValue="manager" className={champ}>
        <option value="manager">Manager</option>
        <option value="livreur">Livreur</option>
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="sm:col-span-2 py-2.5 bg-shop-orange text-white font-bold text-xs rounded-xl disabled:opacity-50"
      >
        {isPending ? 'Création...' : 'Créer le compte'}
      </button>
    </form>
  );
}