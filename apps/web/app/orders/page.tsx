import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
import { createClient } from '@repo/database/server';

const STATUT_STYLE: Record<string, string> = {
  en_attente: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  payée: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  expédiée: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
  livrée: 'bg-green-500/10 text-green-600 border border-green-500/20',
  annulée: 'bg-red-500/10 text-red-500 border border-red-500/20',
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/?redirectTo=/orders');

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, total, statut')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
          <p className="text-xs text-muted-foreground">Consultez l'historique et le suivi de vos achats.</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          &larr; Retour au tableau de bord
        </Link>
      </div>

      {error && (
        <p className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl">
          Erreur de chargement : {error.message}
        </p>
      )}

      {!error && (!orders || orders.length === 0) ? (
        <div className="text-center py-12 bg-background border border-border rounded-2xl p-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">Aucune commande trouvée.</p>
          <Link href="/products" className="text-xs text-shop-orange font-semibold hover:underline mt-2 inline-block">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-background border border-border/80 rounded-2xl shadow-xs hover:border-shop-orange/40 transition-all"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">
                    Commande #{order.id.slice(0, 8)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUT_STYLE[order.statut] ?? STATUT_STYLE.en_attente}`}>
                    {order.statut}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Passée le{' '}
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  Total : {Number(order.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                </p>
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-shop-orange hover:text-white text-foreground font-semibold text-xs rounded-xl transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Voir ma commande</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}