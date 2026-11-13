import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">
          Votre compte n'a pas accès à cette page. Si vous pensez qu'il s'agit d'une erreur, contactez-nous.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/"
            className="w-full py-2.5 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-sm rounded-md transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/"
            className="text-xs text-shop-orange hover:underline font-medium"
          >
            Se connecter avec un autre compte
          </Link>
        </div>
      </div>
    </main>
  );
}