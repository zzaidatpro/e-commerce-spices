'use client';

import React, { useTransition } from 'react';
import { logoutAdmin } from '@/actions/actionLogOut';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors w-full cursor-pointer disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      <span>{isPending ? 'Déconnexion...' : 'Se déconnecter'}</span>
    </button>
  );
}