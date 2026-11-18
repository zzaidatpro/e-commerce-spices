import { describe, it, expect } from 'vitest';
import { versWhatsapp } from './whatsapp';

describe('versWhatsapp', () => {
  it('convertit un numéro local algérien', () => {
    expect(versWhatsapp('0550 12 34 56')).toBe('213550123456');
  });
  it('garde un numéro déjà international', () => {
    expect(versWhatsapp('+213 550 12 34 56')).toBe('213550123456');
  });
  it('renvoie null sans numéro exploitable', () => {
    expect(versWhatsapp(null)).toBeNull();
    expect(versWhatsapp('abc')).toBeNull();
  });
});