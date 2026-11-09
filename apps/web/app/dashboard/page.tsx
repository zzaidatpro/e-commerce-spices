import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardForm from './dashboard-form';

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. 🔒 Sécurité : Vérification de l'authentification active
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Récupération sécurisée du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. 🔒 Sécurité : Récupération des commandes STRICTEMENT liées à l'utilisateur connecté (.eq('user_id', user.id))
  const { data: orders } = await supabase
    .from('orders')
    .select('id, slug, created_at, total_amount, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5); // Optionnel : limiter aux 5 dernières pour le tableau de bord

  return (
    <DashboardForm 
      initialProfile={profile || {}} 
      initialOrders={orders || []} 
    />
  );
}