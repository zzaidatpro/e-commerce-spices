'use client';

import { useEffect } from 'react';
import { createUserClient } from '@repo/database/client';

export function SessionWatcher() {
  useEffect(() => {
    const supabase = createUserClient();

    const allerALaConnexion = () => {
      window.location.replace('/');
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') allerALaConnexion();
    });

    const verifier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) allerALaConnexion();
    };

    const surVisibilite = () => {
      if (document.visibilityState === 'visible') verifier();
    };

    window.addEventListener('focus', verifier);
    document.addEventListener('visibilitychange', surVisibilite);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', verifier);
      document.removeEventListener('visibilitychange', surVisibilite);
    };
  }, []);

  return null;
}