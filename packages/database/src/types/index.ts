export * from "./db.types";
import { Database } from "./db.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

  

export { createClient as createBrowserSupabaseClient } from "../client/browser";
export { createClient as createServerSupabaseClient } from "../client/server";

// Schémas Zod
export * from "../schemas/product.schema";
export * from ".";
