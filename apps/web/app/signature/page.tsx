// apps/web/app/signature/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  TrendingUp, 
  Leaf, 
  ChefHat, 
  Sparkles, 
  ShieldCheck, 
  UtensilsCrossed, 
  ArrowRight, 
  Clock, 
  Scale,
  HeartPulse
} from 'lucide-react';
import AddToCartButton from '@/components/atoms/AddToCartButton';
import { createUserClient } from '@repo/database/client';
import { LAURIER_SIGNATURE_DATA } from '@repo/lib'; 

// Mapping des icônes pour les bienfaits
const ICON_MAP: Record<string, any> = {
  HeartPulse,
  Sparkles,
  ShieldCheck,
};

export default async function SignaturePage() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  const bulkActionHref = user ? '/dashboard' : '/';
  const { stats, benefits, proTips, recipes, product } = LAURIER_SIGNATURE_DATA;

  return (
    <div className="min-h-screen bg-background text-foreground space-y-16 py-8 px-4 md:px-8 max-w-6xl mx-auto">
      
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-muted border border-border/80 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shop-orange/10 text-shop-orange text-xs font-semibold">
            <Leaf className="w-4 h-4" />
            L'Ingrédient Signature
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Tej Patta <br />
            <span className="text-shop-orange">La puissance du Laurier Noble</span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Plante reine des fonds de sauces, des mijotés et de la haute gastronomie. Notre Tej patta est trié à la main, garantissant des feuilles entières, aromatiques et riches en huiles essentielles pour sublimer chaque préparation.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="w-full sm:w-auto">
              <AddToCartButton 
                product={product} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-shop-orange hover:bg-shop-orange/90 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              />
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
            >
              Voir tout le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-background border border-border shadow-md">
          <Image
            src={product.image}
            alt="Feuilles de Tej Patta Laurier"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* 2. CHIFFRES CLÉS & PERFORMANCES */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight">Le Tej Patta en Chiffres</h2>
          <p className="text-xs text-muted-foreground">Des données de vente et de performance qui témoignent de la confiance de nos partenaires professionnels.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-background border border-border/80 p-6 rounded-2xl space-y-2 shadow-xs">
              <div className="text-3xl font-extrabold text-shop-orange flex items-center gap-2">
                {stat.value}
                <TrendingUp className="w-5 h-5 text-shop-orange/60" />
              </div>
              <div className="text-sm font-semibold text-foreground">{stat.label}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BIENFAITS ET SANTÉ */}
      <section className="bg-muted/40 border border-border/60 rounded-3xl p-6 md:p-10 space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Bienfaits & Vertus Nutritionnelles</h2>
          <p className="text-xs text-muted-foreground">Pourquoi le Tej Patta est essentiel pour le corps et l'esprit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const IconComponent = ICON_MAP[b.iconType] || Sparkles;
            return (
              <div key={i} className="bg-background p-6 rounded-2xl border border-border/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-shop-orange/10 flex items-center justify-center text-shop-orange">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ESPACE PROFESSIONNELS & ASTUCES PRATIQUES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
          <Image
            src="/images/signature/pro-kitchen.jpg"
            alt="Astuces pour professionnels"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-orange">
              <ChefHat className="w-4 h-4" />
              Coin Restauration & Métiers de bouche
            </div>
            <h2 className="text-2xl font-bold">Astuces Pratiques pour les Professionnels</h2>
            <p className="text-xs text-muted-foreground">Optimisez l’utilisation du laurier Tej patta dans vos cuisines centrales ou restaurants.</p>
          </div>

          <div className="space-y-4">
            {proTips.map((tip, idx) => (
              <div key={idx} className="bg-background border border-border/80 p-4 rounded-xl space-y-1 shadow-xs">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-shop-orange" />
                  {tip.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECETTES SIGNATURES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recettes à la une</h2>
            <p className="text-xs text-muted-foreground">Mettez en valeur les arômes du Tej Patta dans vos cartes.</p>
          </div>
          <UtensilsCrossed className="w-5 h-5 text-muted-foreground hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe, index) => (
            <div key={index} className="group bg-background border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-shop-orange/50 transition-all flex flex-col sm:flex-row">
              <div className="relative aspect-video sm:aspect-square sm:w-48 bg-muted shrink-0">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                    <span>•</span>
                    <span>{recipe.yield}</span>
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-shop-orange transition-colors">{recipe.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{recipe.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL */}
      <section className="bg-shop-orange text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-lg">
        <h2 className="text-2xl md:text-4xl font-extrabold">Besoin de volumes professionnels ?</h2>
        <p className="text-xs md:text-sm max-w-xl mx-auto opacity-95 leading-relaxed">
          Nous fournissons les restaurateurs, traiteurs et épiceries en conditionnements grossistes (1kg, 5kg, 10kg) avec des tarifs préférentiels.
        </p>
        <div className="pt-2">
          <Link
            href={bulkActionHref}
            className="inline-block bg-white text-shop-orange hover:bg-slate-100 font-bold text-xs md:text-sm px-8 py-3.5 rounded-xl transition-colors shadow-md"
          >
            {user ? 'Accéder à mon espace pro' : 'Se connecter pour commander en gros'}
          </Link>
        </div>
      </section>

    </div>
  );
}