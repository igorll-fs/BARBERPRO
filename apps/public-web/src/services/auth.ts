/* ============================
   BARBERPRO PWA — Auth Service
   Login email/senha, OTP, claims
   ============================ */
import { httpsCallable } from 'firebase/functions';
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdTokenResult,
  type User,
} from 'firebase/auth';
import { auth, functions } from './firebase';
import type { UserRole } from '../types';

// ─── OTP WhatsApp ───────────────────────────────────────
export async function startOtpWhatsApp(phone: string) {
  if (!functions) throw new Error('Firebase indisponível');
  const fn = httpsCallable(functions, 'startOtpWhatsApp');
  return (await fn({ phone })).data;
}

export async function verifyOtpWhatsApp(phone: string, code: string, role: UserRole) {
  if (!functions || !auth) throw new Error('Firebase indisponível');
  const fn = httpsCallable(functions, 'verifyOtpWhatsApp');
  const res: any = await fn({ phone, code, role });
  if (res.data?.customToken) {
    await signInWithCustomToken(auth, res.data.customToken);
  }
  return res.data;
}

// ─── Email/Senha (Dono) ─────────────────────────────────
export async function signInOwnerEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase indisponível');
  return signInWithEmailAndPassword(auth, email, password);
}

// ─── Claims ─────────────────────────────────────────────
export async function getClaims(): Promise<{ role?: UserRole; shopId?: string }> {
  if (!auth?.currentUser) return {};
  const token = await getIdTokenResult(auth.currentUser, true);
  return token.claims as any;
}

// ─── Sign Out ───────────────────────────────────────────
export async function signOut() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

// ─── Auth Listener ──────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
