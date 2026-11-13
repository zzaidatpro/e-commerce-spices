import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';
import DashboardForm from './dashboard-form';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nom, prenom, email, telephone, whatsapp, date_naissance, role, status')
    .eq('id', user.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, created_at, total, statut, adresse_liv_id')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <DashboardForm
      initialProfile={profile ?? {}}
      initialOrders={orders ?? []}
    />
  );
}