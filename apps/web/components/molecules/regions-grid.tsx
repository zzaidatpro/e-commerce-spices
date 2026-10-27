import { Badge } from "@repo/ui";
import Image from "next/image";
import { historyPage } from "@repo/database";
import {Card, CardTitle, CardContent, CardHeader, CardFooter} from "@repo/ui"

export function RegionsGrid() {
 return (    
    <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {historyPage.regions.map((item) => (
        <li key={item.region} className="h-full">
          <Card className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-shop-dark-green/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-shop-dark-green/30 hover:shadow-md">
                        
            <CardHeader className="p-0 pb-3 flex-row items-center gap-3 space-y-0">
              {item.image && (
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-shop-dark-green/20 bg-shop-dark-green/5 shadow-inner">
                  <Image
                    src={item.image}
                    alt={item.region}
                    fill
                    sizes="36px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              )}
              
              <CardTitle className="text-base font-serif font-bold text-shop-dark-green group-hover:text-amber-700 transition-colors leading-tight">
                {item.region}
              </CardTitle>
            </CardHeader>
          
            <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs leading-relaxed text-darkColor/80 line-clamp-3">
                {item.text}
              </p>
             
              <div className="flex flex-wrap gap-1 pt-1">
                {item.spices.map((spice) => (
                  <Badge 
                    key={spice} 
                    variant="outline" 
                    className="border-shop-dark-green/20 bg-shop-dark-green/5 text-[10px] px-1.5 py-0.2 text-shop-dark-green font-normal"
                  >
                    {spice}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}