import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';
import Sidebar from '@/components/molecules/Sidebar';
import LogoutButton from '@/components/atoms/LogoutButton';
import { NotificationBell } from '@/components/molecules/NotificationBell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (
    !profile ||
    profile.status !== 'approved' ||
    (profile.role !== 'admin' && profile.role !== 'manager')
  ) {
    redirect('/unauthorized');
  }

  const role = profile.role as 'admin' | 'manager';

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground mb-6 px-3">
            {role === 'admin' ? 'Espace Administrateur' : 'Espace Manager'}
          </h2>
          <Sidebar role={role} />
        </div>
        <div className="pt-4 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-background overflow-y-auto">
        <header className="flex justify-end items-center gap-2 p-4 border-b border-border">
          <NotificationBell />
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}