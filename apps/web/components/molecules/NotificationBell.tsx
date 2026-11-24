'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, ShoppingBag, UserPlus, type LucideIcon } from 'lucide-react';
import { createUserClient } from '@repo/database/client';

type Notif = {
  id: string;
  type: string;
  titre: string;
  corps: string | null;
  lien: string | null;
  created_at: string;
  lu_at: string | null;
};

const ICONES: Record<string, LucideIcon> = {
  commande: ShoppingBag,
  nouveau_client: UserPlus,
};

const icone = (type: string): LucideIcon => ICONES[type] ?? MessageSquare;

const DUREE_TOAST_MS = 8000;

export function NotificationBell() {
  const [supabase] = useState(() => createUserClient());
  const [connecte, setConnecte] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [toasts, setToasts] = useState<Notif[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const canalRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let actif = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !actif) return;
      setConnecte(true);

      const { data } = await supabase
        .from('notifications')
        .select('id, type, titre, corps, lien, created_at, lu_at')
        .eq('destinataire_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (actif) setItems((data ?? []) as Notif[]);

      canalRef.current = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `destinataire_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as Notif;
            setItems((prev) => [n, ...prev].slice(0, 20));
            setToasts((prev) => [n, ...prev].slice(0, 3));
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== n.id));
            }, DUREE_TOAST_MS);
          }
        )
        .subscribe();
    })();

    return () => {
      actif = false;
      if (canalRef.current) supabase.removeChannel(canalRef.current);
    };
  }, [supabase]);

  const nonLues = items.filter((i) => !i.lu_at).length;

  const basculer = async () => {
    const nouvelEtat = !ouvert;
    setOuvert(nouvelEtat);
    if (nouvelEtat && nonLues > 0) {
      await supabase.rpc('marquer_toutes_notifications_lues');
      setItems((prev) => prev.map((i) => ({ ...i, lu_at: i.lu_at ?? new Date().toISOString() })));
    }
  };

  if (!connecte) return null;

  return (
    <>
      <div className="relative">
        <button
          type="button"
          data-testid="notif-bell"
          onClick={basculer}
          aria-label="Notifications"
          className="relative p-2 text-foreground hover:bg-secondary rounded-md transition-colors"
        >
          <Bell className="w-4 h-4" />
          {nonLues > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-shop-orange text-white text-[9px] font-bold flex items-center justify-center">
              {nonLues}
            </span>
          )}
        </button>

        {ouvert && (
          <div
            data-testid="notif-list"
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-xl shadow-2xl z-50"
          >
            {items.length === 0 && (
              <p className="p-4 text-xs text-muted-foreground">Aucune notification.</p>
            )}
            {items.map((n) => {
              const Icone = icone(n.type);
              const contenu = (
                <div className={`p-3 flex items-start gap-2 ${n.lu_at ? '' : 'bg-shop-orange/5'}`}>
                  <Icone className="w-4 h-4 mt-0.5 text-shop-orange shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground">{n.titre}</span>
                    {n.corps && <span className="text-[11px] text-muted-foreground truncate">{n.corps}</span>}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
              return n.lien ? (
                <Link
                  key={n.id}
                  href={n.lien}
                  onClick={() => setOuvert(false)}
                  className="block hover:bg-muted/50 border-b border-border/60"
                >
                  {contenu}
                </Link>
              ) : (
                <div key={n.id} className="border-b border-border/60">{contenu}</div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const Icone = icone(t.type);
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 w-72 p-3 bg-background border border-shop-orange/40 rounded-xl shadow-xl text-xs"
            >
              <Icone className="w-4 h-4 mt-0.5 text-shop-orange shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t.titre}</p>
                {t.corps && <p className="text-muted-foreground">{t.corps}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default NotificationBell;