type Props = {
  statut: string;
  created_at: string;
  designe_at: string | null;
  acceptee_at: string | null;
  expediee_at: string | null;
  remise_at: string | null;
  vente_confirmee_at: string | null;
  terminee_at: string | null;
};

const date = (d: string | null) =>
  d ? new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

export function TimelineCommande(p: Props) {
  if (p.statut === 'annulée') {
    return <p className="text-xs font-semibold text-red-600">Cette commande a été annulée.</p>;
  }

  const etapes = [
    { label: 'Commande reçue', date: p.created_at },
    { label: 'Livreur désigné', date: p.designe_at },
    { label: 'Livraison acceptée', date: p.acceptee_at },
    { label: 'En cours de livraison', date: p.expediee_at },
    { label: 'Colis remis', date: p.remise_at },
    { label: 'Vente confirmée', date: p.vente_confirmee_at },
    { label: 'Opération terminée', date: p.terminee_at },
  ];

  return (
    <div className="flex flex-col gap-3">
      {p.statut === 'remboursée' && (
        <p className="text-xs font-semibold text-amber-600">Cette commande a été remboursée.</p>
      )}
      <ol className="flex flex-col gap-3">
        {etapes.map((e) => {
          const fait = e.date !== null;
          return (
            <li key={e.label} className="flex items-center gap-3 text-xs">
              <span
                className={`h-3 w-3 rounded-full ${fait ? 'bg-shop-orange' : 'bg-muted border border-border'}`}
              />
              <span className={fait ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{e.label}</span>
              {fait && <span className="ml-auto text-muted-foreground">{date(e.date)}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}