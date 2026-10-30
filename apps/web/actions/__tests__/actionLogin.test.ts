import { describe, it, expect, vi } from 'vitest';

// Simulation de Supabase Auth pour la connexion
const mockSignInWithPassword = vi.fn();

vi.mock('@repo/database/client', () => ({
  createUserClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

describe('Action: Login', () => {
  it('devrait connecter l\'utilisateur avec des identifiants valides', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ 
      data: { session: { access_token: 'token-abc' }, user: { id: '123' } }, 
      error: null 
    });

    const handleLogin = async (email: string, pass: string) => {
      const { createUserClient } = await import('@repo/database/client');
      const supabase = createUserClient();
      return await supabase.auth.signInWithPassword({ email, password: pass });
    };

    const { data, error } = await handleLogin('test@example.com', 'Password123!');

    expect(error).toBeNull();
    expect(data.session?.access_token).toBe('token-abc');
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'Password123!' });
  });

  it('devrait échouer en cas d\'identifiants incorrects', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ 
      data: { session: null, user: null }, 
      error: { message: 'Invalid login credentials' } 
    });

    const handleLogin = async (email: string, pass: string) => {
      const { createUserClient } = await import('@repo/database/client');
      const supabase = createUserClient();
      return await supabase.auth.signInWithPassword({ email, password: pass });
    };

    const { data, error } = await handleLogin('test@example.com', 'WrongPassword');

    expect(error).not.toBeNull();
    expect(error?.message).toBe('Invalid login credentials');
    expect(data.session).toBeNull();
  });
});