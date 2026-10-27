import type { Metadata } from "next";
import { HistoryHero } from "@/components/molecules/history-hero";
import { JourneyTimeline } from "@/components/molecules/journey-timeline";
import { HistoricalFigures } from "@/components/molecules/historical-figures";
import { RegionsGrid } from "@/components/molecules/regions-grid";
import { historyPage } from "@repo/database";

export const metadata: Metadata = { title: "Histoire des épices" };

export default function HistoryPage() {
  const { intro } = historyPage;

  return (
    <>
      <HistoryHero />

      <div className="bg-shop-light-pink text-darkColor">
        <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 lg:py-24">
          <h2 className="text-3xl font-semibold text-shop-dark-green md:text-4xl">{intro.title}</h2>
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 lg:pb-24">
          <h2 className="mb-12 text-3xl font-semibold text-shop-dark-green md:text-4xl">
            Des routes du poivre au monde entier
          </h2>
          <JourneyTimeline />
        </section>

        <section className="bg-shop-light-green/40 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
            <h2 className="text-3xl font-semibold text-shop-dark-green md:text-4xl">
              Ceux qui ont fait voyager les épices
            </h2>
            <HistoricalFigures />
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 lg:px-8 lg:py-24">
          <h2 className="text-3xl font-semibold text-shop-dark-green md:text-4xl">
            Les régions d'origine
          </h2>
          <RegionsGrid />
        </section>
      </div>
    </>
  );
}
