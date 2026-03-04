import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, functions } from './firebase';

export async function startOtpWhatsApp(phone: string) {
  const fn = httpsCallable(functions, 'startOtpWhatsApp');
  const res = await fn({ phone });
  return res.data;
}

export async function verifyOtpWhatsApp(phone: string, code: string, role: 'cliente'|'dono'|'funcionario') {
  const fn = httpsCallable(functions, 'verifyOtpWhatsApp');
  const res: any = await fn({ phone, code, role });
  if (res.data && res.data.customToken) {
    await signInWithCustomToken(auth, res.data.customToken);
  }
  return res.data;
}

export async function signInOwnerEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  // Placeholder: usar expo-auth-session ou Firebase Google Sign-In
  throw new Error('Google Sign-In não configurado neste esqueleto');
}

// Utility functions for validation
export function validatePhone(phone: string): boolean {
  const sanitized = phone.replace(/[^\d+]/g, '');
  return sanitized.length >= 10 && sanitized.length <= 15;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 13) { // +55 + DDD + 9 dígitos
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  } else if (cleaned.length === 11) { // DDD + 9 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) { // DDD + 8 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}
