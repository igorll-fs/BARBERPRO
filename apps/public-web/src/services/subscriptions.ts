/* ============================
   BARBERPRO PWA — Serviço de Assinatura
   Stripe Checkout + status + billing portal
   ============================ */
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, functions } from './firebase';

// ─── Tipos ──────────────────────────────────────────────
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';
export type PlanMode = 'monthly' | 'semiannual' | 'yearly';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  mode?: string;
  updatedAt?: string;
  stripeCustomerId?: string;
}

// ─── Buscar status da assinatura ────────────────────────
export async function getSubscriptionStatus(shopId: string): Promise<SubscriptionInfo> {
  if (!db) return { status: 'inactive' };
  try {
    const ref = doc(db, 'barbershops', shopId);
    const snap = await getDoc(ref);
    const data = snap.data() as any;
    if (!data?.subscription) return { status: 'inactive' };
    return {
      status: data.subscription.status || 'inactive',
      mode: data.subscription.mode,
      updatedAt: data.subscription.updatedAt?.toDate?.()?.toISOString?.() || data.subscription.updatedAt,
      stripeCustomerId: data.subscription.stripe?.customer,
    };
  } catch (error) {
    console.warn('⚠️ Erro ao buscar assinatura:', error);
    return { status: 'inactive' };
  }
}

// ─── Listener em tempo real da assinatura ───────────────
export function onSubscriptionChange(
  shopId: string,
  callback: (info: SubscriptionInfo) => void
): () => void {
  if (!db) { callback({ status: 'inactive' }); return () => {}; }
  const ref = doc(db, 'barbershops', shopId);
  return onSnapshot(ref, (snap) => {
    const data = snap.data() as any;
    if (!data?.subscription) {
      callback({ status: 'inactive' });
      return;
    }
    callback({
      status: data.subscription.status || 'inactive',
      mode: data.subscription.mode,
      updatedAt: data.subscription.updatedAt?.toDate?.()?.toISOString?.() || data.subscription.updatedAt,
      stripeCustomerId: data.subscription.stripe?.customer,
    });
  }, () => callback({ status: 'inactive' }));
}

// ─── Abrir checkout Stripe ──────────────────────────────
export async function openCheckout(shopId: string, mode: PlanMode): Promise<void> {
  if (!functions) throw new Error('Firebase indisponível');
  const fn = httpsCallable(functions, 'createCheckoutSession');
  const res: any = await fn({ shopId, mode });
  if (res.data?.url) {
    window.open(res.data.url, '_blank');
  } else {
    throw new Error('URL de checkout não retornada');
  }
}

// ─── Abrir portal de billing Stripe ─────────────────────
export async function openBillingPortal(customerId: string): Promise<void> {
  if (!functions) throw new Error('Firebase indisponível');
  const fn = httpsCallable(functions, 'billingPortal');
  const res: any = await fn({ customerId });
  if (res.data?.url) {
    window.open(res.data.url, '_blank');
  } else {
    throw new Error('URL do portal não retornada');
  }
}

// ─── Verificar se assinatura está ativa ─────────────────
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}
