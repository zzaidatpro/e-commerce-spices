import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-16" role="main">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12" role="banner">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Boutique E-commerce - Épices & Saveurs
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez notre sélection premium d'épices du monde entier
          </p>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" aria-label="Catégories de produits">
          <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" role="article">
            <h2 className="text-xl font-semibold mb-2">Nouveautés</h2>
            <p className="text-gray-600">Découvrez nos derniers produits ajoutés</p>
          </article>
          <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" role="article">
            <h2 className="text-xl font-semibold mb-2">Promotions</h2>
            <p className="text-gray-600">Profitez de nos offres spéciales</p>
          </article>
          <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" role="article">
            <h2 className="text-xl font-semibold mb-2">Best-sellers</h2>
            <p className="text-gray-600">Les produits les plus populaires</p>
          </article>
        </section>

        <footer className="border-t pt-8 mt-12" role="contentinfo">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} - Boutique E-commerce. Tous droits réservés.
          </p>
        </footer>
      </div>
    </main>
  );
}