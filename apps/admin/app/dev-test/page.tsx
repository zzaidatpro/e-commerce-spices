import { PriceFormat } from '@/components/atoms/domain/price-format';
import { RatingStars } from '@/components/atoms/domain/rating-stars';
import { StockIndicator } from '@/components/atoms/domain/stock-indicator';

export default function DevPlaygroundPage() {
  return (
    <div className="min-h-screen bg-shop_light_bg">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-10">
        <header className="border-b pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-shop_dark_green">
            Test des Composants Atomes
          </h1>
          <p className="text-lg text-shop_light_green mt-2">
            /components/atoms/domain/
          </p>
        </header>

      <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-shop_dark_green mb-6">
          1. Format de prix
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Prix standard :</p>
            <PriceFormat amount={29.99} />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Prix en promotion avec badge :
            </p>
            <PriceFormat amount={19.99} originalAmount={29.99} />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Autre devise (USD) :
            </p>
            <PriceFormat amount={49.99} currency="USD" locale="en-US" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-shop_dark_green mb-6">
          2. Évaluation du produit
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Note parfaite (5/5) :</p>
            <RatingStars rating={5} showScore />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demi-étoile (4.5/5) :</p>
            <RatingStars rating={4.5} showScore />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Note basse sans score textuel (2.3/5) :
            </p>
            <RatingStars rating={2.3} size={20} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-shop_dark_green mb-6">
          3. Indicateur de stock
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Disponibilité acceptable (50) :
            </p>
            <StockIndicator stock={50} />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Disponibilité critique (10) :
            </p>
            <StockIndicator stock={10} />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Rupture de stock (0) :
            </p>
            <StockIndicator stock={0} />
          </div>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t text-center text-gray-500">
        <p>Page de test pour les composants Atomic Design</p>
      </footer>
    </div>
  );
}