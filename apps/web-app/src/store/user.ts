/* ============================
   BARBERPRO PWA — User Store (Zustand)
   Same as mobile, no React Native deps
   ============================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, UserProfile } from '../types/models';

interface UserState {
    uid: string | null;
    role: UserRole | null;
    shopId: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    photoUrl: string | null;
    pushToken: string | null;
    isReady: boolean;
    isAuthenticated: boolean;
    isDemo: boolean;

    setAuth: (uid: string, role: UserRole, shopId?: string | null) => void;
    setProfile: (profile: Partial<UserProfile>) => void;
    setPushToken: (token: string | null) => void;
    setDemo: (role: UserRole, shopId?: string) => void;
    setReady: () => void;
    signOut: () => void;
}

export const useUser = create<UserState>()(
    persist(
        (set) => ({
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
        }),
        {
            name: 'barberpro-user', // localStorage key
            partialize: (state) => ({
                uid: state.uid,
                role: state.role,
                shopId: state.shopId,
                name: state.name,
                email: state.email,
                isAuthenticated: state.isAuthenticated,
                isDemo: state.isDemo,
            }),
        }
    )
);
