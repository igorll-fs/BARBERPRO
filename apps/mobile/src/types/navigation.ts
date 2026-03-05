/* ============================================
   BARBERPRO — Tipos de Navegação Centralizados
   ============================================ */
import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  OwnerSetup: undefined;
  OwnerOnboarding: undefined;
};

// ─── Customer Tabs ─────────────────────────────────────
export type CustomerTabParamList = {
  HomeCustomer: undefined;
  MyAppointments: undefined;  History: undefined;  Loyalty: undefined;
  ProfileCustomer: undefined;
};

// ─── Owner Tabs ────────────────────────────────────────
export type OwnerTabParamList = {
  DashboardOwner: undefined;
  ServicesManagement: undefined;
  TeamManagement: undefined;
  Reports: undefined;
  SettingsOwner: undefined;
};

// ─── Staff Tabs ────────────────────────────────────────
export type StaffTabParamList = {
  StaffCalendar: undefined;
  StaffClients: undefined;
  StaffChat: undefined;
  StaffProfile: undefined;
};

// ─── Root Stack (engloba tudo) ─────────────────────────
export type RootStackParamList = {
  // Auth
  Auth: NavigatorScreenParams<AuthStackParamList>;
  // Tabs por role
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  OwnerTabs: NavigatorScreenParams<OwnerTabParamList>;
  StaffTabs: NavigatorScreenParams<StaffTabParamList>;
  // Modais / telas empilhadas
  Booking: { shopId: string; serviceId?: string };
  Chat: { shopId: string; roomId: string; title?: string; customerId?: string };
  ChatList: undefined;
  Notifications: undefined;
  OwnerPaywall: undefined;
  OwnerSetup: undefined;
  OwnerOnboarding: undefined;
  ScheduleManagement: undefined;
  PromotionsManagement: undefined;
  InventoryManagement: undefined;
  RateAppointment: { shopId: string; appointmentId: string; serviceName?: string; staffName?: string };
  ReviewsList: { shopId: string };
  ServiceDetail: { shopId: string; serviceId: string };
  AppointmentDetail: { shopId: string; appointmentId: string };
  EditProfile: undefined;
  InviteStaff: { shopId: string };
  Inventory: { shopId: string };
  Promotions: { shopId: string };
  Settings: undefined;
};

// ─── Declaração global para react-navigation ──────────
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
