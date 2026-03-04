import { httpsCallable } from 'firebase/functions';
import * as WebBrowser from 'expo-web-browser';
import { functions } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getSubscriptionStatus(shopId: string) {
  const ref = doc(db, 'barbershops', shopId);
  const snap = await getDoc(ref);
  const data = snap.data() as any;
  return data?.subscription?.status || 'inactive';
}

export async function openCheckout(shopId: string, mode: 'monthly'|'yearly') {
  const fn = httpsCallable(functions, 'createCheckoutSession');
  const res: any = await fn({ shopId, mode });
  if (res.data?.url) await WebBrowser.openBrowserAsync(res.data.url);
}

export async function openBillingPortal(customerId: string) {
  const fn = httpsCallable(functions, 'billingPortal');
  const res: any = await fn({ customerId });
  if (res.data?.url) await WebBrowser.openBrowserAsync(res.data.url);
}
