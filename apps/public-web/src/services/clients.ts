/* ============================
   BARBERPRO PWA — Serviço de Clientes
   Agrega clientes únicos a partir dos agendamentos
   ============================ */
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Tipos ──────────────────────────────────────────────
export interface ClientInfo {
  uid: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  totalVisits: number;
  totalSpent: number;      // centavos
  lastVisit: string | null; // ISO
  firstVisit: string | null;
  noShows: number;
}

// ─── Listar Clientes da Barbearia ───────────────────────
// Agrega dados únicos por customerUid dos agendamentos
export async function listShopClients(shopId: string): Promise<ClientInfo[]> {
  if (!db) return demoClients();

  try {
    const ref = collection(db, 'barbershops', shopId, 'appointments');
    const q = query(ref, orderBy('start', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) return demoClients();

    // Agregar por customerUid
    const map = new Map<string, ClientInfo>();

    snap.docs.forEach((d) => {
      const data = d.data();
      const uid = data.customerUid as string;
      if (!uid) return;

      const startStr = data.start?.toDate?.()
        ? data.start.toDate().toISOString()
        : typeof data.start === 'string' ? data.start : null;

      const status = data.status as string;
      const price = (data.priceCents as number) || 0;
      const isCompleted = status === 'completed' || status === 'confirmed';
      const isNoShow = status === 'no-show';

      if (map.has(uid)) {
        const c = map.get(uid)!;
        c.totalVisits += isCompleted ? 1 : 0;
        c.totalSpent += isCompleted ? price : 0;
        c.noShows += isNoShow ? 1 : 0;
        // Primeiro e último (já ordenado desc)
        if (startStr) {
          if (!c.firstVisit || startStr < c.firstVisit) c.firstVisit = startStr;
        }
      } else {
        map.set(uid, {
          uid,
          name: (data.customerName as string) || 'Cliente',
          totalVisits: isCompleted ? 1 : 0,
          totalSpent: isCompleted ? price : 0,
          lastVisit: startStr,
          firstVisit: startStr,
          noShows: isNoShow ? 1 : 0,
        });
      }
    });

    // Tentar enriquecer com dados do perfil (users/{uid})
    const clients = Array.from(map.values());
    await Promise.allSettled(
      clients.map(async (c) => {
        try {
          const userDoc = await getDoc(doc(db!, 'users', c.uid));
          if (userDoc.exists()) {
            const u = userDoc.data();
            if (u.name) c.name = u.name;
            if (u.phone) c.phone = u.phone;
            if (u.photoUrl) c.photoUrl = u.photoUrl;
          }
        } catch {}
      }),
    );

    // Ordenar por última visita (mais recente primeiro)
    clients.sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return b.lastVisit.localeCompare(a.lastVisit);
    });

    return clients;
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    return demoClients();
  }
}

// ─── Dados Demo ─────────────────────────────────────────
function demoClients(): ClientInfo[] {
  const now = new Date();
  return [
    {
      uid: 'demo-c1', name: 'João Silva', phone: '(11) 99999-1234',
      totalVisits: 12, totalSpent: 48000, noShows: 0,
      lastVisit: new Date(now.getTime() - 2 * 86400000).toISOString(),
      firstVisit: new Date(now.getTime() - 180 * 86400000).toISOString(),
    },
    {
      uid: 'demo-c2', name: 'Pedro Santos', phone: '(11) 98888-5678',
      totalVisits: 8, totalSpent: 32000, noShows: 1,
      lastVisit: new Date(now.getTime() - 5 * 86400000).toISOString(),
      firstVisit: new Date(now.getTime() - 120 * 86400000).toISOString(),
    },
    {
      uid: 'demo-c3', name: 'Lucas Oliveira', phone: '(11) 97777-9012',
      totalVisits: 5, totalSpent: 17500, noShows: 0,
      lastVisit: new Date(now.getTime() - 10 * 86400000).toISOString(),
      firstVisit: new Date(now.getTime() - 90 * 86400000).toISOString(),
    },
    {
      uid: 'demo-c4', name: 'Rafael Costa',
      totalVisits: 3, totalSpent: 10500, noShows: 0,
      lastVisit: new Date(now.getTime() - 15 * 86400000).toISOString(),
      firstVisit: new Date(now.getTime() - 60 * 86400000).toISOString(),
    },
    {
      uid: 'demo-c5', name: 'André Souza', phone: '(11) 96666-3456',
      totalVisits: 1, totalSpent: 3500, noShows: 1,
      lastVisit: new Date(now.getTime() - 30 * 86400000).toISOString(),
      firstVisit: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
  ];
}
