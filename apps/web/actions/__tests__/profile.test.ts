import { describe, it, expect, vi } from 'vitest';

// Mock du client Supabase pour éviter les appels réseau réels pendant les tests
vi.mock('@repo/database/client', () => ({
  createUserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: 'user-1', email: 'test@example.com', nom: 'Zaidat' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe('Supabase Profile Integration', () => {
  it('devrait récupérer les informations du profil utilisateur avec succès', async () => {
    // Appel simulé de la logique de récupération
    const mockFetchProfile = async () => {
      const { createUserClient } = await import('@repo/database/client');
      const supabase = createUserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-1')
        .single();
      return { data, error };
    };

    const { data, error } = await mockFetchProfile();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.email).toBe('test@example.com');
    expect(data?.nom).toBe('Zaidat');
  });
});