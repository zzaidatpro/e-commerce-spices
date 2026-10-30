import { describe, it, expect, vi } from 'vitest';

// Simulation de Supabase Auth pour l'inscription
const mockSignUp = vi.fn();

vi.mock('@repo/database/client', () => ({
  createUserClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe('Action: Register', () => {
  it('devrait réussir l\'inscription si les données sont valides', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });

    // Simulation de l'appel à votre Server Action d'inscription
    const handleRegister = async (email: string, pass: string) => {
      const { createUserClient } = await import('@repo/database/client');
      const supabase = createUserClient();
      return await supabase.auth.signUp({ email, password: pass });
    };

    const { data, error } = await handleRegister('test@example.com', 'Password123!');

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'Password123!' });
  });

  it('devrait retourner une erreur si Supabase échoue', async () => {
    mockSignUp.mockResolvedValueOnce({ data: null, error: { message: 'Email déjà utilisé' } });

    const handleRegister = async (email: string, pass: string) => {
      const { createUserClient } = await import('@repo/database/client');
      const supabase = createUserClient();
      return await supabase.auth.signUp({ email, password: pass });
    };

    const { data, error } = await handleRegister('existing@example.com', 'Password123!');

    expect(error).not.toBeNull();
    expect(error?.message).toBe('Email déjà utilisé');
    expect(data).toBeNull();
  });
});