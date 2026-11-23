'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { envoyerFeedbackAction, marquerReponseLueAction } from '@/actions/actionFeedbackClient';

export type MonFeedback = {
  id: string;
  subject: string;
  message: string;
  created_at: string;
  reponse: string | null;
  reponse_at: string | null;
  reponse_lue_at: string | null;
};

const champ =
  'w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange/50';

export function FeedbackClientSection({ feedbacks }: { feedbacks: MonFeedback[] }) {
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const envoyer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setMsg(null);
    startTransition(async () => {
      const r = await envoyerFeedbackAction(new FormData(form));
      setMsg({ ok: r.ok, texte: r.message });
      if (r.ok) form.reset();
    });
  };

  const lu = (id: string) =>
    startTransition(async () => {
      await marquerReponseLueAction(id);
    });

  return (
    <section className="flex flex-col gap-4 border border-border rounded-2xl bg-card p-6">
      <h2 className="text-sm font-bold text-foreground">Votre avis et vos questions</h2>

      <form onSubmit={envoyer} className="flex flex-col gap-3">
        <input name="sujet" required minLength={3} maxLength={150} placeholder="Sujet" className={champ} />
        <textarea name="message" required minLength={10} maxLength={2000} rows={3} placeholder="Votre message" className={champ} />
        <div className="flex items-center justify-between gap-3">
          {msg && (
            <p className={`text-xs ${msg.ok ? 'text-green-600' : 'text-destructive'}`}>{msg.texte}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="ml-auto px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {isPending ? '...' : 'Envoyer'}
          </button>
        </div>
      </form>

      {feedbacks.length > 0 && (
        <ul className="flex flex-col gap-3">
          {feedbacks.map((f) => (
            <li key={f.id} className="border border-border/60 rounded-xl p-4 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{f.subject}</span>
                <span className="text-muted-foreground">{new Date(f.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">{f.message}</p>

              {f.reponse && (
                <div className="mt-1 p-3 rounded-lg bg-shop-orange/5 border border-shop-orange/30 flex flex-col gap-1">
                  <span className="font-semibold text-shop-orange">
                    Réponse du {new Date(f.reponse_at!).toLocaleDateString('fr-FR')}
                  </span>
                  <p className="text-foreground whitespace-pre-line">{f.reponse}</p>
                  {!f.reponse_lue_at && (
                    <button
                      type="button"
                      onClick={() => lu(f.id)}
                      disabled={isPending}
                      className="self-start text-[11px] text-shop-orange hover:underline"
                    >
                      Marquer comme lue
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}