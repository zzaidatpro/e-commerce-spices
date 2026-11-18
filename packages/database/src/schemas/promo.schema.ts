import { z } from 'zod';
import { Tables } from '../types/db.types';

export const promoCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^TP[A-Z2-9]{6}$/),
  profile_id: z.string().uuid(),
  pourcentage: z.number().positive().max(100),
  created_at: z.string(),
  expires_at: z.string(),
  used_at: z.string().nullable(),
  order_id: z.string().uuid().nullable(),
}) satisfies z.ZodType<Tables<'promo_codes'>>;