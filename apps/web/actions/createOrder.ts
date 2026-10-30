'use server';

import { createClient } from '@repo/database/server';
import { revalidatePath } from 'next/cache';

export interface CheckoutFormData {
  type_lieu: 'maison' | 'magasin' | 'depot';
  adresse_complete: string;
  url_google_maps?: string;
  items: Array<{
    produit_id: string;
    quantite: number;
    price: number;
  }>;
}

export async function createOrderAction(data: CheckoutFormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Vous devez être connecté pour passer une commande.');
  }

  const s_total = data.items.reduce((acc, item) => acc + item.price * item.quantite, 0);
  const frais_liv = s_total >= 5000 || s_total === 0 ? 0 : 400;
  const total = s_total + frais_liv;

  // adresses_livraison
  const { data: addressData, error: addressError } = await supabase
    .from('adresses_livraison')
    .insert({
      profile_id: user.id,
      type_lieu: data.type_lieu,
      adresse_complete: data.adresse_complete,
      url_google_maps: data.url_google_maps || null,
    })
    .select('id')
    .single();

  if (addressError || !addressData) {
    throw new Error(`Erreur lors de l'enregistrement de l'adresse : ${addressError?.message}`);
  }

  // Orders
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_id: user.id,
      adresse_liv_id: addressData.id,
      statut: 'en_attente', 
      total: total,
    })
    .select('id')
    .single();

  if (orderError || !orderData) {
    throw new Error(`Erreur lors de la création de la commande : ${orderError?.message}`);
  }

  // Order_items
  const orderItemsToInsert = data.items.map((item) => ({
    order_id: orderData.id,
    produit_id: item.produit_id,
    quantite: item.quantite,
    prix_facture: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (itemsError) {
    throw new Error(`Erreur lors de l'enregistrement des articles : ${itemsError.message}`);
  }

  revalidatePath('/dashboard');
  
  return {
    success: true,
    orderId: orderData.id,
  };
}