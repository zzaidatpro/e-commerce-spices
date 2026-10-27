import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden text-white p-8 md:p-16 my-6 shadow-lg">
      <Image
       src="/images/hero_banner.jpg"
        alt="Épices et saveurs du monde"
        fill
        className="object-cover object-center z-0"
        priority
      />

     <div className="absolute inset-0 bg-black/50 z-10" />
      
     <div className="relative z-20 max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>L'EXCELLENCE DE L'INDUS DANS VOTRE CUISINE</span>
        </div>

       <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Voyagez au cœur des saveurs et des épices d'exception
        </h1>

       <p className="text-white/90 text-sm md:text-base leading-relaxed">
          Découvrez notre sélection exclusive d'épices rares, de sauces artisanales et de mélanges uniques pour éveiller vos plats et sublimer votre cuisine.
        </p>

       <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-sm"
          >
            Explorer la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/histoire"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-colors border border-white/20"
          >
            Notre histoire
          </Link>
        </div>
      </div>
    </section>
  );
}