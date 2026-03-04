/* ============================
   BARBERPRO PWA — Types
   Compartilhados com mobile
   ============================ */

export type UserRole = 'cliente' | 'dono' | 'funcionario';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  role: UserRole;
  shopId?: string;
}
