import { requireRole } from '@/actions/helper';
import { createClient } from '@repo/database/server';
import { CreerCompteStaffForm } from '@/components/molecules/CreerCompteStaffForm';

export default async function ManagersPage() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, nom, prenom, email, role, status')
    .in('role', ['manager', 'livreur'])
    .order('nom', { ascending: true });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold text-foreground">Managers et livreurs</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Créer un compte</h2>
        <CreerCompteStaffForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Comptes existants</h2>
        <ul className="divide-y divide-border border border-border rounded-xl bg-card">
          {staff?.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-3 text-xs">
              <span>
                {p.prenom} {p.nom} · {p.email}
              </span>
              <span className="capitalize text-muted-foreground">
                {p.role} · {p.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}