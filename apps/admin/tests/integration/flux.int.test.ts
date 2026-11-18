import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL!;
const ANON = process.env.SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PWD = 'Test-1234-secure';

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const suffixe = Date.now().toString(36);
const crees: string[] = [];

async function creer(role: string, status = 'approved') {
  const email = `${role}-${suffixe}-${crees.length}@test.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PWD,
    email_confirm: true,
    user_metadata: { nom: 'Test', prenom: role },
  });
  if (error) throw error;
  crees.push(data.user.id);

  const { error: errProfil } = await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    nom: 'Test',
    prenom: role,
    role,
    status,
  });
  if (errProfil) throw errProfil;

  return { id: data.user.id, email };
}

async function connecte(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PWD });
  if (error) throw error;
  return c;
}

describe('flux de vente, sessions réelles', () => {
  let client: { id: string; email: string };
  let livreur: { id: string; email: string };
  let autreLivreur: { id: string; email: string };
  let cSession: SupabaseClient;
  let lSession: SupabaseClient;
  let mSession: SupabaseClient;
  let commandeId: string;
  let codeLivraison: string;
  let codeLivreur: string;

  beforeAll(async () => {
    client = await creer('client');
    livreur = await creer('livreur');
    autreLivreur = await creer('livreur');
    const manager = await creer('manager');

    cSession = await connecte(client.email);
    lSession = await connecte(livreur.email);
    mSession = await connecte(manager.email);

    const { data, error } = await admin
      .from('orders')
      .insert({ client_id: client.id, statut: 'payée', total: 1000 })
      .select('id')
      .single();
    if (error) throw error;
    commandeId = data.id;

    const { data: p } = await admin.from('profiles').select('code_livreur').eq('id', livreur.id).single();
    codeLivreur = p!.code_livreur!;
  });

  afterAll(async () => {
    for (const id of crees) await admin.auth.admin.deleteUser(id);
  });

  it('le client ne peut pas modifier le statut de sa commande', async () => {
    const { data, error } = await cSession
      .from('orders').update({ statut: 'annulée' }).eq('id', commandeId).select();
    expect(error ? [] : (data ?? [])).toHaveLength(0);
  });

  it('un livreur non approuvé ne peut pas être désigné', async () => {
    const pending = await creer('livreur', 'pending');
    const { error } = await mSession.rpc('designer_livreur', {
      p_order: commandeId, p_livreur: pending.id,
    });
    expect(error).not.toBeNull();
  });

  it('désignation, code, envoi et expédition', async () => {
    let r = await mSession.rpc('designer_livreur', { p_order: commandeId, p_livreur: livreur.id });
    expect(r.error).toBeNull();

    r = await mSession.rpc('generer_code_livraison', { p_order: commandeId });
    expect(r.error).toBeNull();
    codeLivraison = r.data as string;
    expect(codeLivraison).toMatch(/^\d{6}$/);

    expect((await mSession.rpc('marquer_code_envoye', { p_order: commandeId })).error).toBeNull();
    expect((await mSession.rpc('expedier_commande', {
      p_order: commandeId, p_livreur: livreur.id,
    })).error).toBeNull();
  });

  it('seul le livreur assigné voit la commande', async () => {
    const autre = await connecte(autreLivreur.email);
    const { data: vu } = await autre.from('orders').select('id').eq('id', commandeId);
    expect(vu ?? []).toHaveLength(0);

    const { data: assigne } = await lSession.from('orders').select('id').eq('id', commandeId);
    expect(assigne).toHaveLength(1);
  });

  it('la remise : mauvais code refusé, bon code accepté', async () => {
    const mauvais = await cSession.rpc('confirmer_livraison', { p_order: commandeId, p_code: '999999' });
    expect((mauvais.data as { ok: boolean }).ok).toBe(codeLivraison === '999999');

    const bon = await cSession.rpc('confirmer_livraison', { p_order: commandeId, p_code: codeLivraison });
    expect((bon.data as { ok: boolean }).ok).toBe(true);
  });

  it('l’encaissement : montant faux refusé, bon montant confirme la vente', async () => {
    let e = await mSession.rpc('enregistrer_encaissement', {
      p_order: commandeId, p_code_livreur: codeLivreur, p_montant: 999,
    });
    expect(e.error?.message).toMatch(/Montant incorrect/);

    e = await mSession.rpc('enregistrer_encaissement', {
      p_order: commandeId, p_code_livreur: codeLivreur, p_montant: 1000,
    });
    expect(e.error).toBeNull();

    const { data } = await admin.from('orders')
      .select('statut, vente_confirmee_at').eq('id', commandeId).single();
    expect(data!.statut).toBe('confirmée');
    expect(data!.vente_confirmee_at).not.toBeNull();
  });

  it('un client ne peut pas lister les livreurs', async () => {
    const { error } = await cSession.rpc('liste_livreurs');
    expect(error).not.toBeNull();
  });

  it('un visiteur anonyme ne peut pas générer de codes promo', async () => {
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error } = await anon.rpc('generer_codes_promo');
    expect(error).not.toBeNull();
  });
});