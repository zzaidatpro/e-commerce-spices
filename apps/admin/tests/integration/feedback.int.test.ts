import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL!;
const ANON = process.env.SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PWD = 'Test-1234-secure';

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const suffixe = Date.now().toString(36);
const crees: string[] = [];

async function creer(role: string) {
  const email = `${role}-fb-${suffixe}-${crees.length}@test.local`;
  const { data, error } = await admin.auth.admin.createUser({ email, password: PWD, email_confirm: true });
  if (error) throw error;
  crees.push(data.user.id);
  await admin.from('profiles').upsert({ id: data.user.id, email, nom: 'Test', prenom: role, role, status: 'approved' });
  return { id: data.user.id, email };
}

async function connecte(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PWD });
  if (error) throw error;
  return c;
}

describe('feedback client', () => {
  let clientS: SupabaseClient;
  let managerS: SupabaseClient;
  let feedbackId: string;

  beforeAll(async () => {
    const client = await creer('client');
    const manager = await creer('manager');
    clientS = await connecte(client.email);
    managerS = await connecte(manager.email);
  });

  afterAll(async () => {
    for (const id of crees) await admin.auth.admin.deleteUser(id);
  });

  it('le client envoie un message', async () => {
    const { data, error } = await clientS.rpc('envoyer_feedback_client', {
      p_sujet: 'Livraison', p_message: 'Le colis est arrivé en bon état, merci.',
    });
    expect(error, error?.message).toBeNull();
    feedbackId = data as string;
  });

  it('le manager voit le message client', async () => {
    const { data } = await managerS.from('feedbacks').select('id').eq('id', feedbackId);
    expect(data ?? []).toHaveLength(1);
  });

  it('le manager ne peut pas insérer un message client directement', async () => {
    const { error } = await managerS.from('feedbacks').insert({
      from_profile_id: (await managerS.auth.getUser()).data.user!.id,
      subject: 'Triche', message: 'Insertion directe', categorie: 'client',
    });
    expect(error).not.toBeNull();
  });

  it('le manager répond, le client voit la réponse et l’accuse', async () => {
    const r = await managerS.rpc('repondre_feedback', { p_id: feedbackId, p_reponse: 'Merci pour votre retour !' });
    expect(r.error, r.error?.message).toBeNull();

    const { data } = await clientS.from('feedbacks').select('reponse, reponse_lue_at').eq('id', feedbackId).single();
    expect(data!.reponse).toBe('Merci pour votre retour !');
    expect(data!.reponse_lue_at).toBeNull();

    const lu = await clientS.rpc('marquer_reponse_lue', { p_id: feedbackId });
    expect(lu.error, lu.error?.message).toBeNull();
  });

  it('le client ne peut pas répondre à un message', async () => {
    const { error } = await clientS.rpc('repondre_feedback', { p_id: feedbackId, p_reponse: 'Réponse non autorisée' });
    expect(error).not.toBeNull();
  });

  it('un autre client ne voit pas le message', async () => {
    const autre = await creer('client');
    const autreS = await connecte(autre.email);
    const { data } = await autreS.from('feedbacks').select('id').eq('id', feedbackId);
    expect(data ?? []).toHaveLength(0);
  });
  it('notifications : le staff est prévenu d’un message client, le client d’une réponse', async () => {
  const client = await creer('client');
  const manager = await creer('manager');
  const cS = await connecte(client.email);
  const mS = await connecte(manager.email);

  const { data: fbId } = await cS.rpc('envoyer_feedback_client', {
    p_sujet: 'Notification', p_message: 'Message pour tester les notifications.',
  });

  const { data: notifManager } = await admin
    .from('notifications').select('type').eq('destinataire_id', manager.id);
  expect((notifManager ?? []).map((n) => n.type)).toContain('message_client');

  const { data: notifClientAvant } = await admin
    .from('notifications').select('id').eq('destinataire_id', client.id);
  expect(notifClientAvant ?? []).toHaveLength(0);

  await mS.rpc('repondre_feedback', { p_id: fbId as string, p_reponse: 'Bien reçu, merci.' });

  const { data: notifClientApres } = await admin
    .from('notifications').select('type').eq('destinataire_id', client.id);
  expect((notifClientApres ?? []).map((n) => n.type)).toContain('reponse_client');
});

it('notifications : un utilisateur ne lit que les siennes et ne peut pas les écrire', async () => {
  const a = await creer('client');
  const b = await creer('client');
  const aS = await connecte(a.email);
  const bS = await connecte(b.email);

  await admin.from('notifications').insert({
    destinataire_id: a.id, type: 'message_client', titre: 'Test',
  });

  const { data: vuB } = await bS.from('notifications').select('id').eq('destinataire_id', a.id);
  expect(vuB ?? []).toHaveLength(0);

  const { error } = await aS.from('notifications').insert({
    destinataire_id: a.id, type: 'message_client', titre: 'Injection',
  });
  expect(error).not.toBeNull();
});

});