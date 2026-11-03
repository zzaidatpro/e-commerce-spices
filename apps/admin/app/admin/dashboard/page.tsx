export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barre latérale de navigation */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="#" className="block py-2 px-4 rounded bg-gray-800 text-white">Tableau de bord</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-800 text-gray-300">Utilisateurs</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-800 text-gray-300">Paramètres</a>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue dans l'espace de gestion.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Utilisateurs totaux</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">1,245</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Ventes du mois</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">8,420 €</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Commandes en attente</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">18</p>
          </div>
        </div>
      </main>
    </div>
  );
}