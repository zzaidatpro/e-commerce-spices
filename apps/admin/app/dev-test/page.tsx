import { PriceFormat, RatingStars, StockIndicator } from "@repo/ui" 


export default function DevPlaygroundPage() {
  return (
    <div className="container mx-auto p-8 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">
        Test des Composants Atomes (/components/domain/)
      </h1>

      {/* 1. SECTION PRICE FORMAT */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          1. format prix : 
        </h2>
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Prix standard :</p>
            <PriceFormat amount={29.99} />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Prix en promotion avec badge :</p>
            <PriceFormat amount={19.99} originalAmount={29.99} />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Autre devise (USD) :</p>
            <PriceFormat amount={49.99} currency="USD" locale="en-US" />
          </div>
        </div>
      </section>

      {/* 2. SECTION RATING STARS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          2. evaluation du produit :
        </h2>
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Note parfaite (5/5) :</p>
            <RatingStars rating={5} showScore />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Demi-étoile (4.5/5) :</p>
            <RatingStars rating={4.5} showScore />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Note basse sans score textuel (2.3/5) :</p>
            <RatingStars rating={2.3} size={20} />
          </div>
        </div>
      </section>

      {/* 3. SECTION STOCK INDICATOR */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          3. indicateur de stock : 
        </h2>
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <span className="w-32 text-sm">disponibilite acceptable (50) :</span>
            <StockIndicator stock={15} />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-sm">disponibilite critique (10) :</span>
            <StockIndicator stock={10} />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-sm">Rupture de stock (0) :</span>
            <StockIndicator stock={0} />
          </div>
        </div>
      </section>
    </div>
  );
}