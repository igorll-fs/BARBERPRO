import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(() => jest.fn().mockResolvedValue({ data: {} })),
  getFunctions: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithCustomToken: jest.fn().mockResolvedValue({ user: { uid: 'mock-uid' } }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'mock-uid' } }),
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  startOtpWhatsApp: jest.fn().mockResolvedValue({}),
  verifyOtpWhatsApp: jest.fn().mockResolvedValue({}),
  signInOwnerEmail: jest.fn().mockResolvedValue({}),
  signInWithGoogle: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/services/claims', () => ({
  getClaims: jest.fn().mockResolvedValue({ role: 'cliente' }),
}));

jest.mock('@/services/firebase', () => ({
  auth: {},
  functions: {},
  db: {},
}));
