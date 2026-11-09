import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Clock, ArrowLeft, PackageCheck, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Livraison & Retours | Tej Patta',
  description: 'Consultez les conditions de livraison, les procédures de retour et les garanties de fraîcheur pour vos commandes Tej Patta.',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Navigation & Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-shop-orange transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Hero Section avec visuel d'épices */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            
            <div className="p-8 md:p-12 space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-shop-orange bg-shop-orange/10 px-3 py-1 rounded-full">
                Engagement & Transparence
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Livraison & Retours
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Nous prenons le plus grand soin à emballer vos épices d'exception dans des sachets hermétiques afin de préserver la puissance de leurs arômes de nos ateliers jusqu'à votre cuisine.
              </p>
            </div>

            <div className="relative h-64 md:h-full min-h-80 w-full overflow-hidden">
              <Image
                src="/images/reglement/epices-emballees.jpeg"
                alt="Épices et condiments fraîchement emballés"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-card via-transparent to-transparent opacity-80 md:opacity-40" />
            </div>

          </div>
        </section>

        {/* Garanties en 3 points clés */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-muted/40 border border-border/70 hover:border-shop-orange/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-shop-orange/10 text-shop-orange flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Expédition Express</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toute commande passée avant 12h est préparée et expédiée le jour même (hors week-ends et jours fériés).
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-muted/40 border border-border/70 hover:border-shop-orange/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-shop-orange/10 text-shop-orange flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Emballage Protecteur</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Éco-conçu et hermétique contre la lumière et l'humidité pour garantir la préservation des huiles essentielles.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-muted/40 border border-border/70 hover:border-shop-orange/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-shop-orange/10 text-shop-orange flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Retours sous 14 jours</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Une insatisfaction ? Vous disposez de 14 jours à compter de la réception pour nous retourner votre produit non ouvert.
            </p>
          </div>
        </section>

        {/* Section 1 : Tarifs & Délais de Livraison */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Clock className="w-6 h-6 text-shop-orange" />
            <h2 className="text-2xl font-bold">1. Modes et Délais de Livraison</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Nous livrons à domicile ainsi qu'en point relais. Dès le départ de votre colis, un numéro de suivi vous est automatiquement transmis par email.
              </p>
              
              {/* Tableau / Carte des Tarifs */}
              <div className="rounded-2xl border border-border overflow-hidden bg-card text-foreground">
                <div className="grid grid-cols-3 bg-muted p-3 text-xs font-semibold uppercase tracking-wider border-b border-border">
                  <span>Option</span>
                  <span>Délai moyen</span>
                  <span className="text-right">Tarif</span>
                </div>
                <div className="divide-y divide-border text-xs">
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-medium">Point Relais</span>
                    <span className="text-muted-foreground">3 à 5 jours ouvrés</span>
                    <span className="text-right font-bold text-shop-orange">300 da (Offert dès 5000da)</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-medium">Domicile Standard</span>
                    <span className="text-muted-foreground">2 à 3 jours ouvrés</span>
                    <span className="text-right font-bold text-shop-orange">900 Da (Offert dès 10 000 da)</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="font-medium">Express 24h</span>
                    <span className="text-muted-foreground">24h (Commande avant 12h)</span>
                    <span className="text-right font-bold">2000 Da</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-72 w-full rounded-2xl overflow-hidden shadow-sm border border-border">
              <Image
                src="/images/reglement/conditionnement-epices.jpeg"
                alt="Conditionnement d'épices en poudres et baies"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Section 2 : Politique de Retour et Remboursement */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <ShieldCheck className="w-6 h-6 text-shop-orange" />
            <h2 className="text-2xl font-bold">2. Procédure de Retour & Rétractation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <div className="relative h-72 w-full rounded-2xl overflow-hidden shadow-sm border border-border order-2 md:order-1">
              <Image
                src="/images/reglement/epices-poudre.jpeg"
                alt="Herbes et condiments de qualité"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-4 text-sm text-muted-foreground order-1 md:order-2">
              <p className="leading-relaxed">
                Conformément à la réglementation en vigueur, vous disposez d'un délai de <strong>14 jours ouvrables</strong> à compter de la réception de vos produits pour exercer votre droit de rétractation.
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-2">
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  ⚠️ Condition sanitaire importante :
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pour des raisons d'hygiène et de sécurité alimentaire, seuls les sachets et flacons **strictement scellés, non ouverts et dans leur emballage d'origine** pourront faire l'objet d'un retour et remboursement.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Comment effectuer un retour ?</h4>
                <ol className="list-decimal list-inside text-xs space-y-1.5 pl-1">
                  <li>Contactez notre service client via notre formulaire ou par email.</li>
                  <li>Inscrivez votre numéro de commande sur le colis de retour.</li>
                  <li>Expédiez le colis à l'adresse de notre centre de préparation.</li>
                  <li>Le remboursement est effectué sous 5 à 7 jours après réception et contrôle.</li>
                </ol>
              </div>
            </div>

          </div>
        </section>

        {/* Section FAQ & Contact */}
        <section className="rounded-3xl bg-muted/30 border border-border p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-shop-orange/10 text-shop-orange">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Une question sur votre commande en cours ?</h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Notre équipe dédiée aux passionnés de cuisine répond à toutes vos demandes de suivi ou d'assistance en moins de 24h.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shop-orange text-white text-xs font-semibold rounded-xl hover:bg-shop-orange/90 transition-colors shadow-xs"
            >
              Contactez le Service Client
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}