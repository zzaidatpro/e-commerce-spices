'use client';

import React from 'react';
import { FAMILIES } from '@repo/lib'; 

interface CategoryFilterProps {
  activeFamily?: string;
  onSelectFamily: (family: string) => void;
}

export default function CategoryFilter({ activeFamily = 'tous', onSelectFamily }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
      {FAMILIES.map((item) => {
        const isActive = activeFamily.toLowerCase() === item.slug.toLowerCase();

        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => {
              // Sécurité absolue anti-plantage
              if (typeof onSelectFamily === 'function') {
                onSelectFamily(item.slug);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
              isActive
                ? 'bg-shop-orange text-white border-shop-orange shadow-xs'
                : 'bg-background text-foreground border-border/80 hover:border-shop-orange/50 hover:bg-muted'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}