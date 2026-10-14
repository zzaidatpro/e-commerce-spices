// Types et raccourcis de base de données
export * from "./types";

// Clients Supabase
export { createClient as createBrowserSupabaseClient } from "./client/browser";
export { createClient as createServerSupabaseClient } from "./client/server";

// Schémas Zod et utilitaires
export * from "./schemas/profile.schema";
export * from "./schemas/address.schema";
export * from "./schemas/product.schema";
export * from "./schemas/order.schema";