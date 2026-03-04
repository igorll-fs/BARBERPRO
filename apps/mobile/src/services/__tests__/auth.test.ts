import { validatePhone, validateEmail, formatPhone } from '../auth';

describe('Auth Service', () => {
  describe('validatePhone', () => {
    it('should return true for valid Brazilian phone numbers', () => {
      expect(validatePhone('+5511999999999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('(11) 99999-9999')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('formatPhone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhone('5511999999999')).toBe('+55 (11) 99999-9999');
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    });
  });
});
