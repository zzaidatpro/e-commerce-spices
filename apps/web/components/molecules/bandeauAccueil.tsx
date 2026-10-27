import { Leaf, MapPin, Package } from "lucide-react";
import { homeContent } from "@repo/database";

const icons = [MapPin, Package, Leaf];

export function PromisesBand() {
  return (
    <section className="bg-shop-dark-green text-shop-light-pink">
      <ul className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 lg:px-8">
        {homeContent.promises.map((promise, index) => {
          const Icon = icons[index];
          return (
            <li key={promise.title} className="flex items-start gap-4">
              <Icon className="mt-1 size-6 shrink-0" strokeWidth={1.25} aria-hidden />
              <div className="space-y-1">
                <h2 className="font-semibold">{promise.title}</h2>
                <p className="text-sm leading-relaxed opacity-90">{promise.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}