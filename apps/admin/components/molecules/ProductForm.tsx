'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { saveProductAction, deleteProductAction } from '@/actions/actionProducts';

type Valeurs = {
  id?: string;
  nom?: string | null;
  slug?: string | null;
  description?: string | null;
  prix_unitaire?: number | string | null;
  stock?: number | null;
  family?: string | null;
  region?: string | null;
  origin?: string | null;
  weight?: string | null;
  sku?: string | null;
  image_url?: string | null;
  is_best_seller?: boolean | null;
  is_featured?: boolean | null;
};

const champ =
  'w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50';

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function ProductForm({ valeurs = {}, isAdmin }: { valeurs?: Valeurs; isAdmin: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const enregistrer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveProductAction(formData);
      if (res.error) {
        setMessage({ ok: false, texte: res.error });
        return;
      }
      if (!valeurs.id && res.id) {
        router.replace(`/admin/products/${res.id}`);
        return;
      }
      setMessage({ ok: true, texte: 'Produit enregistré.' });
    });
  };

  const supprimer = () => {
    if (!valeurs.id) return;
    if (!confirm('Supprimer définitivement ce produit ?')) return;
    startDelete(async () => {
      const res = await deleteProductAction(valeurs.id!);
      if (res.error) setMessage({ ok: false, texte: res.error });
      else router.push('/admin/products');
    });
  };

  return (
    <form onSubmit={enregistrer} className="flex flex-col gap-6 max-w-3xl">
      {valeurs.id && <input type="hidden" name="id" value={valeurs.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Champ label="Nom *">
          <input name="nom" required defaultValue={valeurs.nom ?? ''} className={champ} />
        </Champ>
        <Champ label="Slug (URL, vide = généré depuis le nom)">
          <input name="slug" defaultValue={valeurs.slug ?? ''} className={champ} />
        </Champ>
        <Champ label="Prix unitaire (DA) *">
          <input name="prix_unitaire" type="number" step="0.01" min={0} required defaultValue={valeurs.prix_unitaire ?? ''} className={champ} />
        </Champ>
        <Champ label="Stock">
          <input name="stock" type="number" min={0} step={1} defaultValue={valeurs.stock ?? 0} className={champ} />
        </Champ>
        <Champ label="Famille">
          <input name="family" defaultValue={valeurs.family ?? ''} className={champ} />
        </Champ>
        <Champ label="Région">
          <input name="region" defaultValue={valeurs.region ?? ''} className={champ} />
        </Champ>
        <Champ label="Origine">
          <input name="origin" defaultValue={valeurs.origin ?? ''} className={champ} />
        </Champ>
        <Champ label="Poids / conditionnement">
          <input name="weight" defaultValue={valeurs.weight ?? ''} className={champ} />
        </Champ>
        <Champ label="SKU">
          <input name="sku" defaultValue={valeurs.sku ?? ''} className={champ} />
        </Champ>
        <Champ label="URL de l'image">
          <input name="image_url" defaultValue={valeurs.image_url ?? ''} className={champ} />
        </Champ>
      </div>

      <Champ label="Description">
        <textarea name="description" rows={4} defaultValue={valeurs.description ?? ''} className={champ} />
      </Champ>

      <div className="flex gap-6 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_best_seller" defaultChecked={!!valeurs.is_best_seller} className="accent-shop-orange" />
          Essentiel (meilleure vente de la vitrine)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={!!valeurs.is_featured} className="accent-shop-orange" />
          Mis en avant
        </label>
      </div>

      {message && (
        <p className={`text-xs ${message.ok ? 'text-green-600' : 'text-destructive'}`}>{message.texte}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          {isAdmin && valeurs.id && (
            <button
              type="button"
              onClick={supprimer}
              disabled={isDeleting}
              className="px-4 py-2 border border-red-500/40 text-red-600 text-xs font-bold rounded-xl disabled:opacity-50"
            >
              {isDeleting ? '...' : 'Supprimer'}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 border border-border text-xs font-semibold rounded-xl"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : valeurs.id ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </div>
      </div>
    </form>
  );
}