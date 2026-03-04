/* ============================
   BARBERPRO PWA — Firebase Config
   Web-native (no AsyncStorage, no React Native)
   ============================ */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const USE_EMULATOR = import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_PROJECT_ID;

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

let app: any;
let auth: any;
let db: any;
let functions: any;
let rtdb: any;
let storage: any;

try {
    const appExists = getApps().length > 0;
    app = appExists ? getApps()[0] : initializeApp(config as any);

    auth = getAuth(app);
    // Use browser local persistence (survives tab close)
    setPersistence(auth, browserLocalPersistence).catch(console.warn);

    db = getFirestore(app);
    functions = getFunctions(app);
    rtdb = getDatabase(app);
    storage = getStorage(app);

    if (USE_EMULATOR) {
        console.log('🔧 Modo DEV: Firebase usando configuração local');
        try {
            connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
            connectFirestoreEmulator(db, '127.0.0.1', 8080);
            connectFunctionsEmulator(functions, '127.0.0.1', 5001);
            connectDatabaseEmulator(rtdb, '127.0.0.1', 9000);
            connectStorageEmulator(storage, '127.0.0.1', 9199);
        } catch (e) {
            console.warn('⚠️ Emuladores não disponíveis.');
        }
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

export { auth, db, functions, rtdb, storage };
