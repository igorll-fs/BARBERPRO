/* ============================
   BARBERPRO — Modelos de Dados
   ============================ */

// ─── Usuário ────────────────────────────────────────────
export type UserRole = 'cliente' | 'dono' | 'funcionario';

export interface UserProfile {
  uid: string;
  role: UserRole;
  shopId?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  blocked?: boolean;
  blockedReason?: string;
  noShowCount?: number;
  pushToken?: string;
  createdAt?: any;
}

// ─── Barbearia ──────────────────────────────────────────
export interface Barbershop {
  name: string;
  slug: string;
  ownerUid: string;
  address?: string;
  geo?: { lat: number; lng: number };
  photos?: string[];
  phone?: string;
  description?: string;
  subscription: {
    status: 'active' | 'inactive' | 'canceled' | 'trial';
    plan?: 'monthly' | 'yearly';
    renewAt?: any;
    stripe?: { customer?: string };
  };
  dailyLimitPerCustomer?: number;
  createdAt?: any;
}

// ─── Serviço ────────────────────────────────────────────
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

// ─── Staff / Barbeiro ───────────────────────────────────
export interface StaffMember {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  active: boolean;
  joinedAt?: any;
  schedule?: WeeklySchedule;
}

export interface WeeklySchedule {
  [day: string]: { start: string; end: string; off?: boolean }; // "mon": { start: "09:00", end: "18:00" }
}

// ─── Agendamento ────────────────────────────────────────
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
  start: any; // Firestore Timestamp or Date
  end: any;
  durationMin: number;
  status: AppointmentStatus;
  priceCents?: number;
  paid?: boolean;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt?: any;
}

// ─── Promoções ──────────────────────────────────────────
export type PromoType = 'discount' | 'bundle' | 'loyalty' | 'flash';

export interface Promotion {
  id: string;
  type: PromoType;
  title: string;
  description?: string;
  discountPercent?: number;
  discountCents?: number;
  active: boolean;
  startsAt?: any;
  expiresAt?: any;
  usageLimit?: number;
  usageCount?: number;
  serviceIds?: string[];
  createdAt?: any;
}

// ─── Fidelidade ─────────────────────────────────────────
export interface LoyaltyRecord {
  customerUid: string;
  points: number;
  visits: number;
  progress: Record<string, number>; // serviceId → count
  rewards: LoyaltyReward[];
}

export interface LoyaltyReward {
  id: string;
  type: 'free_service' | 'discount' | 'gift';
  value: number;
  description: string;
  redeemed: boolean;
  expiresAt?: any;
}

// ─── Estoque ────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  qty: number;
  minQty: number;
  priceCents: number;
  category?: string;
  photoUrl?: string;
}

export interface InventoryMovement {
  type: 'in' | 'out';
  qty: number;
  at: any;
  note?: string;
  byUid?: string;
}

// ─── Stories ────────────────────────────────────────────
export interface Story {
  id: string;
  mediaUrl: string;
  caption?: string;
  createdAt: any;
  expiresAt: any;
}

// ─── Chat ───────────────────────────────────────────────
export interface ChatRoom {
  id: string;
  shopId: string;
  customerUid: string;
  customerName?: string;
  lastMessage?: string;
  lastMessageAt?: any;
  unread?: number;
}

export interface ChatMessage {
  id: string;
  fromUid: string;
  text: string;
  mediaUrl?: string;
  createdAt: any;
}

// ─── Notificações ───────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'appointment' | 'reminder' | 'promotion' | 'system' | 'chat' | 'review';
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: any;
}

// ─── Avaliações ─────────────────────────────────────────
export interface Review {
  id: string;
  shopId: string;
  appointmentId: string;
  customerUid: string;
  customerName?: string;
  customerPhoto?: string;
  staffUid?: string;
  staffName?: string;
  rating: number; // 1-5
  comment?: string;
  reply?: string; // Resposta do dono
  repliedAt?: any;
  createdAt: any;
}

// ─── Relatórios ─────────────────────────────────────────
export interface DailyReport {
  date: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  newCustomers: number;
  topServices: { serviceId: string; name: string; count: number; revenue: number }[];
}
