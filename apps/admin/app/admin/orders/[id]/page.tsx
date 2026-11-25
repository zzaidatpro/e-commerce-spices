import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/actions/helper";
import { STATUT_LABELS } from "@/lib-admin/commandes";
import { versWhatsapp } from "@/lib-admin/whatsapp";
import { RemiseForm } from "@/components/molecules/OrderActions";
import { ConfirmerVenteButton } from "@/components/molecules/ConfirmerVenteButton";
import {
  LivreurForm,
  CodeLivraisonPanel,
  ActionStatutButton,
  type Livreur,
  type EtatCode,
} from "@/components/molecules/WorkflowLivraison";

type Ligne = {
  id: string;
  quantite: number;
  prix_facture: number;
  produits: { nom: string } | { nom: string }[] | null;
};

type Contact = {
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
} | null;

type Commande = {
  id: string;
  created_at: string;
  total: number | string;
  remise: number | string;
  statut: string;
  adresse_liv_id: string | null;
  livreur_id: string | null;
  designe_at: string | null;
  code_envoye_at: string | null;
  code_recu_at: string | null;
  acceptee_at: string | null;
  expediee_at: string | null;
  remise_at: string | null;
  montant_declare: number | string | null;
  vente_confirmee_at: string | null;
  terminee_at: string | null;
};

