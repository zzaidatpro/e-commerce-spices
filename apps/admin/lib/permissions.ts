export const ROLES = ['client', 'livreur', 'manager', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES = ['admin', 'manager'] as const;

export const STATUTS_UTILISATEUR = ['pending', 'approved', 'blocked'] as const;
export type StatutUtilisateur = (typeof STATUTS_UTILISATEUR)[number];

export const STATUTS_COMMANDE = ['pending', 'approved', 'shipped', 'delivered', 'cancelled'] as const;
export type StatutCommande = (typeof STATUTS_COMMANDE)[number];

export const TRANSITIONS: Record<StatutCommande, readonly StatutCommande[]> = {
  pending: ['approved', 'cancelled'],
  approved: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};