/* ============================
   BARBERPRO PWA — Serviço de Eventos
   CRUD de comunicados/promoções do dono
   ============================ */
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Tipos ──────────────────────────────────────────────
export type EventType = 'comunicado' | 'promocao' | 'evento';

export interface ShopEvent {
  id: string;
  shopId: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: EventType;
  active: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt?: any;
}

// ─── Listar Eventos ─────────────────────────────────────
export async function listEvents(shopId: string): Promise<ShopEvent[]> {
  if (!db) return getDemoEvents();
  try {
    const q = query(
      collection(db, 'barbershops', shopId, 'events'),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch {
    return getDemoEvents();
  }
}

// ─── Listar Eventos Ativos (para página pública) ────────
export async function listActiveEvents(shopId: string): Promise<ShopEvent[]> {
  const events = await listEvents(shopId);
  const now = new Date().toISOString();
  return events.filter((e) => {
    if (!e.active) return false;
    if (e.expiresAt && e.expiresAt < now) return false;
    return true;
  });
}

// ─── Criar Evento ───────────────────────────────────────
export async function addEvent(shopId: string, data: Omit<ShopEvent, 'id' | 'shopId' | 'createdAt'>): Promise<string> {
  if (!db) return 'demo-event-' + Date.now();
  const docRef = await addDoc(collection(db, 'barbershops', shopId, 'events'), {
    ...data,
    shopId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Atualizar Evento ───────────────────────────────────
export async function updateEvent(shopId: string, eventId: string, data: Partial<ShopEvent>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'barbershops', shopId, 'events', eventId), data);
}

// ─── Deletar Evento ─────────────────────────────────────
export async function deleteEvent(shopId: string, eventId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'barbershops', shopId, 'events', eventId));
}

// ─── Dados Demo ─────────────────────────────────────────
function getDemoEvents(): ShopEvent[] {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'evt1', shopId: 'demo', title: '🎉 Inauguração da Nova Cadeira',
      description: 'Venha conhecer nossa nova cadeira de barbeiro premium! Cortes com desconto na primeira semana.',
      type: 'comunicado', active: true, createdAt: now.toISOString(),
    },
    {
      id: 'evt2', shopId: 'demo', title: '💈 Promoção Corte + Barba',
      description: 'Combo Corte + Barba por apenas R$ 45,00! Válido até o final do mês.',
      type: 'promocao', active: true, expiresAt: nextWeek.toISOString(), createdAt: now.toISOString(),
    },
    {
      id: 'evt3', shopId: 'demo', title: '🏆 Campeonato de Barbeiros',
      description: 'Nosso barbeiro Carlos vai participar do Campeonato Regional! Venha torcer!',
      type: 'evento', active: true, startsAt: nextWeek.toISOString(), createdAt: now.toISOString(),
    },
  ];
}
