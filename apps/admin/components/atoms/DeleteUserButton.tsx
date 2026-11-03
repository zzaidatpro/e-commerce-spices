'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteUserButtonProps {
  userId: string;
  deleteAction: (userId: string) => Promise<any>;
}

export function DeleteUserButton({ userId, deleteAction }: DeleteUserButtonProps) {
  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={() => deleteAction(userId)} onSubmit={handleDelete}>
      <button
        type="submit"
        className="inline-flex items-center p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer"
        title="Supprimer l'utilisateur"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}