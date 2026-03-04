import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config';

// Detecta se deve usar emuladores (sem credenciais reais)
const USE_EMULATOR = typeof __DEV__ !== 'undefined' && __DEV__ && !ENV.FIREBASE_PROJECT_ID;

const devConfig = {
  apiKey: 'dev-api-key',
  authDomain: 'localhost',
  projectId: 'barberpro-dev',
  storageBucket: 'barberpro-dev.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:000000000000',
};

const prodConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID,
};

const config = USE_EMULATOR ? devConfig : prodConfig;

let app: any;
let auth: any;
let db: any;
let functions: any;
let rtdb: any;
let storage: any;

try {
  const appExists = getApps().length > 0;
  app = appExists ? getApps()[0] : initializeApp(config as any);
  
  // Inicializar Auth com AsyncStorage para persistência
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (e) {
    // Auth já foi inicializado, usar instância existente
    auth = getAuth(app);
  }
  
  db = getFirestore(app);
  functions = getFunctions(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);

  // Conectar aos emuladores Firebase locais em modo desenvolvimento
  if (USE_EMULATOR) {
    console.log('🔧 Modo DEV: Firebase usando configuração local');
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      connectDatabaseEmulator(rtdb, '127.0.0.1', 9000);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
    } catch (e) {
      console.warn('⚠️ Emuladores não disponíveis. App funcionará sem Firebase.');
    }
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.log('ℹ️ App continuará em modo offline/demo');
}

export { auth, db, functions, rtdb, storage };
