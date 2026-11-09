// apps/web/app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-8">
      {/* Navigation retour */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour à l'accueil</span>
      </Link>

      {/* En-tête de la page */}
      <div className="flex flex-col gap-3 text-center sm:text-left border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">À propos de nous</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Découvrez notre histoire, notre engagement pour la qualité et notre passion pour l'excellence au service de nos clients.
        </p>
      </div>

      {/* Section Histoire / Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-background border border-border/80 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 text-left">
          <h2 className="text-lg font-bold text-shop-orange flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Notre Mission
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Nous mettons un point d'honneur à vous offrir une sélection rigoureuse de produits d'exception. Notre objectif est de combiner simplicité, rapidité de commande et transparence totale tout au long de votre parcours d'achat.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Chaque commande est traitée avec le plus grand soin, de la validation dans votre tableau de bord jusqu'à la livraison à votre domicile ou magasin.
          </p>
        </div>
        
        <div className="bg-secondary/30 border border-border/60 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pourquoi nous choisir ?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-shop-orange shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground">Sécurité renforcée et protection de vos données personnelles.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-shop-orange shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground">Suivi en temps réel de l'état de vos commandes depuis votre espace client.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-shop-orange shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground">Un accompagnement dédié et réactif pour répondre à vos besoins.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Appel à l'action */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-muted/30 border border-border/80 rounded-2xl p-6 gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-sm font-bold text-foreground">Prêt à découvrir notre catalogue ?</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Explorez nos nouveautés et passez commande en toute simplicité.</p>
        </div>
        <Link
          href="/recipes"
          className="px-5 py-2.5 bg-shop-orange hover:bg-shop-orange/90 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
        >
          Voir nos produits
        </Link>
      </div>
    </div>
  );
}