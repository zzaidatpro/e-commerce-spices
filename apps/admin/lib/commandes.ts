export const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  payée: 'Payée',
  expédiée: 'Expédiée',
  livrée: 'Livrée',
  annulée: 'Annulée',
};

export const STATUTS_STAFF = ['en_attente', 'payée', 'expédiée', 'annulée'] as const;
export type StatutStaff = (typeof STATUTS_STAFF)[number];