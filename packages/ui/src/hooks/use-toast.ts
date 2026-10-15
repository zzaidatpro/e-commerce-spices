'use client';

//gere l'etat global des alertes (success, error, info)
import * as React from 'react';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

type ToastType = 'default' | 'success' | 'error';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const memoryState: { toasts: ToastProps[] } = { toasts: [] };
const listeners: Array<(state: { toasts: ToastProps[] }) => void> = [];

function dispatch(action: { type: string; toast?: ToastProps; toastId?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState.toasts = [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT);
      break;
    case 'DISMISS_TOAST':
      if (action.toastId) {
        memoryState.toasts = memoryState.toasts.filter((t) => t.id !== action.toastId);
      } else {
        memoryState.toasts = [];
      }
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const toast = ({ title, description, type = 'default' }: Omit<ToastProps, 'id'>) => {
    const id = genId();

    dispatch({
      type: 'ADD_TOAST',
      toast: { id, title, description, type },
    });

    setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', toastId: id });
    }, TOAST_REMOVE_DELAY);
  };

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}