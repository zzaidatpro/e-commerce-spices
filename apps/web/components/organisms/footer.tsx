'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FAMILIES, homeContent, type RoleSite } from '@repo/lib';

interface FooterProps {
  role: RoleSite;
}

type Lien = { label: string; href: string };
type Section = { title: string; links: Lien[]; isGrid: boolean };

export default function Footer({ role }: FooterProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const estLivreur = role === 'livreur';

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  type Lien = { label: string; href: string };
  type Section = { title: string; links: Lien[]; isGrid: boolean };

  const versLiens = (
    liste: readonly { label?: string; href?: string; name?: string; url?: string }[] | undefined
  ): Lien[] =>
    (liste ?? [])
      .map((l) => ({ label: l.label ?? l.name ?? '', href: l.href ?? l.url ?? '' }))
      .filter((l) => l.label !== '' && l.href !== '');
  const sections: Section[] = estLivreur
  ? [
      {
        title: 'Espace livreur',
        links: [
          { label: 'Mes livraisons', href: '/livraisons' },
          { label: 'Contact', href: '/contact' },
        ],
        isGrid: false,
      },
    ]
  : [
      { title: 'Boutique', links: versLiens(homeContent.footer.boutique), isGrid: false },
      {
        title: 'Catégories',
        links: FAMILIES.filter((fam) => fam.slug.toLowerCase() !== 'tous').map((fam) => ({
          label: fam.label,
          href: `/products?family=${fam.slug}`,
        })),
        isGrid: true,
      },
      { title: 'Informations', links: versLiens(homeContent.footer.informations), isGrid: false },
    ];

  const renderLinks = (links: Lien[], isGrid: boolean, classes: string) => (
    <ul className={isGrid ? `grid grid-cols-2 gap-x-4 gap-y-2 ${classes}` : `flex flex-col gap-2 ${classes}`}>
      {links.map((link, linkIdx) => (
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
  );

  return (
    <footer className="w-full border-t border-border bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Bureau */}
        <div
          className={`hidden md:grid gap-8 mb-8 ${estLivreur ? 'md:grid-cols-1 max-w-xs' : 'md:grid-cols-3'}`}
        >
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              {renderLinks(section.links, section.isGrid, '')}
            </div>
          ))}
        </div>

        {/* Mobile : accordéon */}
        <div className="block md:hidden w-full mb-8 divide-y divide-border border-y border-border">
          {sections.map((section, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={section.title} className="py-2">
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
                {isOpen && renderLinks(section.links, section.isGrid, 'pt-1 pb-3 pl-2 animate-in fade-in duration-200')}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tej Patta. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}