const euros = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA`;
const date = (d: string) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireRole(["admin", "manager"]);
  const sb = auth.supabase;
  const isAdmin = auth.role === "admin";

  const { data: row, error } = await sb
    .from("orders")
    .select(
      `
      id, created_at, total, remise, statut, adresse_liv_id, livreur_id,
      designe_at, code_envoye_at, code_recu_at, acceptee_at, expediee_at,
      remise_at, montant_declare, vente_confirmee_at, terminee_at
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return <p className="text-xs text-destructive">Erreur : {error.message}</p>;
  if (!row) notFound();

  const order = row as unknown as Commande;

  const [itemsRes, adresseRes, contactRes, livreursRes, etatRes, demandesRes] = await Promise.all([
    sb.from("order_items").select("id, quantite, prix_facture, produits(nom)").eq("order_id", id),
    order.adresse_liv_id
      ? sb.from("adresses_livraison").select("adresse_complete, type_lieu").eq("id", order.adresse_liv_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    sb.rpc("contact_client_commande", { p_order: id }),
    sb.rpc("liste_livreurs"),
    sb.rpc("etat_code_livraison", { p_order: id }),
    sb.from("demandes_code").select("id, demande_at").eq("order_id", id).is("traitee_at", null),
  ]);

  const items = (itemsRes.data ?? []) as Ligne[];
  const adresse = adresseRes.data as { adresse_complete: string; type_lieu: string } | null;
  const contact = (contactRes.data?.[0] ?? null) as Contact;
  const livreurs = (livreursRes.data ?? []) as Livreur[];
  const etat = (etatRes.data?.[0] ?? null) as EtatCode | null;
  const demandes = demandesRes.data ?? [];

  const statut = order.statut;
  const annulee = statut === "annulée";
  const ouvert = statut === "en_attente" || statut === "payée";
  const enCours = statut === "expédiée";
  const livree = statut === "livrée";
  const confirmee = statut === "confirmée" || statut === "remboursée";

  // Annulation : seulement avant acceptation du livreur
  const annulable = ouvert && !order.acceptee_at;

  const livreur = livreurs.find((l) => l.id === order.livreur_id) ?? null;
  const reference = order.id.slice(0, 8);
  const sousTotal = items.reduce((s, i) => s + Number(i.quantite) * Number(i.prix_facture), 0);
  const nomProduit = (p: Ligne["produits"]) => (Array.isArray(p) ? p[0]?.nom : p?.nom) ?? "Produit supprimé";
  const whatsappClient = versWhatsapp(contact?.whatsapp);

  const etapes = [
    { label: "Commande reçue", date: order.created_at },
    { label: "Livreur désigné", date: order.designe_at },
    { label: "Code envoyé", date: order.code_envoye_at },
    { label: "Code reçu par le livreur", date: order.code_recu_at },
    { label: "Livraison acceptée", date: order.acceptee_at },
    { label: "En livraison", date: order.expediee_at },
    { label: "Colis remis", date: order.remise_at },
    { label: "Vente confirmée", date: order.vente_confirmee_at },
    { label: "Opération terminée", date: order.terminee_at },
  ];

  const montantOk = order.montant_declare != null && Number(order.montant_declare) === Number(order.total);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
            ← Commandes
          </Link>
          <h1 className="text-xl font-bold text-foreground mt-1">Commande #{reference}</h1>
          <p className="text-xs text-muted-foreground">Passée le {date(order.created_at)}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
            annulee ? "bg-red-500/10 text-red-600" : "bg-muted text-foreground"
          }`}
        >
          {STATUT_LABELS[statut] ?? statut}
        </span>
      </div>

      {!annulee && (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] border border-border rounded-2xl bg-card p-4">
          {etapes.map((e, i) => (
            <li key={e.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground">•</span>}
              <span
                className={e.date ? "font-semibold text-foreground" : "text-muted-foreground"}
                title={e.date ? date(e.date) : "Non atteint"}
              >
                {e.label}
              </span>
            </li>
          ))}
        </ol>
      )}

      {annulee && <p className="text-xs font-semibold text-red-600">Cette commande a été annulée.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="border border-border rounded-2xl bg-card p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">Commande du client</h2>
            <div className="divide-y divide-border text-xs">
              {items.map((i) => (
                <div key={i.id} className="py-3 flex justify-between">
                  <span>
                    {nomProduit(i.produits)} × {i.quantite}
                  </span>
                  <span className="font-semibold">{euros(Number(i.quantite) * Number(i.prix_facture))}</span>
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
                <span>Total</span>
                <span className="text-shop-orange">{euros(Number(order.total))}</span>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4 text-xs">
            <h2 className="text-sm font-bold text-foreground">Livraison</h2>
            {adresse ? (
              <div>
                <p className="text-foreground">{adresse.adresse_complete}</p>
                <p className="text-muted-foreground capitalize">Lieu : {adresse.type_lieu}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune adresse liée à cette commande.</p>
            )}

            {ouvert && !order.livreur_id ? (
              <LivreurForm orderId={order.id} livreurs={livreurs} livreurId={null} />
            ) : (
              <p>
                Livreur :{" "}
                <span className="font-semibold">
                  {livreur ? `${livreur.prenom ?? ""} ${livreur.nom ?? ""}`.trim() : "—"}
                </span>
              </p>
            )}
          </section>

          {demandes.length > 0 && (ouvert || enCours) && (
            <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 text-xs flex flex-col gap-1">
              <p className="font-semibold text-foreground">Le client demande un nouveau code de livraison.</p>
              <p className="text-muted-foreground">
                Demande du {date(demandes[0].demande_at)}. Régénérez le code et transmettez-le au livreur.
              </p>
            </div>
          )}

          {ouvert && order.livreur_id && !order.acceptee_at && (
            <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-foreground">Code de livraison</h2>
              <CodeLivraisonPanel orderId={order.id} reference={reference} livreur={livreur} etat={etat} />
            </section>
          )}

          {enCours && (
            <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-2 text-xs">
              <h2 className="text-sm font-bold text-foreground">Livraison en cours</h2>
              <p className="text-muted-foreground">
                Le livreur a démarré la livraison. En attente de la remise au client et de la saisie du code sur son
                espace.
              </p>
              <p className="text-muted-foreground">
                Démarrée le {order.expediee_at ? date(order.expediee_at) : "—"}
                {etat?.expires_at && ` · code valable jusqu'au ${date(etat.expires_at)}`}.
              </p>
            </section>
          )}

          {livree && (
            <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-3 text-xs">
              <h2 className="text-sm font-bold text-foreground">Confirmation de la vente</h2>
              <p>Colis remis le {order.remise_at ? date(order.remise_at) : "—"}.</p>
              <p>Total dû : {euros(Number(order.total))}</p>
              <p>
                Montant déclaré par le livreur :{" "}
                {order.montant_declare != null ? euros(Number(order.montant_declare)) : "en attente"}
              </p>
              <ConfirmerVenteButton orderId={order.id} pret={montantOk} />
            </section>
          )}

          {confirmee && (
            <section className="border border-border rounded-2xl bg-card p-6 text-xs">
              <h2 className="text-sm font-bold text-foreground mb-2">Vente confirmée</h2>
              <p className="text-muted-foreground">
                Confirmée le {order.vente_confirmee_at ? date(order.vente_confirmee_at) : "—"}. Le délai de retour de 7
                jours court à partir de cette date.
              </p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-2 text-xs">
            <h2 className="text-sm font-bold text-foreground">Client</h2>
            {contact ? (
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
                {whatsappClient && (
                  <a
                    href={`https://wa.me/${whatsappClient}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shop-orange hover:underline"
                  >
                    WhatsApp
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Coordonnées indisponibles.</p>
            )}
          </section>

          {isAdmin && !livree && !confirmee && !annulee && (
            <section className="border border-border rounded-2xl bg-card p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Remise</h2>
              <RemiseForm orderId={order.id} remise={Number(order.remise)} />
            </section>
          )}

          {(ouvert || annulable) && (
            <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-3">
              {statut === "en_attente" && (
                <ActionStatutButton orderId={order.id} statut="payée" libelle="Valider la commande" />
              )}
              {annulable && (
                <ActionStatutButton orderId={order.id} statut="annulée" libelle="Annuler la commande" danger />
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
