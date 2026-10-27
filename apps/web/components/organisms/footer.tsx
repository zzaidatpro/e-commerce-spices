'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const footerSections = [
  {
    title: 'Boutique',
    links: [
      { label: 'Tous les produits', href: '/shop' },
      { label: 'Nouveautés', href: '/new' },
      { label: 'Promotions', href: '/sales' },
      { label: 'Histoires', href: '/histoire'}
    ],
  },
  {
    title: 'Catégories',
    links: [
      { label: 'Épices & Herbes', href: '/categories/epices' },
      { label: 'Riz & Céréales', href: '/categories/riz' },
      { label: 'Huiles & Sauces', href: '/categories/huiles' },
    ],
  },
  {
    title: 'Informations',
    links: [
      { label: 'À propos de nous', href: '/about' },
      { label: 'Livraison & Retours', href: '/shipping' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <footer className="w-full border-t border-border bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* --- VERSION DESKTOP (Grille standard) --- */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-black dark:text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-shop-orange transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- VERSION MOBILE --- */}
        <div className="block md:hidden w-full mb-8 divide-y divide-border border-y border-border">
          {footerSections.map((section, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-2">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-black dark:text-foreground py-2 text-left"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isOpen && (
                  <ul className="flex flex-col gap-2 pt-1 pb-3 pl-2 animate-in fade-in duration-200">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-shop-orange transition-colors"
                        >
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