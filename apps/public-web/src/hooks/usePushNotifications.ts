/* ============================
   BARBERPRO PWA — Hook de Push Notifications
   Gerencia permissão, token e estado
   ============================ */
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../store/user';
import {
  isPushSupported,
  getPermissionStatus,
  setupPushNotifications,
  removeTokenFromFirestore,
  showLocalNotification,
} from '../services/pushNotifications';

interface UsePushReturn {
  /** Push é suportado neste navegador? */
  isSupported: boolean;
  /** Status da permissão: granted | denied | default | unsupported */
  permission: NotificationPermission | 'unsupported';
  /** Está ativado (permissão concedida)? */
  isEnabled: boolean;
  /** Carregando setup? */
  loading: boolean;
  /** Solicitar ativação das notificações */
  enable: () => Promise<boolean>;
  /** Desativar notificações */
  disable: () => Promise<void>;
  /** Enviar notificação local de teste */
  testNotification: () => void;
}

export function usePushNotifications(): UsePushReturn {
  const { uid, isAuthenticated, isDemo } = useUser();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getPermissionStatus()
  );
  const [loading, setLoading] = useState(false);

  const isSupported = isPushSupported();
  const isEnabled = permission === 'granted';

  // Atualiza permissão quando muda
  useEffect(() => {
    setPermission(getPermissionStatus());
  }, []);

  // Ativar push
  const enable = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || isDemo || !uid) return false;
    setLoading(true);
    try {
      const success = await setupPushNotifications(uid);
      setPermission(getPermissionStatus());
      return success;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [uid, isAuthenticated, isDemo]);

  // Desativar push
  const disable = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      await removeTokenFromFirestore(uid);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Teste local
  const testNotification = useCallback(() => {
    showLocalNotification('BarberPro 💈', {
      body: 'Notificações funcionando! Você receberá alertas de agendamentos.',
    });
  }, []);

  return { isSupported, permission, isEnabled, loading, enable, disable, testNotification };
}
