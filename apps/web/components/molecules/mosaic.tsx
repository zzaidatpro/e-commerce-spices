import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui";
import { homeContent } from "@repo/database";

export function ExploreMosaic() {
  return (
    <section className="bg-background py-16 text-foreground lg:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
        <h2 className="text-3xl font-semibold md:text-4xl">Explorez nos univers aromatiques</h2>

        <ul className="grid gap-6 md:min-h-[560px] md:grid-cols-3 md:grid-rows-2">
          {homeContent.mosaic.map((item, index) => (
            <li 
              key={item.href} 
              className={cn(
                "w-full",
                index === 0 && "md:col-span-1 md:row-span-2"
              )}
            >
              <Link
                href={item.href}
                className="group relative block h-80 w-full overflow-hidden rounded-2xl bg-card border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-full shadow-sm"
              >
               <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 space-y-2 p-6 text-white">
                  <h3 className="text-xl font-bold tracking-tight md:text-2xl">{item.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{item.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}