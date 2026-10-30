'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export const SessionTimeMolecule = () => {
  const [secondsSpent, setSecondsSpent] = useState(0);

  useEffect(() => {
    // 1. Récupérer ou initialiser le moment du début de session dans le sessionStorage
    let startTime = sessionStorage.getItem('tej_patta_session_start');

    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem('tej_patta_session_start', startTime);
    }

    const startTimestamp = parseInt(startTime, 10);

    // 2. Mettre à jour immédiatement le temps écoulé
    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      setSecondsSpent(elapsedSeconds);
    };

    updateTimer();

    // 3. Lancer un intervalle pour rafraîchir chaque seconde
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes} min ${seconds} s`;
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-border/70 rounded-2xl shadow-2xs">
      <div className="p-2.5 bg-shop-orange/10 text-shop-orange rounded-xl">
        <Clock className="w-5 h-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs text-muted-foreground font-medium">Temps passé sur le site</span>
        <span className="text-sm font-bold text-foreground">{formatTime(secondsSpent)}</span>
      </div>
    </div>
  );
};

export default SessionTimeMolecule;