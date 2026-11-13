'use client';

import React, { useRef, useState, useTransition } from 'react';
import { sendFeedbackAction } from '@/actions/actionFeedback';

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await sendFeedbackAction(formData);
      if (res?.error) setError(res.error);
      if (res?.success) {
        setSuccess(true);
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border rounded-xl bg-card p-4">
      {error && <div className="p-2 text-xs text-destructive">{error}</div>}
      {success && <div className="p-2 text-xs text-green-600">Feedback envoyé.</div>}
      <input name="subject" required placeholder="Sujet" className="px-3 py-2 border border-border rounded-lg bg-background text-xs" />
      <textarea name="message" required rows={4} placeholder="Votre message" className="px-3 py-2 border border-border rounded-lg bg-background text-xs" />
      <button type="submit" disabled={isPending} className="self-end px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-lg disabled:opacity-50">
        {isPending ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}