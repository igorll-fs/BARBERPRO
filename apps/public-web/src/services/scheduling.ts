/* ============================
   BARBERPRO PWA — Serviço de Agendamento
   Adaptado do mobile para web
   ============================ */
import { collection, getDocs, query, where, orderBy, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

// ─── Tipos ──────────────────────────────────────────────
export interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  durationMin: number;
  active: boolean;
  description?: string;
  photoUrl?: string;
  category?: string;
}

export interface StaffItem {
  uid: string;
  name?: string;
  photoUrl?: string;
  active?: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Appointment {
  id: string;
  shopId: string;
  serviceId: string;
  serviceName?: string;
  staffUid?: string;
  staffName?: string;
  customerUid: string;
  customerName?: string;
  start: any;
  end: any;
  durationMin: number;
  status: AppointmentStatus;
  priceCents?: number;
  createdAt?: any;
}

export interface Review {
  id: string;
  shopId: string;
  appointmentId: string;
  customerUid: string;
  staffUid?: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

// ─── Serviços ───────────────────────────────────────────
export async function listServices(shopId: string): Promise<ServiceItem[]> {
  if (!db) return getDemoServices();
  try {
    const snap = await getDocs(collection(db, 'barbershops', shopId, 'services'));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((s: ServiceItem) => s.active);
  } catch {
    return getDemoServices();
  }
}

// ─── Staff ──────────────────────────────────────────────
export async function listStaff(shopId: string): Promise<StaffItem[]> {
  if (!db) return getDemoStaff();
  try {
    const snap = await getDocs(collection(db, 'barbershops', shopId, 'staff'));
    return snap.docs
      .map((d) => ({ uid: d.id, ...(d.data() as any) }))
      .filter((s: StaffItem) => s.active !== false);
  } catch {
    return getDemoStaff();
  }
}

// ─── Slots Disponíveis ──────────────────────────────────
export async function getAvailableSlots(
  shopId: string,
  serviceId: string,
  date: string,
  staffUid?: string,
): Promise<string[]> {
  if (!functions) return getDemoSlots();
  try {
    const fn = httpsCallable(functions, 'getAvailableSlots');
    const res: any = await fn({ shopId, serviceId, date, staffUid });
    return res.data?.slots || [];
  } catch {
    return getDemoSlots();
  }
}

// ─── Criar Agendamento ──────────────────────────────────
export async function createAppointmentClient(
  shopId: string,
  serviceId: string,
  startISO: string,
  staffUid?: string,
): Promise<string> {
  if (!functions) return 'demo-appointment-' + Date.now();
  const fn = httpsCallable(functions, 'createAppointmentClient');
  const res: any = await fn({ shopId, serviceId, staffUid, startISO });
  return res.data?.id || '';
}

// ─── Cancelar Agendamento ───────────────────────────────
export async function cancelAppointment(shopId: string, appointmentId: string): Promise<void> {
  if (!functions) return;
  const fn = httpsCallable(functions, 'cancelAppointment');
  await fn({ shopId, appointmentId });
}

// ─── Listar Agendamentos do Cliente ─────────────────────
export async function listMyAppointments(
  shopId: string,
  customerUid: string,
): Promise<Appointment[]> {
  if (!db) return getDemoAppointments();
  try {
    const q = query(
      collection(db, 'barbershops', shopId, 'appointments'),
      where('customerUid', '==', customerUid),
      orderBy('start', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch {
    return getDemoAppointments();
  }
}

// ─── Ouvir Agendamentos em Tempo Real ───────────────────
export function listenMyAppointments(
  shopId: string,
  customerUid: string,
  callback: (appointments: Appointment[]) => void,
): Unsubscribe {
  if (!db) {
    callback(getDemoAppointments());
    return () => {};
  }
  const q = query(
    collection(db, 'barbershops', shopId, 'appointments'),
    where('customerUid', '==', customerUid),
    orderBy('start', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }, () => {
    callback(getDemoAppointments());
  });
}

// ─── Enviar Avaliação ───────────────────────────────────
export async function submitReview(
  shopId: string,
  appointmentId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'barbershops', shopId, 'reviews'), {
    appointmentId,
    rating,
    comment: comment || '',
    createdAt: new Date(),
  });
}

// ─── Dados Demo ─────────────────────────────────────────

// ─── CRUD de Serviços (Dono) ────────────────────────────
export async function addService(
  shopId: string,
  data: Omit<ServiceItem, 'id'>,
): Promise<string> {
  if (!db) return 'demo-svc-' + Date.now();
  const docRef = await addDoc(collection(db, 'barbershops', shopId, 'services'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateService(
  shopId: string,
  serviceId: string,
  data: Partial<ServiceItem>,
): Promise<void> {
  if (!db) return;
  const { id, ...rest } = data as any;
  await updateDoc(doc(db, 'barbershops', shopId, 'services', serviceId), rest);
}

export async function deleteService(shopId: string, serviceId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'barbershops', shopId, 'services', serviceId), { active: false });
}

// ─── Dados Demo (abaixo) ────────────────────────────────
function getDemoServices(): ServiceItem[] {
  return [
    { id: 's1', name: 'Corte Masculino', priceCents: 3500, durationMin: 30, active: true, description: 'Corte moderno com máquina e tesoura' },
    { id: 's2', name: 'Barba', priceCents: 2500, durationMin: 20, active: true, description: 'Barba feita com navalha e toalha quente' },
    { id: 's3', name: 'Corte + Barba', priceCents: 5500, durationMin: 50, active: true, description: 'Combo completo: corte e barba' },
    { id: 's4', name: 'Sobrancelha', priceCents: 1500, durationMin: 10, active: true, description: 'Design de sobrancelha masculina' },
    { id: 's5', name: 'Hidratação', priceCents: 4000, durationMin: 40, active: true, description: 'Hidratação capilar profunda' },
  ];
}

function getDemoStaff(): StaffItem[] {
  return [
    { uid: 'staff1', name: 'Carlos (Barbeiro)', active: true },
    { uid: 'staff2', name: 'Lucas (Barbeiro)', active: true },
    { uid: 'staff3', name: 'Rafael (Barbeiro)', active: true },
  ];
}

function getDemoSlots(): string[] {
  const today = new Date();
  const slots: string[] = [];
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      const d = new Date(today);
      d.setHours(h, m, 0, 0);
      if (d > today) slots.push(d.toISOString());
    }
  }
  return slots;
}

function getDemoAppointments(): Appointment[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(14, 30, 0, 0);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(11, 0, 0, 0);

  return [
    {
      id: 'apt1', shopId: 'demo', serviceId: 's1', serviceName: 'Corte Masculino',
      staffUid: 'staff1', staffName: 'Carlos', customerUid: 'demo-user', customerName: 'Demo',
      start: tomorrow.toISOString(), end: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
      durationMin: 30, status: 'confirmed', priceCents: 3500, createdAt: now.toISOString(),
    },
    {
      id: 'apt2', shopId: 'demo', serviceId: 's3', serviceName: 'Corte + Barba',
      staffUid: 'staff2', staffName: 'Lucas', customerUid: 'demo-user', customerName: 'Demo',
      start: yesterday.toISOString(), end: new Date(yesterday.getTime() + 50 * 60000).toISOString(),
      durationMin: 50, status: 'completed', priceCents: 5500, createdAt: yesterday.toISOString(),
    },
    {
      id: 'apt3', shopId: 'demo', serviceId: 's2', serviceName: 'Barba',
      staffUid: 'staff3', staffName: 'Rafael', customerUid: 'demo-user', customerName: 'Demo',
      start: lastWeek.toISOString(), end: new Date(lastWeek.getTime() + 20 * 60000).toISOString(),
      durationMin: 20, status: 'completed', priceCents: 2500, createdAt: lastWeek.toISOString(),
    },
  ];
}
