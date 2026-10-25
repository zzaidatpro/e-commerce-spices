import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getHistoryTimeline } from "@repo/database";
import { Timeline } from "@/components/molecules/timeline";

export default async function HistoirePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const rawProducts = await getHistoryTimeline(supabase as any);

  const historyEvents = (rawProducts || []).map((item: any, index: number) => ({
    id: String(index + 1),
    year: index + 1,
    title: item.nom || "Produit",
    description: item.description || "",
    image_url: "",
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">L'Histoire des Épices</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Découvrez nos épices classées par origine et leurs caractéristiques.
        </p>
      </div>

      <Timeline events={historyEvents} />
    </div>
  );
}
