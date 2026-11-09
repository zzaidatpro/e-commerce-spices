import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PackageCheck } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { slug } = await params;
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

  // 1. Protection Sécurité : Verification de la session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/login?redirectTo=/orders/${slug}`);
  }

  // 2. Protection Sécurité (Anti-IDOR) : Filtre par slug/id ET filtrage strict sur user_id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        product:products (
          id,
          title,
          image_url
        )
      )
    `)
    .eq('user_id', user.id); // Guard anti-IDOR critique

  if (isUuid) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data: order, error } = await query.single();

  // Si la commande n'existe pas ou n'appartient pas à cet utilisateur -> 404
  if (error || !order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Navigation retour */}
      <Link 
        href="/orders" 
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour à mes commandes</span>
      </Link>

      {/* Carte Détail Commande */}
      <div className="bg-background border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
        
        {/* En-tête commande */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Commande #{order.slug || order.id.slice(0, 8)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              order.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
              order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
              'bg-amber-500/10 text-amber-600 border border-amber-500/20'
            }`}>
              {order.status || 'En cours'}
            </span>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-shop-orange uppercase tracking-wider">
            Articles commandés
          </h2>
          <div className="divide-y divide-border/60">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <PackageCheck className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.product?.title || 'Produit'}</p>
                    <p className="text-[11px] text-muted-foreground">Quantité : {item.quantity}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {(item.unit_price * item.quantity).toLocaleString('fr-FR')} DZD
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Adresse de livraison */}
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-1">Adresse de livraison</h3>
            <p className="text-xs text-muted-foreground">{order.shipping_address || 'Adresse enregistrée sur le profil'}</p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <span className="text-xs text-muted-foreground">Total de la commande</span>
            <span className="text-lg font-bold text-shop-orange">
              {order.total_amount?.toLocaleString('fr-FR')} DZD
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}