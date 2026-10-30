'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { createOrderAction } from '@/actions/createOrder';
import { createUserClient } from '@repo/database/client';
import { 
  ArrowLeft, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  AlertCircle,
  Edit3,
  Save,
  Check
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart, isHydrated } = useCart();
  const [isPending, startTransition] = useTransition();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [supabase] = useState(() => createUserClient());
  const [loadingAddress, setLoadingAddress] = useState(true);

  // État du formulaire d'adresse
  const [typeLieu, setTypeLieu] = useState<'maison' | 'magasin' | 'depot'>('maison');
  const [adresseComplete, setAdresseComplete] = useState('');
  const [urlGoogleMaps, setUrlGoogleMaps] = useState('');
  
  // Mode édition et avertissement
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Charger l'adresse existante du profil ou de la dernière adresse au chargement
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Récupérer la dernière adresse de livraison enregistrée
        const { data: addressData } = await supabase
          .from('adresses_livraison')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (addressData) {
          setAdresseComplete(addressData.adresse_complete || '');
          setTypeLieu(addressData.type_lieu || 'maison');
          setUrlGoogleMaps(addressData.url_google_maps || '');
        } else {
          // Si aucune adresse n'existe, on active le mode édition par défaut
          setIsEditingAddress(true);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'adresse", err);
        setIsEditingAddress(true);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchUserAddress();
  }, [supabase]);

  const shippingCost = totalPrice >= 5000 || totalPrice === 0 ? 0 : 400;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    if (!adresseComplete.trim()) {
      setErrorMessage("Veuillez renseigner ou confirmer votre adresse de livraison.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrderAction({
          type_lieu: typeLieu,
          adresse_complete: adresseComplete,
          url_google_maps: urlGoogleMaps,
          items: cart.map((item) => ({
            produit_id: item.id,
            quantite: item.quantity,
            price: item.price,
          })),
        });

        if (result?.success) {
          setOrderSuccess(true);
          clearCart();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Une erreur est survenue lors de la commande.');
      }
    });
  };

  if (!isHydrated) return null;

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center border border-green-500/20">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Commande enregistrée !</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Votre commande a été enregistrée avec succès. Notre équipe prendra contact avec vous pour la livraison.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 px-6 py-3 bg-shop-orange text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-shop-orange/90 transition-colors shadow-xs"
        >
          Voir mes commandes sur le Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-shop-orange hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8 text-left">
        Finaliser ma commande
      </h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne Gauche : Gestion de l'Adresse (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 bg-background border border-border/80 rounded-2xl shadow-xs flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-shop-orange" />
                <span>Adresse de livraison enregistrée</span>
              </h2>
              {!loadingAddress && !isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-orange hover:underline cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </button>
              )}
            </div>

            {loadingAddress ? (
              <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
                Chargement de votre adresse...
              </div>
            ) : !isEditingAddress ? (
              /* Affichage de l'adresse enregistrée avec possibilité de vérification */
              <div className="flex flex-col gap-4 p-4 bg-secondary/20 border border-border/60 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type de lieu : {typeLieu}</span>
                  <p className="text-sm font-medium text-foreground">{adresseComplete || "Aucune adresse enregistrée."}</p>
                  {urlGoogleMaps && (
                    <a href={urlGoogleMaps} target="_blank" rel="noreferrer" className="text-xs text-shop-orange underline mt-1">
                      Voir sur Google Maps
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Veuillez vérifier cette adresse avant de confirmer votre commande.</span>
                </div>
              </div>
            ) : (
              /* Mode Édition avec avertissement et enregistrement */
              <div className="flex flex-col gap-4 p-4 bg-secondary/10 border border-shop-orange/40 rounded-xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Type de lieu *</label>
                  <select
                    value={typeLieu}
                    onChange={(e) => setTypeLieu(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  >
                    <option value="maison">Maison</option>
                    <option value="magasin">Magasin</option>
                    <option value="depot">Dépôt</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Adresse complète *</label>
                  <textarea
                    required
                    rows={3}
                    value={adresseComplete}
                    onChange={(e) => setAdresseComplete(e.target.value)}
                    placeholder="Ex: 12 Rue Didouche Mourad, Cité 100 logts, Dély Ibrahim, Alger"
                    className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Lien Google Maps (Optionnel)</label>
                  <input
                    type="url"
                    value={urlGoogleMaps}
                    onChange={(e) => setUrlGoogleMaps(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                {/* Avertissement avant sauvegarde */}
                <div className="p-3 bg-shop-orange/10 border border-shop-orange/30 text-shop-orange text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>En confirmant ces modifications, cette nouvelle adresse sera enregistrée et mise à jour sur votre compte.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setSuccessMessage("Adresse validée pour cette commande.");
                    }}
                    className="px-4 py-2 bg-shop-orange text-white rounded-xl text-xs font-bold hover:bg-shop-orange/90 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmer l'adresse</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite : Récapitulatif et Validation (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          <div className="p-6 bg-background border border-border/80 rounded-2xl shadow-sm flex flex-col gap-5 text-left">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Récapitulatif ({totalItems} articles)
            </h3>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary/40 shrink-0 border">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-foreground truncate">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">Qté : {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-foreground shrink-0">
                    {(item.price * item.quantity).toFixed(2)} Da
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span className="font-semibold text-foreground">{totalPrice.toFixed(2)} Da</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Frais de livraison</span>
                <span className="font-semibold text-foreground">
                  {shippingCost === 0 ? <span className="text-green-600 font-bold">Offerte</span> : `${shippingCost} Da`}
                </span>
              </div>
              <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Total à payer</span>
                <span className="text-xl font-extrabold text-shop-orange">{finalTotal.toFixed(2)} Da</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isEditingAddress}
              className="w-full py-3.5 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Enregistrement de la commande...' : 'Confirmer et passer la commande'}
            </button>

            {isEditingAddress && (
              <span className="text-[11px] text-amber-600 text-center font-medium">
                Veuillez confirmer ou annuler la modification de l'adresse avant de valider la commande.
              </span>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="w-4 h-4 text-shop-dark-green" />
              <span>Transactions sécurisées et garanties</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}