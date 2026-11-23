import { requireRole } from '@/actions/helper';
import FeedbackForm from '@/components/molecules/FeedbackForm';
import { RepondreForm, MarquerLuButton } from '@/components/molecules/FeedbackActions';

type Ligne = {
  id: string;
  subject: string;
  message: string;
  status: string;
  categorie: 'interne' | 'client';
  created_at: string;
  reponse: string | null;
  reponse_at: string | null;
  reponse_lue_at: string | null;
  auteur_nom: string | null;
  auteur_prenom: string | null;
  auteur_email: string | null;
};

export default async function FeedbackPage() {
  const auth = await requireRole(['admin', 'manager']);
  const isAdmin = auth.role === 'admin';

  const { data, error } = await auth.supabase.rpc('liste_feedbacks');
  if (error) return <p className="text-xs text-destructive">Erreur : {error.message}</p>;

  const lignes = (data ?? []) as Ligne[];
  const clients = lignes.filter((f) => f.categorie === 'client');
  const internes = lignes.filter((f) => f.categorie === 'interne');

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground">
          Messages des clients{' '}
          {clients.some((f) => f.status === 'new') && <span className="text-shop-orange">(nouveaux)</span>}
        </h1>

        {clients.length === 0 && <p className="text-xs text-muted-foreground">Aucun message client.</p>}

        {clients.map((f) => (
          <article key={f.id} className="border border-border rounded-2xl bg-card p-5 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{f.subject}</span>
              <span className="text-muted-foreground">
                {new Date(f.created_at).toLocaleString('fr-FR')}
                {f.status === 'new' && <span className="ml-2 text-shop-orange font-bold">Nouveau</span>}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {`${f.auteur_prenom ?? ''} ${f.auteur_nom ?? ''}`.trim() || 'Client'} · {f.auteur_email ?? '—'}
            </p>
            <p className="whitespace-pre-line text-foreground">{f.message}</p>

            {f.reponse && (
              <p className="text-[11px] text-muted-foreground">
                Réponse envoyée le {new Date(f.reponse_at!).toLocaleString('fr-FR')}
                {f.reponse_lue_at ? ' · lue par le client' : ' · non lue par le client'}
              </p>
            )}

            <RepondreForm id={f.id} reponseActuelle={f.reponse} />
            {f.status === 'new' && <MarquerLuButton id={f.id} />}
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-foreground">Échanges internes</h2>
        {auth.role === 'manager' && <FeedbackForm />}
        {internes.map((f) => (
          <article key={f.id} className="border border-border rounded-xl bg-card p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{f.subject}</span>
              {isAdmin && f.status === 'new' && <MarquerLuButton id={f.id} />}
            </div>
            {isAdmin && (
              <div className="text-[10px] text-muted-foreground mt-1">
                {`${f.auteur_prenom ?? ''} ${f.auteur_nom ?? ''}`.trim()} · {f.auteur_email ?? '—'}
              </div>
            )}
            <p className="mt-2 text-muted-foreground whitespace-pre-line">{f.message}</p>
          </article>
        ))}
      </section>
    </div>
  );
}