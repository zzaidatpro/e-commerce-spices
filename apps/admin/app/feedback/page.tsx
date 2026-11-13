import { requireRole } from '@/actions/helper';
import { markFeedbackReadAction } from '@/actions/actionFeedback';
import FeedbackForm from '@/components/molecules/FeedbackForm';

export default async function FeedbackPage() {
  const auth = await requireRole(['admin', 'manager']);
  const isAdmin = auth.role === 'admin';

  const { data: feedbacks } = await auth.supabase
    .from('feedbacks')
    .select('id, subject, message, status, created_at, from:from_profile_id(nom, prenom, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <h1 className="text-xl font-bold text-foreground">
        {isAdmin ? 'Feedbacks reçus' : 'Envoyer un feedback à l\'administrateur'}
      </h1>

      {!isAdmin && <FeedbackForm />}

      <ul className="flex flex-col gap-3">
        {feedbacks?.map((f) => (
          <li key={f.id} className="border border-border rounded-xl bg-card p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{f.subject}</span>
              {isAdmin && f.status === 'new' && (
                <form
                  action={async () => {
                    'use server';
                    await markFeedbackReadAction(f.id);
                  }}
                >
                  <button type="submit" className="text-shop-orange hover:underline">
                    Marquer comme lu
                  </button>
                </form>
              )}
            </div>
            {isAdmin && (
              <div className="text-[10px] text-muted-foreground mt-1">
                {f.from?.prenom} {f.from?.nom} · {f.from?.email}
              </div>
            )}
            <p className="mt-2 text-muted-foreground whitespace-pre-line">{f.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}