import { createClient } from '@supabase/supabase-js';
import { ecrireComptes, type Comptes } from './comptes-store';
import path from 'node:path';
import { config as charger } from 'dotenv';

charger({ path: path.resolve(__dirname, '..', 'apps', 'admin', '.env.test'), override: true });
const PWD = 'Test-1234-secure';
const ROLES = ['client', 'manager', 'livreur'] as const;

export default async function globalSetup() {
  const url = process.env.SUPABASE_URL ?? '';
  if (!/127\.0\.0\.1|localhost/.test(url)) {
    throw new Error('e2e refusé : SUPABASE_URL doit pointer sur la base locale.');
  }

  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const comptes = {} as Comptes;

  for (const role of ROLES) {
    const email = `e2e-${role}@test.local`;

    const cree = await admin.auth.admin.createUser({ email, password: PWD, email_confirm: true });
    let id = cree.data.user?.id;

    if (!id) {
      const { data: liste, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      const existant = liste.users.find((u) => u.email === email);
      if (!existant) throw new Error(`Compte introuvable : ${email}`);
      id = existant.id;
      await admin.auth.admin.updateUserById(id, { password: PWD });
    }

    const { error: errProfil } = await admin.from('profiles').upsert({
      id,
      email,
      nom: 'E2E',
      prenom: role === 'client' ? 'Client' : role === 'manager' ? 'Manager' : 'Livreur',
      role,
      status: 'approved',
    });
    if (errProfil) throw errProfil;

    comptes[role] = { id, email };
  }
  
  ecrireComptes(comptes);
 
}