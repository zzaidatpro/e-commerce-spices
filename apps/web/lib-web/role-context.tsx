'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { RoleSite } from '@repo/lib';

const RoleContext = createContext<RoleSite>(null);

export function RoleProvider({ role, children }: { role: RoleSite; children: ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleSite {
  return useContext(RoleContext);
}