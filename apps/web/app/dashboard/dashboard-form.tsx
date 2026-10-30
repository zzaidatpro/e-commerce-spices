'use client';

import React, { useState, useTransition } from 'react';
import { updateProfile } from '@/actions/actionDashboard';
import SessionTimeMolecule from '@/components/molecules/SessionTimeMolecule';
import OrderHistoryMolecule from '@/components/molecules/OrderHistoryMolecule';

interface DashboardFormProps {
  initialProfile: {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    whatsapp?: string;
    date_naissance?: string;
    adresse?: string;
  };
}

export default function DashboardForm({ initialProfile }: DashboardFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateProfile(formData);
        if (res?.message) {
          setSuccessMessage(res.message);
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la mise à jour.');
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      
      {/* En-tête de la page */}
      <div className="flex flex-col gap-1 text-center sm:text-left border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mon Tableau de Bord</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles, votre adresse de livraison et suivez vos commandes.
        </p>
      </div>

      {/* Grid principale 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne gauche (8 cols) : Formulaire d'Informations et Adresse */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 text-xs rounded-xl text-center font-medium">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-background p-6 border border-border/80 rounded-2xl shadow-xs">
            
            {/* MOLÉCULE : Informations Personnelles */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-shop-orange uppercase tracking-wider border-b border-border/60 pb-1.5">
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="nom" className="text-xs font-semibold text-foreground">Nom</label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    defaultValue={initialProfile?.nom || ''}
                    required
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="prenom" className="text-xs font-semibold text-foreground">Prénom</label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    defaultValue={initialProfile?.prenom || ''}
                    required
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="telephone" className="text-xs font-semibold text-foreground">Téléphone</label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    defaultValue={initialProfile?.telephone || ''}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="whatsapp" className="text-xs font-semibold text-foreground">WhatsApp</label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    defaultValue={initialProfile?.whatsapp || ''}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="dateNaissance" className="text-xs font-semibold text-foreground">Date de naissance</label>
                  <input
                    id="dateNaissance"
                    name="dateNaissance"
                    type="date"
                    defaultValue={initialProfile?.date_naissance || ''}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>
              </div>
            </div>

            {/* MOLÉCULE : Adresse de livraison */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-semibold text-shop-orange uppercase tracking-wider border-b border-border/60 pb-1.5">
                Adresse de livraison
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 text-left col-span-1">
                  <label htmlFor="numero" className="text-xs font-semibold text-foreground">N°</label>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    placeholder="12"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left col-span-2">
                  <label htmlFor="rue" className="text-xs font-semibold text-foreground">Rue</label>
                  <input
                    id="rue"
                    name="rue"
                    type="text"
                    placeholder="Rue Didouche Mourad"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="cite" className="text-xs font-semibold text-foreground">Cité / Quartier</label>
                  <input
                    id="cite"
                    name="cite"
                    type="text"
                    placeholder="Dély Ibrahim"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="ville" className="text-xs font-semibold text-foreground">Ville</label>
                  <input
                    id="ville"
                    name="ville"
                    type="text"
                    placeholder="Alger"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="codePostal" className="text-xs font-semibold text-foreground">Code postal</label>
                  <input
                    id="codePostal"
                    name="codePostal"
                    type="text"
                    placeholder="16047"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="lieu" className="text-xs font-semibold text-foreground">Type de lieu</label>
                  <select
                    id="lieu"
                    name="lieu"
                    defaultValue="maison"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  >
                    <option value="maison">Maison</option>
                    <option value="magasin">Magasin</option>
                    <option value="depot">Dépôt</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="urlGoogleMap" className="text-xs font-semibold text-foreground">Google Maps (URL)</label>
                  <input
                    id="urlGoogleMap"
                    name="urlGoogleMap"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isPending ? 'Enregistrement...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>

        {/* Colonne droite (5 cols) : Temps passé & Historique de commande */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
          {/* Molécule temps passé */}
          <SessionTimeMolecule />

          {/* Molécule historique des achats */}
          <OrderHistoryMolecule />
        </div>

      </div>
    </div>
  );
}