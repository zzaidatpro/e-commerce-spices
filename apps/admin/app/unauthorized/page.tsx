import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">
          Cet espace est réservé aux administrateurs et aux managers.
        </p>
        <Link
          href="/login"
          className="inline-block w-full py-2.5 bg-shop-orange text-white font-medium text-sm rounded-md"
        >
          Se connecter avec un autre compte
        </Link>
      </div>
    </main>
  );
}