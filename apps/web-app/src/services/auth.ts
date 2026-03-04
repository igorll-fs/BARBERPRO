/* ============================
   BARBERPRO PWA — Auth Service
   ============================ */
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, functions } from './firebase';

export async function startOtpWhatsApp(phone: string) {
    const fn = httpsCallable(functions, 'startOtpWhatsApp');
    const res = await fn({ phone });
    return res.data;
}

export async function verifyOtpWhatsApp(phone: string, code: string, role: 'cliente' | 'dono' | 'funcionario') {
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
