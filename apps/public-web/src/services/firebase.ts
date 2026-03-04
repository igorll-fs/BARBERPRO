/* ============================
   BARBERPRO PWA — Firebase Config (Web)
   Adaptado do mobile, sem AsyncStorage/RN
   ============================ */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';

// Detecta DEV mode
const isDev = import.meta.env.DEV;
const USE_EMULATOR = isDev && !import.meta.env.VITE_FIREBASE_PROJECT_ID;

const devConfig = {
  apiKey: 'dev-api-key',
  authDomain: 'localhost',
  projectId: 'barberpro-dev',
  storageBucket: 'barberpro-dev.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:000000000000',
};

const prodConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const config = USE_EMULATOR ? devConfig : prodConfig;

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let functions: ReturnType<typeof getFunctions> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let analytics: Analytics | null = null;

try {
  app = getApps().length ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  storage = getStorage(app);

  if (USE_EMULATOR) {
    console.log('🔧 PWA DEV: conectando aos emuladores Firebase');
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
    } catch {
      console.warn('⚠️ Emuladores indisponíveis');
    }
  }
} catch (error) {
  console.error('❌ Firebase não inicializado:', error);
  console.log('ℹ️ PWA funcionará em modo demo');
}

// Analytics só em produção (não funciona no localhost)
if (!USE_EMULATOR && app) {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app!);
      console.log('📊 Firebase Analytics ativo');
    }
  }).catch(() => { /* Analytics não suportado neste browser */ });
}

export { auth, db, functions, storage, analytics };
