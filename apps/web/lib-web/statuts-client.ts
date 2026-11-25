export const STATUT_CLIENT: Record<string, { label: string; style: string }> = {
  en_attente: { label: 'Commande reçue', style: 'bg-amber-500/10 text-amber-600' },
  payée: { label: 'Payée', style: 'bg-blue-500/10 text-blue-600' },
  expédiée: { label: 'En livraison', style: 'bg-indigo-500/10 text-indigo-600' },
  livrée: { label: 'Colis remis', style: 'bg-green-500/10 text-green-600' },
  confirmée: { label: 'Vente confirmée', style: 'bg-green-500/10 text-green-700' },
  terminée: { label: 'Terminée', style: 'bg-green-500/10 text-green-700' },
  annulée: { label: 'Annulée', style: 'bg-red-500/10 text-red-600' },
  remboursée: { label: 'Remboursée', style: 'bg-amber-500/10 text-amber-700' },
};

export function statutClient(statut: string) {
  return STATUT_CLIENT[statut] ?? { label: statut, style: 'bg-muted text-foreground' };
}