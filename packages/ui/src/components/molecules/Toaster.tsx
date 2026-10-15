'use client';

import React from 'react';
import { useToast } from "../../hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        // Styles dynamiques selon le type de notification
        const bgClasses = isError
          ? 'bg-red-50 border-red-200 text-red-900'
          : isSuccess
          ? 'bg-green-50 border-green-200 text-green-900'
          : 'bg-white border-gray-200 text-gray-900';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl border shadow-xl transition-all duration-300 ${bgClasses}`}
          >
            <div className="space-y-1">
              {toast.title && <h4 className="font-semibold text-sm">{toast.title}</h4>}
              {toast.description && <p className="text-xs opacity-90">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-700 text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}