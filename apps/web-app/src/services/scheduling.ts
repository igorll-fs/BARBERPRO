/* ============================
   BARBERPRO PWA — Scheduling Service
   ============================ */
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

export interface ServiceItem { id: string; name: string; priceCents: number; durationMin: number; active: boolean }
export interface StaffItem { uid: string; name?: string; active?: boolean }

export async function listServices(shopId: string): Promise<ServiceItem[]> {
    const snap = await getDocs(collection(db, 'barbershops', shopId, 'services'));
    return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listStaff(shopId: string): Promise<StaffItem[]> {
    const snap = await getDocs(collection(db, 'barbershops', shopId, 'staff'));
    return snap.docs.map((d: any) => ({ uid: d.id, ...(d.data() as any) }));
}

export async function cancelAppointment(shopId: string, appointmentId: string): Promise<void> {
    const fn = httpsCallable(functions, 'cancelAppointment');
    await fn({ shopId, appointmentId });
}

export async function rescheduleAppointment(shopId: string, appointmentId: string, newStartISO: string, staffUid?: string): Promise<void> {
    const fn = httpsCallable(functions, 'rescheduleAppointment');
    await fn({ shopId, appointmentId, newStartISO, staffUid });
}

export async function completeAppointment(shopId: string, appointmentId: string): Promise<void> {
    const fn = httpsCallable(functions, 'completeAppointment');
    await fn({ shopId, appointmentId });
}

export async function getAvailableSlots(shopId: string, serviceId: string, date: string, staffUid?: string): Promise<string[]> {
    const fn = httpsCallable(functions, 'getAvailableSlots');
    const res: any = await fn({ shopId, serviceId, date, staffUid });
    return res.data?.slots || [];
}

export async function createAppointmentClient(shopId: string, serviceId: string, startISO: string, staffUid?: string): Promise<string> {
    const fn = httpsCallable(functions, 'createAppointmentClient');
    const res: any = await fn({ shopId, serviceId, staffUid, startISO });
    return res.data?.id || '';
}
