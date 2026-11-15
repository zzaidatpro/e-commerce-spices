'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ShoppingBag, UserPlus } from 'lucide-react';
import { createUserClient } from '@repo/database/client';

type Notif = {
  id: string;
  type: 'commande' | 'client';
  titre: string;
  detail: string;
  href: string;
};

export default function NotificationCenter({ role }: { role: 'admin' | 'manager' }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [toasts, setToasts] = useState<Notif[]>([]);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    const supabase = createUserClient();

    const ajouter = (n: Notif) => {
      setNotifs((prev) => [n, ...prev].slice(0, 20));
      setToasts((prev) => [n, ...prev].slice(0, 3));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n.id));
      }, 8000);
    };

    const canal = supabase
      .channel(`notifs-${role}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const o = payload.new as { id: string; total: number };
          ajouter({
            id: `commande-${o.id}`,
            type: 'commande',
            titre: 'Nouvelle commande',
            detail: `${Number(o.total).toLocaleString('fr-FR')} DA`,
            href: '/admin/orders',
          });
        }
      );

    if (role === 'admin') {
      canal.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          const p = payload.new as { id: string; email: string | null };
          ajouter({
            id: `client-${p.id}`,
            type: 'client',
            titre: 'Nouveau compte',
            detail: p.email ?? 'Adresse inconnue',
            href: '/admin/clients',
          });
        }
      );
    }

    canal.subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [role]);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-foreground" />
          {notifs.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-shop-orange text-white text-[10px] font-bold rounded-full px-1.5">
              {notifs.length}
            </span>
          )}
        </button>

        {ouvert && (
          <div className="absolute right-0 mt-2 w-72 bg-background border border-border/80 rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1">
            {notifs.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground">Aucune notification.</p>
            ) : (
              <>
                {notifs.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOuvert(false)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted text-xs"
                  >
                    {n.type === 'commande' ? (
                      <ShoppingBag className="w-4 h-4 mt-0.5 text-shop-orange" />
                    ) : (
                      <UserPlus className="w-4 h-4 mt-0.5 text-shop-orange" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{n.titre}</p>
                      <p className="text-muted-foreground">{n.detail}</p>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setNotifs([])}
                  className="self-end text-[11px] text-muted-foreground hover:underline"
                >
                  Tout effacer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pop-up temporaire, en bas à droite */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className="flex items-start gap-3 w-72 p-3 bg-background border border-shop-orange/40 rounded-xl shadow-xl text-xs"
          >
            {t.type === 'commande' ? (
              <ShoppingBag className="w-4 h-4 mt-0.5 text-shop-orange" />
            ) : (
              <UserPlus className="w-4 h-4 mt-0.5 text-shop-orange" />
            )}
            <div>
              <p className="font-semibold text-foreground">{t.titre}</p>
              <p className="text-muted-foreground">{t.detail}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}