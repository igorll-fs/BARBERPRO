/* ============================
   BARBERPRO — Push Notifications
   Registro de token + permissões
   ============================ */
import * as Notifications from 'expo-notifications';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Platform } from 'react-native';

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Registrar para push e retornar token */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Verificar se está em ambiente com EAS projectId válido
    const isDevMode = typeof __DEV__ !== 'undefined' && __DEV__;
    if (isDevMode) {
      console.log('⚠️ Push notifications desabilitadas em DEV mode');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return null;
    }

    // Android: canal de notificação
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'BarberPro',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.warn('⚠️ Erro ao registrar push (normal em DEV):', e);
    return null;
  }
}

/** Salvar push token no Firestore para o usuário */
export async function savePushToken(uid: string, token: string): Promise<void> {
  if (!uid || !token || !db) return;
  await setDoc(doc(db, 'users', uid), {
    pushToken: token,
    pushTokenUpdatedAt: serverTimestamp(),
    platform: Platform.OS,
  }, { merge: true });
}

/** Listener para notificações recebidas */
export function addNotificationReceivedListener(handler: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(handler);
}

/** Listener para notificações respondidas (toque) */
export function addNotificationResponseReceivedListener(handler: (response: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
