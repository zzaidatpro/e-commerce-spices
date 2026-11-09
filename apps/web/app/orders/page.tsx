import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';

export default async function OrdersPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Protection Sécurité : Authentification obligatoire
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login?redirectTo=/orders');
  }

  // 2. Récupération sécurisée : Uniquement les commandes appartenant à l'utilisateur connecté
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, slug, created_at, total_amount, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Commandes</h1>
          <p className="text-xs text-muted-foreground">Consultez l'historique et le suivi de vos achats.</p>
        </div>
        <Link 
          href="/dashboard" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Retour au tableau de bord
        </Link>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-12 bg-background border border-border rounded-2xl p-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">Aucune commande trouvée.</p>
          <Link href="/recipes" className="text-xs text-shop-orange font-semibold hover:underline mt-2 inline-block">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const targetSlug = order.slug || order.id;
            return (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 bg-background border border-border/80 rounded-2xl shadow-xs hover:border-shop-orange/40 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">
                      Commande #{order.slug || order.id.slice(0, 8)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {order.status || 'En cours'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    Total : {order.total_amount?.toLocaleString('fr-FR')} DZD
                  </p>
                </div>

                {/* Bouton "Voir ma commande" */}
                <Link
                  href={`/orders/${targetSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-shop-orange hover:text-white text-foreground font-semibold text-xs rounded-xl transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Voir ma commande</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}