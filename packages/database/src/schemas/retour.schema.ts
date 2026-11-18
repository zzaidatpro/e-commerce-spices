import { z } from 'zod';
import { Tables } from '../types/db.types';

export const statutRetourSchema = z.enum(['demande', 'accepte', 'refuse', 'rembourse']);

export const retourSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  statut: statutRetourSchema,
  motif: z.string().min(5).max(500),
  demande_par: z.string().uuid().nullable(),
  demande_at: z.string(),
  decide_par: z.string().uuid().nullable(),
  decide_at: z.string().nullable(),
  montant_rembourse: z.number().nonnegative().nullable(),
  reference_paiement: z.string().nullable(),
  stock_remis: z.boolean(),
  rembourse_at: z.string().nullable(),
}) satisfies z.ZodType<Tables<'retours'>>;

// Demande saisie par le staff : seuls les champs de saisie sont validés
export const demandeRetourSchema = z.object({
  order_id: z.string().uuid(),
  motif: z.string().trim().min(5, 'Motif trop court').max(500),
});

export const remboursementSchema = z.object({
  retour_id: z.string().uuid(),
  montant: z.number().nonnegative(),
  reference: z.string().trim().min(1, 'Référence obligatoire'),
  stock_remis: z.boolean(),
});