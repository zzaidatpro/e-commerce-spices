import Link from 'next/link';
import { Button } from "../components/atoms/ui/button";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-shop_light_bg p-6 md:p-8 lg:p-10" role="main">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10" role="banner">
          <h1 className="text-3xl md:text-4xl font-bold text-shop_dark_green mb-2">
            Tableau de bord Admin
          </h1>
          <p className="text-lg text-shop_light_green">
            Gestion de votre boutique e-commerce
          </p>
        </header>

        <nav className="mb-8" role="navigation" aria-label="Navigation principale">
          <ul className="flex flex-wrap gap-4" role="menubar">
            <li role="menuitem">
              <Link href="/dev-test" aria-label="Tester les composants">
                <Button variant="outline" className="hover:bg-shop_orange/10">
                  Test Composants
                </Button>
              </Link>
            </li>
            <li role="menuitem">
              <Button variant="secondary" disabled aria-disabled="true">
                Produits
              </Button>
            </li>
            <li role="menuitem">
              <Button variant="secondary" disabled aria-disabled="true">
                Commandes
              </Button>
            </li>
            <li role="menuitem">
              <Button variant="secondary" disabled aria-disabled="true">
                Clients
              </Button>
            </li>
          </ul>
        </nav>

        <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="main">
          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="stats-title">
            <h2 id="stats-title" className="text-xl font-semibold text-shop_dark_green mb-4">
              Statistiques
            </h2>
            <div className="space-y-4" role="list">
              <div className="border-b pb-2" role="listitem">
                <p className="text-gray-600">Produits totaux</p>
                <p className="text-2xl font-bold text-shop_orange" aria-label="0 produits">0</p>
              </div>
              <div className="border-b pb-2" role="listitem">
                <p className="text-gray-600">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold text-shop_orange" aria-label="0 commandes">0</p>
              </div>
              <div role="listitem">
                <p className="text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-shop_orange" aria-label="0 euros">0 €</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="actions-title">
            <h2 id="actions-title" className="text-xl font-semibold text-shop_dark_green mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3" role="menu">
              <Button className="w-full" disabled aria-disabled="true">
                Ajouter un produit
              </Button>
              <Button variant="outline" className="w-full" disabled aria-disabled="true">
                Importer des produits
              </Button>
              <Button variant="outline" className="w-full" disabled aria-disabled="true">
                Exporter les données
              </Button>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="atomic-title">
            <h2 id="atomic-title" className="text-xl font-semibold text-shop_dark_green mb-4">
              Atomic Design
            </h2>
            <p className="text-gray-600 mb-4">
              L'Atomic Design est une méthodologie de conception de systèmes d'interface 
              utilisateur créée par Brad Frost en 2013. Elle s'inspire de la chimie pour 
              structurer les interfaces web et mobiles de manière modulaire, évolutive 
              et cohérente.
            </p>
            <Link href="/dev-test" aria-label="Voir les composants Atomic Design">
              <Button variant="ghost" className="w-full">
                Voir les composants
              </Button>
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}