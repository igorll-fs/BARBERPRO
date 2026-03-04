/* ============================
   BARBERPRO PWA — Web Push Notifications
   FCM Web + Fallback para Notification API
   ============================ */
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── VAPID Key (Firebase Cloud Messaging Web) ───────────
// Configurar em: Firebase Console → Projeto → Cloud Messaging → Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// ─── Verifica se o browser suporta Push ─────────────────
export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// ─── Status atual da permissão ──────────────────────────
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// ─── Solicitar permissão de notificação ─────────────────
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) throw new Error('Push não suportado neste navegador');
  return Notification.requestPermission();
}

// ─── Obter token FCM via Service Worker ─────────────────
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!isPushSupported() || Notification.permission !== 'granted') return null;

    // Import dinâmico do firebase/messaging (não carrega se não precisar)
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { default: app } = await import('firebase/app').then(async () => {
      const { getApps } = await import('firebase/app');
      const apps = getApps();
      return { default: apps[0] || null };
    });

    if (!app) return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    return token || null;
  } catch (error) {
    console.warn('⚠️ Erro ao obter token FCM:', error);
    return null;
  }
}

// ─── Salvar token no Firestore (para enviar push do backend) ─
export async function saveTokenToFirestore(uid: string, token: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', uid, 'pushTokens', 'web'), {
      token,
      platform: 'web',
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    console.log('🔔 Token push salvo no Firestore');
  } catch (error) {
    console.warn('⚠️ Erro ao salvar token push:', error);
  }
}

// ─── Remover token do Firestore (ao desativar) ──────────
export async function removeTokenFromFirestore(uid: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'pushTokens', 'web'));
    console.log('🔕 Token push removido');
  } catch (error) {
    console.warn('⚠️ Erro ao remover token push:', error);
  }
}

// ─── Enviar notificação local (fallback / teste) ────────
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission !== 'granted') return;
  try {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: 'barberpro',
        ...options,
      });
    });
  } catch {
    // Fallback: notificação sem SW
    new Notification(title, { icon: '/icon.svg', ...options });
  }
}

// ─── Setup completo: pedir permissão + obter token + salvar ─
export async function setupPushNotifications(uid: string): Promise<boolean> {
  try {
    if (!isPushSupported()) return false;

    const permission = await requestPermission();
    if (permission !== 'granted') return false;

    const token = await getFCMToken();
    if (token) {
      await saveTokenToFirestore(uid, token);
    }

    return true;
  } catch (error) {
    console.warn('⚠️ Erro no setup de push:', error);
    return false;
  }
}
