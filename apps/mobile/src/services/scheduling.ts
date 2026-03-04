/* ============================
   BARBERPRO — Serviço de Agendamento
   CRUD + cancelar + remarcar
   ============================ */
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

export interface ServiceItem { id: string; name: string; priceCents: number; durationMin: number; active: boolean }
export interface AppointmentInput { shopId: string; serviceId: string; staffUid?: string; start: Date; customerUid: string }
export interface StaffItem { uid: string; name?: string; active?: boolean }

export async function listServices(shopId: string): Promise<ServiceItem[]> {
  const snap = await getDocs(collection(db, 'barbershops', shopId, 'services'));
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listStaff(shopId: string): Promise<StaffItem[]> {
  const snap = await getDocs(collection(db, 'barbershops', shopId, 'staff'));
  return snap.docs.map((d: any) => ({ uid: d.id, ...(d.data() as any) }));
}

/** Cancelar agendamento (via Cloud Function) */
export async function cancelAppointment(shopId: string, appointmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'cancelAppointment');
  await fn({ shopId, appointmentId });
}

/** Remarcar agendamento (via Cloud Function) */
export async function rescheduleAppointment(
  shopId: string,
  appointmentId: string,
  newStartISO: string,
  staffUid?: string,
): Promise<void> {
  const fn = httpsCallable(functions, 'rescheduleAppointment');
  await fn({ shopId, appointmentId, newStartISO, staffUid });
}

/** Marcar como completo */
export async function completeAppointment(shopId: string, appointmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'completeAppointment');
  await fn({ shopId, appointmentId });
}

/** Buscar horários disponíveis */
export async function getAvailableSlots(
  shopId: string, serviceId: string, date: string, staffUid?: string,
): Promise<string[]> {
  const fn = httpsCallable(functions, 'getAvailableSlots');
  const res: any = await fn({ shopId, serviceId, date, staffUid });
  return res.data?.slots || [];
}

/** Criar agendamento (cliente) */
/** Buscar promoções ativas para um serviço */
export async function getPromotionsForService(
  shopId: string,
  serviceId: string
): Promise<any[]> {
  const snap = await getDocs(
    query(
      collection(db, 'barbershops', shopId, 'promotions'),
      where('active', '==', true)
    )
  );
  const allPromos = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
  
  // Filtrar promoções que se aplicam a este serviço
  return allPromos.filter((promo: any) => {
    // Se não tem serviceIds, se aplica a todos os serviços
    if (!promo.serviceIds || promo.serviceIds.length === 0) return true;
    // Se tem serviceIds, verifica se este serviço está na lista
    return promo.serviceIds.includes(serviceId);
  });
}

/** Calcular preço com desconto */
export function calculateDiscountedPrice(
  priceCents: number,
  discountPercent: number
): number {
  const discount = (priceCents * discountPercent) / 100;
  return Math.round(priceCents - discount);
}

/** Criar agendamento (cliente) */
export async function createAppointmentClient(
  shopId: string, 
  serviceId: string, 
  startISO: string, 
  staffUid?: string,
  promotionId?: string
): Promise<string> {
  const fn = httpsCallable(functions, 'createAppointmentClient');
  const res: any = await fn({ 
    shopId, 
    serviceId, 
    staffUid, 
    startISO,
    promotionId 
  });
  return res.data?.id || '';
}
