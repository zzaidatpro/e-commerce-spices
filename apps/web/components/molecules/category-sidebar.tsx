'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

interface CategorySidebarProps {
  groups: {
    families: Array<{ id: string; nom: string; slug: string }>;
    regions: Array<{ id: string; nom: string; slug: string }>;
  };
}

export function CategorySidebar({ groups }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

 
  const selectedFamilies = searchParams.getAll('family');
  const selectedRegions = searchParams.getAll('region');

  const [isFamilyOpen, setIsFamilyOpen] = useState(true);
  const [isRegionOpen, setIsRegionOpen] = useState(true);

  const handleCheckboxChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);

    if (currentValues.includes(value)) {
      
      const newValues = currentValues.filter((v) => v !== value);
      params.delete(key);
      newValues.forEach((v) => params.append(key, v));
    } else {

      params.append(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-4 bg-background p-4 rounded-xl border border-border/50">
      
      {/* --- SECTION FAMILLES D'ÉPICES --- */}
      <div className="pb-4 border-b border-border/40 last:border-none last:pb-0">
        <button
          onClick={() => setIsFamilyOpen(!isFamilyOpen)}
          className="w-full flex items-center justify-between py-1 text-left group focus:outline-none"
        >
          <Label className="font-bold text-foreground text-sm uppercase tracking-wider cursor-pointer group-hover:text-shop-orange transition-colors">
            Familles d'épices
          </Label>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              isFamilyOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isFamilyOpen && (
          <div className="space-y-2 text-sm pt-3 animate-in fade-in duration-200">
            {groups.families.map((f) => {
              const isChecked = selectedFamilies.includes(f.slug);
              return (
                <label
                  key={f.id}
                  className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange('family', f.slug)}
                    className="rounded border-border text-shop-orange focus:ring-shop-orange w-4 h-4"
                  />
                  <span>{f.nom}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* --- SECTION RÉGIONS D'ORIGINE --- */}
      <div>
        <button
          onClick={() => setIsRegionOpen(!isRegionOpen)}
          className="w-full flex items-center justify-between py-1 text-left group focus:outline-none"
        >
          <Label className="font-bold text-foreground text-sm uppercase tracking-wider cursor-pointer group-hover:text-shop-orange transition-colors">
            Régions d'origine
          </Label>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              isRegionOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isRegionOpen && (
          <div className="space-y-2 text-sm pt-3 animate-in fade-in duration-200">
            {groups.regions.map((r) => {
              const isChecked = selectedRegions.includes(r.slug);
              return (
                <label
                  key={r.id}
                  className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange('region', r.slug)}
                    className="rounded border-border text-shop-orange focus:ring-shop-orange w-4 h-4"
                  />
                  <span>{r.nom}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}