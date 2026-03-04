/* ============================
   BARBERPRO PWA — Data Models
   Mirrors mobile types/models.ts
   ============================ */

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
    pushToken?: string;
    createdAt?: any;
}

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
    [day: string]: { start: string; end: string; off?: boolean };
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
    paid?: boolean;
    cancelledBy?: string;
    cancelReason?: string;
    createdAt?: any;
}

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
    imageURL?: string;
    createdAt: any;
    read?: boolean;
}

export interface AppNotification {
    id: string;
    type: 'appointment' | 'reminder' | 'promotion' | 'system' | 'chat' | 'review';
    title: string;
    body: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: any;
}

export interface Review {
    id: string;
    shopId: string;
    appointmentId: string;
    customerUid: string;
    customerName?: string;
    customerPhoto?: string;
    staffUid?: string;
    staffName?: string;
    rating: number;
    comment?: string;
    reply?: string;
    repliedAt?: any;
    createdAt: any;
}
