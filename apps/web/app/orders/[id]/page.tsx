import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { createClient } from '@repo/database/server';
import { TimelineCommande } from '@/components/molecules/TimelineCommande';
import { ConfirmerLivraisonForm } from '@/components/molecules/ConfirmerLivraisonForm';
import { statutClient } from '@/lib/statuts-client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

type Produit = { nom: string; image_url: string | null };

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) redirect(`/?redirectTo=/orders/${id}`);

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total,
      statut,
      adresse_liv_id,
      designe_at,
      acceptee_at,
      expediee_at,
      remise_at,
      vente_confirmee_at,
      terminee_at,
      order_items (
        id,
        quantite,
        prix_facture,
        produits (nom, image_url)
      ),
      adresses_livraison:adresse_liv_id ( adresse_complete, type_lieu )
    `)
    .eq('id', id)
    .eq('client_id', user.id)
    .maybeSingle();

  if (error) {
    return <p className="p-6 text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  if (!order) notFound();

  const statut = statutClient(order.statut);

  const adresse = Array.isArray(order.adresses_livraison)
    ? order.adresses_livraison[0]
    : order.adresses_livraison;

  const enLivraison = order.statut === 'expédiée';
  const attenteAcceptation = enLivraison && !order.acceptee_at;
  const pretAReceptionner = enLivraison && !!order.acceptee_at;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour à mes commandes</span>
      </Link>

      <TimelineCommande
        statut={order.statut}
        created_at={order.created_at}
        designe_at={order.designe_at}
        acceptee_at={order.acceptee_at}
        expediee_at={order.expediee_at}
        remise_at={order.remise_at}
        vente_confirmee_at={order.vente_confirmee_at}
        terminee_at={order.terminee_at}
      />

      {attenteAcceptation && (
        <div className="p-4 rounded-2xl border border-border bg-muted/30 text-xs text-muted-foreground">
          Votre livreur a été désigné et n'a pas encore accepté la livraison.
        </div>
      )}

      {pretAReceptionner && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-shop-orange uppercase tracking-wider">
            Réception du colis
          </h2>
          <ConfirmerLivraisonForm orderId={order.id}/>
        </section>
      )}

      <div className="bg-background border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Commande #{order.id.slice(0, 8)}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Passée le{' '}
              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold w-fit ${statut.style}`}>
            {statut.label}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-shop-orange uppercase tracking-wider">
            Articles commandés
          </h2>
          <div className="divide-y divide-border/60">
            {order.order_items.map((item) => {
              const produit: Produit | null = Array.isArray(item.produits)
                ? (item.produits[0] ?? null)
                : (item.produits as Produit | null);

              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                      {produit?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={produit.image_url}
                          alt={produit.nom ?? 'Produit'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PackageCheck className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {produit?.nom ?? 'Produit supprimé'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Quantité : {item.quantite}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {(Number(item.prix_facture) * item.quantite).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    DA
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-1">Adresse de livraison</h3>
            <p className="text-xs text-muted-foreground">
              {adresse?.adresse_complete ?? 'Adresse non renseignée'}
              {adresse?.type_lieu && ` (${adresse.type_lieu})`}
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <span className="text-xs text-muted-foreground">Total de la commande</span>
            <span className="text-lg font-bold text-shop-orange">
              {Number(order.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}