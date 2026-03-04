/**
 * Firebase Mock para desenvolvimento local.
 * Permite rodar o app sem credenciais reais do Firebase.
 * Para ambiente de produção, configure as variáveis em .env
 */

// Mock do Firebase App
const mockApp = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };

// Mock do Auth
const mockUser = {
  uid: 'dev_mock_uid',
  email: 'dev@barberpro.app',
  phoneNumber: '+5511999999999',
  getIdTokenResult: async () => ({
    claims: { role: 'dono', shopId: 'demo' },
    token: 'mock-token',
  }),
  getIdToken: async () => 'mock-id-token',
};

export const auth = {
  currentUser: mockUser,
  onAuthStateChanged: (cb: (user: any) => void) => {
    cb(mockUser);
    return () => {};
  },
  signInWithCustomToken: async () => ({ user: mockUser }),
  signInWithEmailAndPassword: async () => ({ user: mockUser }),
  signOut: async () => {},
};

// Mock do Firestore
const mockCollection: Record<string, any[]> = {
  'barbershops/demo/services': [
    { id: 'svc1', name: 'Corte Masculino', priceCents: 4500, durationMin: 30, active: true },
    { id: 'svc2', name: 'Barba', priceCents: 3000, durationMin: 20, active: true },
    { id: 'svc3', name: 'Corte + Barba', priceCents: 7000, durationMin: 45, active: true },
    { id: 'svc4', name: 'Pigmentação', priceCents: 8000, durationMin: 60, active: true },
  ],
  'barbershops/demo/staff': [
    { uid: 'staff1', name: 'Carlos Silva', active: true },
    { uid: 'staff2', name: 'João Santos', active: true },
  ],
  'barbershops/demo/appointments': [],
  'barbershops/demo/promotions': [
    { id: 'promo1', title: '10% na primeira visita', discount: 10, active: true },
  ],
};

export const db = {
  _mockData: mockCollection,
};

// Mock do Functions
export const functions = {
  _region: 'us-central1',
};

// Mock do Realtime Database  
export const rtdb = {};
