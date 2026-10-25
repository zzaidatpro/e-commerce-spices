// Clients Supabase
export { createClient } from './client/server';

// Schémas Zod et utilitaires
export * from './schemas/profile.schema';
export * from './schemas/address.schema';
export * from './schemas/product.schema';
export * from './schemas/order.schema';
export { updateSession } from './middleware';
export * from './types';
export type { Database } from './types/db.types';
export * from './epices/queries';
export * from './types/history';
export * from './types/catalog';
export * from './schemas/product.schema'
export * from './epices/home'
