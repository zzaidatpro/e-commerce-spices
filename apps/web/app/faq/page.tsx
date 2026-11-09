import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui';
import { faqCategories } from '@repo/lib';

export const metadata = {
  title: 'Foire Aux Questions (FAQ) | Tej Patta',
  description: 'Trouvez toutes les réponses à vos questions concernant nos épices, les livraisons en Algérie et nos conditions.',
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation / Retour */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-shop-orange transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </Link>
        </div>

        {/* En-tête de la page */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-shop-orange/10 text-shop-orange mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-shop-orange bg-shop-orange/15 px-3 py-1 rounded-full">
            Centre d'aide
          </span>
          <h1 className="text-xl md:text-5xl font-extrabold tracking-tight">
            Foire Aux Questions
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Retrouvez les réponses aux questions les plus fréquentes sur nos épices d'exception, nos livraisons et nos engagements.
          </p>
        </div>

        {/* Section Accordéons par catégorie */}
        <div className="space-y-10">
          {faqCategories.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-shop-orange" />
                {section.category}
              </h2>

              <Accordion className="w-full space-y-3">
                {section.questions.map((item, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`item-${idx}-${qIdx}`}
                    className="bg-card border border-border/80 rounded-2xl px-6 py-1 data-[state=open]:border-shop-orange/50 transition-colors shadow-xs"
                  >
                    <AccordionTrigger className="text-sm md:text-base font-semibold text-left hover:text-shop-orange hover:no-underline py-4 flex items-center justify-between group">
                      <span>{item.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed pb-4 pt-1 border-t border-border/40 mt-1">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Bloc d'aide supplémentaire */}
        <section className="rounded-3xl bg-muted/40 border border-border p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-shop-orange/10 text-shop-orange">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Notre équipe se tient à votre entière disposition pour répondre à toutes vos interrogations spécifiques.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shop-orange text-white text-xs font-semibold rounded-xl hover:bg-shop-orange/90 transition-colors shadow-xs"
            >
              Contactez-nous directement
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}