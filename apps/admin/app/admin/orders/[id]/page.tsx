import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/actions/helper';
import { STATUT_LABELS } from '@/lib/commandes';
import {
  OrderStatusForm,
  RemiseForm,
  CodeLivraisonButton,
} from '@/components/molecules/OrderActions';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireRole(['admin', 'manager']);
  const supabase = auth.supabase;
  const isAdmin = auth.role === 'admin';

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, created_at, total, remise, statut, adresse_liv_id, expediee_at')
    .eq('id', id)
    .maybeSingle();

  if (error) return <p className="text-xs text-destructive">Erreur : {error.message}</p>;
  if (!order) notFound();

  const [itemsRes, adresseRes, contactRes] = await Promise.all([
    supabase
      .from('order_items')
      .select('id, quantite, prix_facture, produits(nom)')
      .eq('order_id', id),
    order.adresse_liv_id
      ? supabase
          .from('adresses_livraison')
          .select('adresse_complete, type_lieu, url_google_maps')
          .eq('id', order.adresse_liv_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.rpc('contact_client_commande', { p_order: id }),
  ]);

  const items = itemsRes.data ?? [];
  const adresse = adresseRes.data;
  const contact = contactRes.data?.[0];
  const waDigits = contact?.whatsapp?.replace(/\D/g, '');

  const sousTotal = items.reduce(
    (s: number, i: { quantite: number; prix_facture: number }) =>
      s + Number(i.quantite) * Number(i.prix_facture),
    0
  );

  const euros = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;
  const peutGenererCode = order.statut === 'payée' || order.statut === 'expédiée';

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
            ← Retour aux commandes
          </Link>
          <h1 className="text-xl font-bold text-foreground mt-1">Commande #{order.id.slice(0, 8)}</h1>
          <p className="text-xs text-muted-foreground">
            Passée le{' '}
            {new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {order.expediee_at &&
              ` · expédiée le ${new Date(order.expediee_at).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
        <OrderStatusForm orderId={order.id} statut={order.statut} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Colonne principale : articles et totaux */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="border border-border rounded-2xl bg-card p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">Articles</h2>
            <div className="divide-y divide-border">
              {items.map((item: any) => (
                <div key={item.id} className="py-3 flex justify-between text-xs">
                  <span>
                    {item.produits?.nom ?? 'Produit supprimé'} × {item.quantite}
                  </span>
                  <span className="font-semibold">
                    {euros(Number(item.quantite) * Number(item.prix_facture))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span>{euros(sousTotal)}</span>
              </div>
              {Number(order.remise) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span>- {euros(Number(order.remise))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>Total à payer</span>
                <span className="text-shop-orange">{euros(Number(order.total))}</span>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-2xl bg-card p-6 text-xs">
            <h2 className="text-sm font-bold text-foreground mb-3">Livraison</h2>
            {adresse ? (
              <>
                <p className="text-foreground">{adresse.adresse_complete}</p>
                <p className="text-muted-foreground capitalize">Lieu : {adresse.type_lieu}</p>
                {adresse.url_google_maps && (
                  <a
                    href={adresse.url_google_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shop-orange hover:underline"
                  >
                    Ouvrir dans Google Maps
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Adresse non renseignée.</p>
            )}
          </section>
        </div>

        {/* Colonne latérale : client, livraison, remise */}
        <div className="flex flex-col gap-6">
          <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-2 text-xs">
            <h2 className="text-sm font-bold text-foreground">Client</h2>
            {contactRes.error ? (
              <p className="text-destructive">Coordonnées indisponibles.</p>
            ) : contact ? (
              <>
                <p className="font-semibold text-foreground">
                  {contact.prenom} {contact.nom}
                </p>
                {contact.email && <p className="text-muted-foreground">{contact.email}</p>}
                {contact.telephone && (
                  <a href={`tel:${contact.telephone}`} className="text-shop-orange hover:underline">
                    {contact.telephone}
                  </a>
                )}
                {waDigits && (
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shop-orange hover:underline"
                  >
                    WhatsApp
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Client introuvable.</p>
            )}
          </section>

          {peutGenererCode && (
            <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-3">
              <h2 className="text-sm font-bold text-foreground">Livraison au client</h2>
              <CodeLivraisonButton orderId={order.id} />
            </section>
          )}

          {isAdmin && (
            <section className="border border-border rounded-2xl bg-card p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Remise</h2>
              <RemiseForm orderId={order.id} remise={Number(order.remise)} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}