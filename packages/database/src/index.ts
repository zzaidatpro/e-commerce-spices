// Clients Supabase
export { createClient as createBrowserSupabaseClient } from './client/browser';
export {createClient} from './client/browser'
export { createServerSupabaseClient as createServerSupabaseClient } from './client/server';

// Schémas Zod et utilitaires
export * from './schemas/profile.schema';
export * from './schemas/address.schema';
export * from './schemas/product.schema';
export * from './schemas/order.schema';
export { proxy } from './client/proxy';
export { updateSession } from './proxy';
export * from './types';
export type { Database } from './types/db.types';
