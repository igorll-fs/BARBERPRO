/* ============================
   BARBERPRO PWA — Hook de Assinatura
   Carrega status, listener real-time, cache
   ============================ */
import { useState, useEffect } from 'react';
import { useUser } from '../store/user';
import {
  onSubscriptionChange,
  isSubscriptionActive,
  type SubscriptionInfo,
  type SubscriptionStatus,
} from '../services/subscriptions';

interface UseSubscriptionReturn {
  /** Info completa da assinatura */
  subscription: SubscriptionInfo | null;
  /** Assinatura ativa? (active ou trialing) */
  isActive: boolean;
  /** Status atual */
  status: SubscriptionStatus;
  /** Carregando? */
  loading: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { shopId, role, isDemo } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Só verifica para donos com shopId
    if (!shopId || role !== 'dono') {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Demo: sempre inativo
    if (isDemo) {
      setSubscription({ status: 'inactive' });
      setLoading(false);
      return;
    }

    // Listener em tempo real
    const unsub = onSubscriptionChange(shopId, (info) => {
      setSubscription(info);
      setLoading(false);
    });

    return () => unsub();
  }, [shopId, role, isDemo]);

  const status: SubscriptionStatus = subscription?.status || 'inactive';
  const isActive = isSubscriptionActive(status);

  return { subscription, isActive, status, loading };
}
