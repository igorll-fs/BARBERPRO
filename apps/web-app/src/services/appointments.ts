/* ============================
   BARBERPRO PWA — Appointments Service
   ============================ */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export async function confirmAppointment(shopId: string, appointmentId: string): Promise<void> {
    const fn = httpsCallable(functions, 'confirmAppointment');
    await fn({ shopId, appointmentId });
}

export async function rejectAppointment(shopId: string, appointmentId: string, reason?: string): Promise<void> {
    const fn = httpsCallable(functions, 'rejectAppointment');
    await fn({ shopId, appointmentId, reason });
}

export async function markNoShow(shopId: string, appointmentId: string): Promise<void> {
    const fn = httpsCallable(functions, 'markNoShow');
    await fn({ shopId, appointmentId });
}
