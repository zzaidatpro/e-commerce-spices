import { describe, it, expect } from 'vitest';
import { sessionCookieOptions } from './session-cookie';
import { CookieOptions } from '@supabase/ssr';

describe('sessionCookieOptions', () => {
  it('retire la durée de vie d’une session', () => {
    const o = sessionCookieOptions({ maxAge: 3600, expires: new Date(), sameSite: 'lax' } as Partial<CookieOptions>, 'jeton');
    expect(o.maxAge).toBeUndefined();
    expect(o.expires).toBeUndefined();
    expect(o.path).toBe('/');
  });
  it('conserve la suppression (valeur vide)', () => {
    expect(sessionCookieOptions({ maxAge: 0 } as Partial<CookieOptions>, '').maxAge).toBe(0);
  });
});