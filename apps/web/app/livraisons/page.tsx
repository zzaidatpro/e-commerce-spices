import { redirect } from 'next/navigation';
import { Phone, MapPin, Wallet, Truck } from 'lucide-react';
import { createClient } from '@repo/database/server';
import { CoordonneesLivreurForm } from '@/components/molecules/CoordonneesLivreurForm';

type Adresse = { adresse_complete: string; type_lieu: string; url_google_maps: string | null };
type Ligne = { quantite: number; produits: { nom: string } | { nom: string }[] | null };
type Commande = {
  id: string;
  total: number | string;
  expediee_at: string | null;
  adresses_livraison: Adresse | Adresse[] | null;
  order_items: Ligne[];
};
type Contact = { nom: string | null; prenom: string | null; telephone: string | null };

const euros = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;
const nomProduit = (p: Ligne['produits']) => (Array.isArray(p) ? p[0]?.nom : p?.nom) ?? 'Produit';

export default async function LivraisonsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: moi } = await supabase
    .from('profiles')
    .select('prenom, nom, telephone, whatsapp, code_livreur, role')
    .eq('id', user.id)
    .single();

  if (moi?.role !== 'livreur') redirect('/unauthorized');

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, total, expediee_at, adresses_livraison:adresse_liv_id (adresse_complete, type_lieu, url_google_maps), order_items (quantite, produits (nom))'
    )
    .eq('livreur_id', user.id)
    .eq('statut', 'expédiée')
    .order('expediee_at', { ascending: true });

  if (error) {
    return <p className="p-6 text-xs text-destructive">Erreur : {error.message}</p>;
  }

  const commandes = (data ?? []) as Commande[];

  const contacts = await Promise.all(
    commandes.map((c) => supabase.rpc('contact_livraison', { p_order: c.id }))
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {moi?.prenom} {moi?.nom}
        </p>
        <p className="text-xs text-muted-foreground">Votre code livreur (à donner au manager à la remise de l'argent)</p>
        <p className="text-3xl font-mono font-bold tracking-widest text-foreground">{moi?.code_livreur ?? '—'}</p>
      </div>
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Truck className="w-5 h-5 text-shop-orange" />
        Mes livraisons en cours ({commandes.length})
      </h1>

      {commandes.length === 0 && (
        <p className="text-xs text-muted-foreground">Aucune livraison en cours.</p>
      )}

      {commandes.map((c, i) => {
        const adresse = Array.isArray(c.adresses_livraison) ? c.adresses_livraison[0] : c.adresses_livraison;
        const contact = (contacts[i]?.data?.[0] ?? null) as Contact | null;
        const tel = contact?.telephone ?? null;

        return (
          <article key={c.id} className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-foreground">#{c.id.slice(0, 8)}</span>
              <span className="text-muted-foreground">
                {c.expediee_at ? new Date(c.expediee_at).toLocaleString('fr-FR') : ''}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="w-4 h-4 text-shop-orange" />
                {adresse?.adresse_complete ?? 'Adresse non renseignée'}
              </p>
              {adresse?.type_lieu && <p className="text-muted-foreground capitalize">Lieu : {adresse.type_lieu}</p>}
              {adresse?.url_google_maps && (
                <a href={adresse.url_google_maps} target="_blank" rel="noopener noreferrer" className="text-shop-orange hover:underline">
                  Ouvrir dans Google Maps
                </a>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">
                {contact ? `${contact.prenom ?? ''} ${contact.nom ?? ''}`.trim() : 'Client'}
              </p>
              {tel && (
                <a href={`tel:${tel}`} className="flex items-center gap-2 text-shop-orange hover:underline">
                  <Phone className="w-4 h-4" />
                  {tel}
                </a>
              )}
            </div>

            <ul className="divide-y divide-border">
              {c.order_items.map((l, j) => (
                <li key={j} className="py-2 flex justify-between">
                  <span>
                    {nomProduit(l.produits)} × {l.quantite}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                À remettre au manager après encaissement
              </span>
              <span className="font-bold text-shop-orange">{euros(Number(c.total))}</span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Remettez le code de livraison (reçu par WhatsApp) au client. C'est lui qui le saisit sur son espace
              pour confirmer la remise.
            </p>
          </article>
          
        );
      })}
      <div>
        <CoordonneesLivreurForm
            nom={moi?.nom ?? null}
            prenom={moi?.prenom ?? null}
            telephone={moi?.telephone ?? null}
            whatsapp={moi?.whatsapp ?? null}
        />
      </div>
    </div>
    
  );
  
}