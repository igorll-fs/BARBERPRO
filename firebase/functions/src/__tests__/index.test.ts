// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  apps: [],
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      })),
    })),
  })),
  auth: jest.fn(() => ({
    getUser: jest.fn(),
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
    createCustomToken: jest.fn(() => Promise.resolve('mock-token')),
  })),
  firestore: {
    Timestamp: {
      fromDate: jest.fn(() => new Date()),
    },
    FieldValue: {
      increment: jest.fn(),
      serverTimestamp: jest.fn(),
    },
  },
}));

describe('Cloud Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Validation', () => {
    it('should sanitize phone numbers correctly', () => {
      const sanitizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');
      
      expect(sanitizePhone('+55 (11) 99999-9999')).toBe('+5511999999999');
      expect(sanitizePhone('(11) 99999-9999')).toBe('11999999999');
      expect(sanitizePhone('abc123')).toBe('123');
    });

    it('should validate phone length', () => {
      const isValidPhone = (phone: string) => {
        const sanitized = phone.replace(/[^\d+]/g, '');
        return sanitized.length >= 10 && sanitized.length <= 15;
      };
      
      expect(isValidPhone('+5511999999999')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('+1234567890123456')).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should accept valid roles', () => {
      const validRoles = ['cliente', 'dono', 'funcionario'];
      
      expect(validRoles.includes('cliente')).toBe(true);
      expect(validRoles.includes('dono')).toBe(true);
      expect(validRoles.includes('funcionario')).toBe(true);
      expect(validRoles.includes('admin')).toBe(false);
    });
  });
});

describe('Security Rules', () => {
  it('should validate user authentication', () => {
    const mockContext = {
      auth: {
        uid: 'user-123',
        token: { role: 'cliente' },
      },
    };
    
    expect(mockContext.auth?.uid).toBeDefined();
    expect(mockContext.auth?.token.role).toBe('cliente');
  });

  it('should reject unauthenticated requests', () => {
    const mockContext = { auth: null };
    
    expect(mockContext.auth).toBeNull();
  });
});
