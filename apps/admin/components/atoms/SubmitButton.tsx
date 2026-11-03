'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isPending: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export default function SubmitButton({
  isPending,
  children,
  loadingText = 'Chargement...',
  className = 'w-full py-2.5 mt-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className={className}
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      <span>{isPending ? loadingText : children}</span>
    </button>
  );
}