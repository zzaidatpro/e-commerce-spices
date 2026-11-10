import Image from "next/image";

export default function AuthentificationPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <div className="grid min-h-[80svh] lg:grid-cols-2 flex-1">
        {/* Visuel : masqué sur mobile */}
        <aside className="relative hidden lg:block">
          <Image
            src="/images/auth-spices.jpg"
            alt="Épices et condiments Tej Patta"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/20 to-transparent" />
          <div className="absolute inset-x-12 bottom-12 text-white">
            <p className="font-serif text-3xl leading-snug">
              « Une pincée d'ailleurs pour sublimer chaque plat. »
            </p>
            <p className="mt-3 text-sm text-white/80">Épices fines · Récoltes artisanales</p>
          </div>
        </aside>

        {/* Formulaire */}
        <main className="flex items-center justify-center px-6 py-12 md:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      {/* Footer global */}
      
    </div>
  );
}