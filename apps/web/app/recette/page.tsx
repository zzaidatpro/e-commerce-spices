import React from 'react';
import Image from 'next/image';
import { ChefHat, Clock, Flame, Utensils, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/molecules/product-card';
import { createUserClient } from '@repo/database/client';

export default async function RecettesPage() {
  const supabase = await createUserClient();

  // Récupération des 5 épices les plus chères depuis la base de données
  const { data: expensiveSpices } = await supabase
    .from('produits')
    .select('*')
    .order('prix_unitaire', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-16">
      
      {/* HEADER DE LA PAGE */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-shop-orange/10 text-shop-orange text-xs font-semibold">
          <ChefHat className="w-4 h-4" />
          Culinairement Votre
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Nos Recettes Signatures & Astuces
        </h1>
        <p className="text-sm text-muted-foreground">
          Explorez des accords d'exception sublimés par la puissance aromatique de notre Tej Patta et de nos épices d'exception.
        </p>
      </div>

      {/* SECTION RECETTE 1 : RIZ BIRYANI AU TEJ PATTA */}
      <section className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10">
        <div className="lg:col-span-5 relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
          <Image
            src="/images/recettes/biryani.jpg"
            alt="Véritable riz biryani au Tej Patta"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 text-shop-orange"><Clock className="w-3.5 h-3.5" /> 1h 15 min</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Niveau : Intermédiaire</span>
            <span>•</span>
            <span>4 à 6 Personnes</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Le Véritable Riz Biryani au Tej Patta
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Un plat royal aux effluves envoûtants. Les feuilles de laurier Tej Patta infusent lentement dans le riz basmati et le bouillon d'épices pour libérer toute leur complexité boisée.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-shop-orange">Étapes de préparation :</h3>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
              <li><strong className="text-foreground">Marination :</strong> Enrobez la viande (poulet ou agneau) de yaourt, de cumin, de curcuma et d'ail écrasé pendant au moins 2 heures.</li>
              <li><strong className="text-foreground">Infusion aromatique :</strong> Dans une grande casserole d'eau bouillante salée, ajoutez 3 feuilles de <span className="text-shop-orange font-semibold">Tej Patta</span>, de la cardamome et des clous de girofle. Plongez le riz basmati pour une cuisson al dente (7 min), puis égouttez.</li>
              <li><strong className="text-foreground">Mijotage (Dum) :</strong> Faites revenir des oignons émincés jusqu'à caramélisation, ajoutez la viande marinée et laissez cuire.</li>
              <li><strong className="text-foreground">Assemblage :</strong> Superposez le riz mi-cuit sur la viande, parsemez de safran et de coriandre fraîche. Couvrez hermétiquement et laissez mijoter à feu très doux 30 minutes.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION RECETTE 2 : VELOUTÉ DE POTIMARRON AU PAPRIKA FUMÉ */}
      <section className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10">
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 text-shop-orange"><Clock className="w-3.5 h-3.5" /> 35 min</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Niveau : Facile</span>
            <span>•</span>
            <span>4 Personnes</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Velouté de Potimarron au Paprika Fumé
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Une douceur réconfortante et onctueuse où le piquant subtil et boisé du paprika fumé vient réveiller la rondeur sucrée du potimarron.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-shop-orange">Étapes de préparation :</h3>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
              <li><strong className="text-foreground">Préparation des légumes :</strong> Lavez le potimarron (inutile de l'éplucher s'il est bio), retirez les graines et coupez la chair en cubes réguliers. Émincez un oignon.</li>
              <li><strong className="text-foreground">Saisir les arômes :</strong> Dans une cocotte avec un filet d'huile d'olive, faites suer les oignons et les dés de potimarron pendant 5 minutes.</li>
              <li><strong className="text-foreground">Assaisonnement :</strong> Saucéz généreusement avec du <strong className="text-foreground">paprika fumé</strong>, du sel, du poivre et ajoutez une petite feuille de Tej patta pour lier les saveurs.</li>
              <li><strong className="text-foreground">Cuisson et mixage :</strong> Couvrez à hauteur avec du bouillon de légumes. Laissez mijoter 20 minutes jusqu'à tendreté, puis mixez finement avec une noisette de beurre ou de crème de coco.</li>
            </ol>
          </div>
        </div>

        <div className="lg:col-span-5 relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border order-1 lg:order-2">
          <Image
            src="/images/recettes/veloute-potimarron.jpg"
            alt="Velouté de potimarron au paprika fumé"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </section>

      {/* SECTION SÉLECTION D'ÉPICES VEDETTES (LES PLUS CHÈRES) */}
      <section className="space-y-8 pt-8 border-t border-border/80">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-orange">
            <Sparkles className="w-4 h-4" />
            Collection Prestige
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Nos 5 Épices les plus Précieuses</h2>
          <p className="text-xs text-muted-foreground">
            L'excellence de notre catalogue réunie pour les passionnés et les grands chefs.
          </p>
        </div>

        {/* Grille de produits utilisant votre composant ProductCard */}
        {expensiveSpices && expensiveSpices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {expensiveSpices.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Aucune épice vedette disponible pour le moment.
          </div>
        )}
      </section>

    </div>
  );
}