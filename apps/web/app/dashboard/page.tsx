import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';
import DashboardForm from './dashboard-form';
import { ConfirmerLivraisonForm } from '@/components/molecules/ConfirmerLivraisonForm';


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
  const { data: enCours } = await supabase
    .from('orders')
    .select('id, total, expediee_at')
    .eq('client_id', user.id)
    .eq('statut', 'expédiée')
    .order('expediee_at', { ascending: false });

  return (
  <>
    {(enCours ?? []).map((c) => (
      <div key={c.id} className="max-w-6xl mx-auto px-4 pt-8">
        <ConfirmerLivraisonForm orderId={c.id} reference={c.id.slice(0, 8)} />
      </div>
    ))}
    <DashboardForm
      initialProfile={profile ?? {}}
      initialOrders={orders ?? []}
    />
  </>
)}