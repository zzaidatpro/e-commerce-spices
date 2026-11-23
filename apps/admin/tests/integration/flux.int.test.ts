import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL!;
const ANON = process.env.SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PWD = 'Test-1234-secure';

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const suffixe = Date.now().toString(36);
const crees: string[] = [];

type Compte = { id: string; email: string };

async function creer(role: string, status = 'approved'): Promise<Compte> {
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

const ok = (data: unknown) => (data as { ok: boolean }).ok;

describe('flux de vente, sessions réelles', () => {
  let client: Compte;
  let managerS: SupabaseClient;
  let clientS: SupabaseClient;

  beforeAll(async () => {
    client = await creer('client');
    const manager = await creer('manager');
    clientS = await connecte(client.email);
    managerS = await connecte(manager.email);
  });

  afterAll(async () => {
    for (const id of crees) await admin.auth.admin.deleteUser(id);
  });

  async function nouvelleCommande(total = 1000): Promise<string> {
    const { data, error } = await admin
      .from('orders')
      .insert({ client_id: client.id, statut: 'payée', total })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  // Désignée, code envoyé, validé, acceptée et démarrée
  async function commandeExpediee(total = 1000) {
    const id = await nouvelleCommande(total);
    const livreur = await creer('livreur');
    const livreurS = await connecte(livreur.email);

    const d = await managerS.rpc('designer_livreur', { p_order: id, p_livreur: livreur.id });
    if (d.error) throw d.error;
    const code = d.data as string;

    const envoi = await managerS.rpc('marquer_code_envoye', { p_order: id });
    if (envoi.error) throw envoi.error;

    const recu = await livreurS.rpc('valider_code_reception', { p_order: id, p_code: code });
    if (!ok(recu.data)) throw new Error((recu.data as { message: string }).message);

    const acc = await livreurS.rpc('accepter_livraison', { p_order: id });
    if (acc.error) throw acc.error;

    const dem = await livreurS.rpc('demarrer_livraison', { p_order: id });
    if (dem.error) throw dem.error;

    return { id, code, livreur, livreurS };
  }

  // Expédiée, puis remise confirmée par le client
  async function commandeLivree(total = 1000) {
    const c = await commandeExpediee(total);
    const r = await clientS.rpc('confirmer_livraison', { p_order: c.id, p_code: c.code });
    if (!ok(r.data)) throw new Error((r.data as { message: string }).message);
    return c;
  }

  it('le client ne peut pas modifier le statut de sa commande', async () => {
    const id = await nouvelleCommande();
    const { data, error } = await clientS.from('orders').update({ statut: 'annulée' }).eq('id', id).select();
    expect(error ? [] : (data ?? [])).toHaveLength(0);
  });

  it('un livreur non approuvé ne peut pas être désigné', async () => {
    const id = await nouvelleCommande();
    const pending = await creer('livreur', 'pending');
    const { error } = await managerS.rpc('designer_livreur', { p_order: id, p_livreur: pending.id });
    expect(error).not.toBeNull();
  });

  it('seul le livreur assigné voit la commande en cours', async () => {
    const c = await commandeExpediee();
    const autre = await creer('livreur');
    const autreS = await connecte(autre.email);

    const { data: vuAutre } = await autreS.from('orders').select('id').eq('id', c.id);
    expect(vuAutre ?? []).toHaveLength(0);

    const { data: vuAssigne } = await c.livreurS.from('orders').select('id').eq('id', c.id);
    expect(vuAssigne ?? []).toHaveLength(1);
  });

  it('désignation, code, réception, acceptation, démarrage : chaque étape réussit', async () => {
    const id = await nouvelleCommande();
    const livreur = await creer('livreur');
    const livreurS = await connecte(livreur.email);

    const d = await managerS.rpc('designer_livreur', { p_order: id, p_livreur: livreur.id });
    expect(d.error, d.error?.message).toBeNull();
    const code = d.data as string;
    expect(code).toMatch(/^\d{6}$/);

    const envoi = await managerS.rpc('marquer_code_envoye', { p_order: id });
    expect(envoi.error, envoi.error?.message).toBeNull();

    const recu = await livreurS.rpc('valider_code_reception', { p_order: id, p_code: code });
    expect(ok(recu.data), (recu.data as { message: string }).message).toBe(true);

    const acc = await livreurS.rpc('accepter_livraison', { p_order: id });
    expect(acc.error, acc.error?.message).toBeNull();

    const dem = await livreurS.rpc('demarrer_livraison', { p_order: id });
    expect(dem.error, dem.error?.message).toBeNull();
  });

  it('le manager ne peut pas poser la vente à la main', async () => {
    const c = await commandeExpediee();
    const { error } = await managerS.from('orders').update({ statut: 'confirmée' }).eq('id', c.id);
    expect(error).not.toBeNull();
  });

  it('remise : mauvais code refusé, bon code accepté', async () => {
    const c = await commandeExpediee();
    const faux = c.code === '000000' ? '111111' : '000000';

    const mauvais = await clientS.rpc('confirmer_livraison', { p_order: c.id, p_code: faux });
    expect(ok(mauvais.data)).toBe(false);

    const bon = await clientS.rpc('confirmer_livraison', { p_order: c.id, p_code: c.code });
    expect(ok(bon.data), (bon.data as { message: string }).message).toBe(true);
  });

  it('vente : montant déclaré par le livreur, puis confirmation du manager', async () => {
    const total = 1000;
    const c = await commandeLivree(total);

    const faux = await c.livreurS.rpc('declarer_remise', { p_order: c.id, p_montant: total - 1 });
    expect(faux.error).not.toBeNull();

    const juste = await c.livreurS.rpc('declarer_remise', { p_order: c.id, p_montant: total });
    expect(juste.error, juste.error?.message).toBeNull();

    const conf = await managerS.rpc('confirmer_vente', { p_order: c.id });
    expect(conf.error, conf.error?.message).toBeNull();

    const { data } = await admin
      .from('orders')
      .select('statut, vente_confirmee_at, terminee_at')
      .eq('id', c.id)
      .single();
    expect(data!.statut).toBe('confirmée');
    expect(data!.vente_confirmee_at).not.toBeNull();
    expect(data!.terminee_at).not.toBeNull();
  });

  it('refus puis désignation d’un autre livreur, historique tracé', async () => {
    const id = await nouvelleCommande();
    const a = await creer('livreur');
    const b = await creer('livreur');
    const aS = await connecte(a.email);

    expect((await managerS.rpc('designer_livreur', { p_order: id, p_livreur: a.id })).error).toBeNull();
    expect((await aS.rpc('refuser_livraison', { p_order: id, p_motif: 'Indisponible ce jour' })).error).toBeNull();

    const r = await managerS.rpc('designer_livreur', { p_order: id, p_livreur: b.id });
    expect(r.error, r.error?.message).toBeNull();
    expect(typeof r.data).toBe('string');

    const { data: hist } = await admin.from('livraisons_historique').select('evenement').eq('order_id', id);
    expect((hist ?? []).map((h) => h.evenement)).toEqual(expect.arrayContaining(['designe', 'refuse']));
  });

  it('réassignation : bloquée avant 1 h, possible après, ancien livreur exclu', async () => {
    const id = await nouvelleCommande();
    const a = await creer('livreur');
    const b = await creer('livreur');
    const c = await creer('livreur');
    const aS = await connecte(a.email);
    const cS = await connecte(c.email);

    expect((await managerS.rpc('designer_livreur', { p_order: id, p_livreur: a.id })).error).toBeNull();

    const trop = await managerS.rpc('reassigner_livreur', { p_order: id, p_nouveau: b.id, p_motif: 'Test délai' });
    expect(trop.error?.message).toMatch(/une heure/);

    // Service role : simule deux heures écoulées, le trigger ne s'applique pas
    await admin
      .from('orders')
      .update({ designe_at: new Date(Date.now() - 2 * 3600_000).toISOString() })
      .eq('id', id);

    const reas = await managerS.rpc('reassigner_livreur', { p_order: id, p_nouveau: c.id, p_motif: 'Pas de réponse' });
    expect(reas.error, reas.error?.message).toBeNull();
    const nouveauCode = reas.data as string;

    const ancien = await aS.rpc('valider_code_reception', { p_order: id, p_code: nouveauCode });
    expect(ok(ancien.data)).toBe(false);

    const nouveau = await cS.rpc('valider_code_reception', { p_order: id, p_code: nouveauCode });
    expect(ok(nouveau.data)).toBe(true);
  });

  it('un client ne peut pas lister les livreurs', async () => {
    const { error } = await clientS.rpc('liste_livreurs');
    expect(error).not.toBeNull();
  });

  it('un visiteur anonyme ne peut pas générer de codes promo', async () => {
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error } = await anon.rpc('generer_codes_promo');
    expect(error).not.toBeNull();
  });

  it('le livreur voit sa livraison dès la désignation, les autres non', async () => {
  const id = await nouvelleCommande();
  const assigne = await creer('livreur');
  const autre = await creer('livreur');
  const assigneS = await connecte(assigne.email);
  const autreS = await connecte(autre.email);

  expect((await managerS.rpc('designer_livreur', { p_order: id, p_livreur: assigne.id })).error).toBeNull();

  const { data: vuAssigne } = await assigneS.from('orders').select('id, statut').eq('id', id);
  expect(vuAssigne ?? []).toHaveLength(1);

  const { data: vuAutre } = await autreS.from('orders').select('id').eq('id', id);
  expect(vuAutre ?? []).toHaveLength(0);
});

it('historique livreur : seulement ses livraisons', async () => {
  const a = await creer('livreur');
  const aS = await connecte(a.email);
  const { error } = await aS.rpc('historique_livreur', { p_periode: 'mois' });
  expect(error).toBeNull();

  const { error: refus } = await clientS.rpc('historique_livreur', { p_periode: 'mois' });
  expect(refus).not.toBeNull();
});
it('demande de nouveau code : limite active, résolution et cooldown de 2h', async () => {
    const c = await commandeExpediee();

    // 1. Première demande valide par le client sur sa commande expédiée
    const d1 = await clientS.rpc('demander_nouveau_code', { p_order: c.id });
    expect(d1.error, d1.error?.message).toBeNull();
    expect(ok(d1.data), (d1.data as { message?: string }).message).toBe(true);

    const { data: ouvertes } = await admin
      .from('demandes_code')
      .select('id, demande_at, traitee_at')
      .eq('order_id', c.id)
      .is('traitee_at', null);
    expect(ouvertes ?? []).toHaveLength(1);

    // 2. Deuxième demande immédiate refusée (demande active déjà ouverte)
    const d2 = await clientS.rpc('demander_nouveau_code', { p_order: c.id });
    expect(d2.error, d2.error?.message).toBeNull();
    expect(ok(d2.data)).toBe(false);

    // 3. Le manager régénère le code -> marque la demande comme traitée (traitee_at renseigné)
    const gen = await managerS.rpc('generer_code_livraison', { p_order: c.id });
    expect(gen.error, gen.error?.message).toBeNull();

    const { data: apresTraitement } = await admin
      .from('demandes_code')
      .select('id, demande_at, traitee_at')
      .eq('order_id', c.id);
    expect(apresTraitement ?? []).toHaveLength(1);
    expect(apresTraitement![0].traitee_at).not.toBeNull();

    // 4. Nouvelle demande dans la fenêtre de cooldown de 2h -> refusée
    const d3 = await clientS.rpc('demander_nouveau_code', { p_order: c.id });
    expect(d3.error, d3.error?.message).toBeNull();
    expect(ok(d3.data)).toBe(false);

    // 5. Simulation de plus de 2h écoulées -> nouvelle demande acceptée
    await admin
      .from('demandes_code')
      .update({
        demande_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
        traitee_at: new Date(Date.now() - 2.5 * 3600_000).toISOString(),
      })
      .eq('id', apresTraitement![0].id);

    const d4 = await clientS.rpc('demander_nouveau_code', { p_order: c.id });
    expect(d4.error, d4.error?.message).toBeNull();
    expect(ok(d4.data), (d4.data as { message?: string }).message).toBe(true);
  });

  it('demande de nouveau code : refusée pour un autre client ou une commande non expédiée', async () => {
    const c = await commandeExpediee();
    const autreClient = await creer('client');
    const autreClientS = await connecte(autreClient.email);

    const interdit = await autreClientS.rpc('demander_nouveau_code', { p_order: c.id });
    expect(interdit.error, interdit.error?.message).toBeNull();
    expect(ok(interdit.data)).toBe(false);

    const idNonExpediee = await nouvelleCommande();
    const pasExpediee = await clientS.rpc('demander_nouveau_code', { p_order: idNonExpediee });
    expect(pasExpediee.error, pasExpediee.error?.message).toBeNull();
    expect(ok(pasExpediee.data)).toBe(false);
  });

});