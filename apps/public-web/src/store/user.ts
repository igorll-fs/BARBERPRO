/* ============================
   BARBERPRO PWA — User Store (Zustand)
   Mesmo padrão do mobile
   ============================ */
import { create } from 'zustand';
import type { UserRole } from '../types';

interface UserState {
  uid: string | null;
  role: UserRole | null;
  shopId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;

  setAuth: (uid: string, role: UserRole, shopId?: string | null) => void;
  setProfile: (data: { name?: string; phone?: string; photoUrl?: string }) => void;
  setDemo: (role: UserRole, shopId?: string) => void;
  setReady: () => void;
  signOut: () => void;
}

export const useUser = create<UserState>((set) => ({
  uid: null,
  role: null,
  shopId: null,
  name: null,
  email: null,
  phone: null,
  photoUrl: null,
  isReady: false,
  isAuthenticated: false,
  isDemo: false,

  setAuth: (uid, role, shopId = null) =>
    set({ uid, role, shopId, isAuthenticated: true, isDemo: false }),

  setProfile: (data) => set((s) => ({ ...s, ...data })),

  setDemo: (role, shopId = 'demo') =>
    set({ uid: 'demo-user', role, shopId, isAuthenticated: true, isDemo: true, name: `Demo ${role}` }),

  setReady: () => set({ isReady: true }),

  signOut: () =>
    set({
      uid: null, role: null, shopId: null,
      name: null, email: null, phone: null, photoUrl: null,
      isAuthenticated: false, isDemo: false,
    }),
}));
