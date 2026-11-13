'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FAMILIES } from '@repo/lib';
import { homeContent } from '@repo/lib';

export default function Footer() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Génération des liens de catégories pointant vers /products?family=slug
  const categoryLinks = FAMILIES
    .filter((fam) => fam.slug.toLowerCase() !== 'tous') // Correction de la casse ('tous' en minuscule)
    .map((fam) => ({
      label: fam.label, // Garde la casse d'origine (ex: Épices, Poudres) ou .toLowerCase() si souhaité
      href: `/products?family=${fam.slug}`, // 👈 Même logique que la mosaïque
    }));

  const footerSections = [
    {
      title: 'Boutique',
      links: homeContent.footer.boutique,
      isGrid: false,
    },
    {
      title: 'Catégories',
      links: categoryLinks,
      isGrid: true, 
    },
    {
      title: 'Informations',
      links: homeContent.footer.informations,
      isGrid: false,
    },
  ];

  return (
    <footer className="w-full border-t border-border bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* --- VERSION DESKTOP --- */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <ul className={section.isGrid ? "grid grid-cols-2 gap-x-4 gap-y-2" : "flex flex-col gap-2"}>
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-shop-orange transition-colors inline-block relative group py-1"
                    >
                      <span className="absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop-orange group-hover:w-1/2 transition-all duration-300 group-hover:left-0" />
                      <span className="absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop-orange group-hover:w-1/2 transition-all duration-300 group-hover:right-0" />
                      {link.label} 
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- VERSION MOBILE (Accordéon) --- */}
        <div className="block md:hidden w-full mb-8 divide-y divide-border border-y border-border">
          {footerSections.map((section, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-2">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-foreground py-2 text-left cursor-pointer"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isOpen && (
                  <ul className={section.isGrid ? "grid grid-cols-2 gap-x-4 gap-y-2 pt-1 pb-3 pl-2 animate-in fade-in duration-200" : "flex flex-col gap-2 pt-1 pb-3 pl-2 animate-in fade-in duration-200"}>
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-shop-orange transition-colors inline-block relative group py-1"
                        >
                          <span className="absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop-orange group-hover:w-1/2 transition-all duration-300 group-hover:left-0" />
                          <span className="absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop-orange group-hover:w-1/2 transition-all duration-300 group-hover:right-0" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* --- BAS DU FOOTER --- */}
        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tej Patta. Tous droits réservés.
        </div>

      </div>
    </footer>
  );
}