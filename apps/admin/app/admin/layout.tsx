import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Sidebar from "@/components/molecules/Sidebar";
import LogoutButton from "@/components/atoms/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  let userRole = "manager"; // Par défaut ou valeur de repli

  if (sessionToken) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      },
    );

    // Récupérer l'utilisateur courant et son rôle
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      if (profile?.role) {
        userRole = profile.role; // 'admin' ou 'manager'
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar latérale avec transmission du rôle */}
      <aside className="w-64 border-r border-border p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground mb-6 px-3">
            {userRole === "admin" ? "Espace Administrateur" : "Espace Manager"}
          </h2>
          <Sidebar role={userRole} />
        </div>
        <div className="pt-4 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8 bg-background overflow-y-auto">{children}</main>
    </div>
  );
}
