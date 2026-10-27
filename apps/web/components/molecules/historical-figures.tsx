import Image from "next/image";
import { Badge } from "@repo/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { historyPage } from "@repo/database";

export function HistoricalFigures() {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {historyPage.figures.map((figure) => (
        <li key={figure.name} className="h-full">
          <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-shop-dark-green/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-shop-dark-green/30 hover:shadow-xl">
            
           <div className="relative aspect-[4/3] w-full overflow-hidden bg-shop-dark-green/5 p-3">
              
             <Image
                src={figure.image}
                alt=""
                fill
                className="object-cover opacity-20 blur-md"
                aria-hidden="true"
              />

             <div className="relative h-full w-full">
                <Image
                  src={figure.image}
                  alt={figure.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

             <div className="absolute bottom-3 left-4 z-10">
                <Badge className="bg-white/90 text-shop-dark-green font-medium shadow-sm backdrop-blur-md border border-shop-dark-green/10">
                  {figure.dates}
                </Badge>
              </div>
            </div>

           <CardHeader className="space-y-1.5 p-6 pb-2">
              <CardTitle className="text-2xl font-serif font-bold tracking-tight text-shop-dark-green transition-colors group-hover:text-amber-700">
                {figure.name}
              </CardTitle>
              
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700/90">
                {figure.role}
              </p>
            </CardHeader>

           <CardContent className="flex-1 p-6 pt-2">
              <p className="text-sm leading-relaxed text-darkColor/80">
                {figure.text}
              </p>
            </CardContent>
            
           <div className="h-1 w-full bg-gradient-to-r from-transparent via-shop-dark-green/20 to-transparent transition-all duration-300 group-hover:via-amber-600/50" />
          </Card>
        </li>
      ))}
    </ul>
  );
}