/* ============================
   BARBERPRO — User Store (Zustand)
   Persiste auth state + claims
   ============================ */
import { create } from 'zustand';
import type { UserRole, UserProfile } from '../types/models';

interface UserState {
  // Auth
  uid: string | null;
  role: UserRole | null;
  shopId: string | null;

  // Profile
  name: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  pushToken: string | null;

  // Status
  isReady: boolean;        // Auth listener inicializado
  isAuthenticated: boolean;
  isDemo: boolean;         // Modo demo (sem Firebase)

  // Actions
  setAuth: (uid: string, role: UserRole, shopId?: string | null) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  setPushToken: (token: string | null) => void;
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
  pushToken: null,
  isReady: false,
  isAuthenticated: false,
  isDemo: false,

  setAuth: (uid, role, shopId = null) =>
    set({ uid, role, shopId, isAuthenticated: true, isDemo: false }),

  setProfile: (profile) =>
    set((state) => ({
      name: profile.name ?? state.name,
      email: profile.email ?? state.email,
      phone: profile.phone ?? state.phone,
      photoUrl: profile.photoUrl ?? state.photoUrl,
    })),

  setPushToken: (token) => set({ pushToken: token }),

  setDemo: (role, shopId = 'demo') =>
    set({ uid: 'demo-user', role, shopId, isAuthenticated: true, isDemo: true, name: `Demo ${role}` }),

  setReady: () => set({ isReady: true }),

  signOut: () =>
    set({
      uid: null, role: null, shopId: null,
      name: null, email: null, phone: null, photoUrl: null,
      pushToken: null, isAuthenticated: false, isDemo: false,
    }),
}));
