import Image from "next/image";
import { historyPage } from "@repo/database";

export function HistoryHero() {
  const { hero } = historyPage;

  return (
    <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden bg-shop-dark-green text-shop-light-pink">
      <Image
        src="/images/tejpatta_story.jpg"
        alt={hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-shop-dark-green via-shop-dark-green/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-32 lg:px-8">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{hero.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-90">{hero.subtitle}</p>
      </div>
    </section>
  );
}