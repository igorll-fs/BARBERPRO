/* ============================
   BARBERPRO PWA — Auth Hook
   Ouve Firebase Auth e sincroniza store
   ============================ */
import { useEffect } from 'react';
import { useUser } from '../store/user';
import { onAuthChange, getClaims } from '../services/auth';
import type { UserRole } from '../types';

export function useAuthListener() {
  const { setAuth, setReady, signOut } = useUser();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const claims = await getClaims();
          const role = (claims.role as UserRole) || 'cliente';
          const shopId = claims.shopId || null;
          setAuth(firebaseUser.uid, role, shopId);
        } catch {
          setAuth(firebaseUser.uid, 'cliente');
        }
      } else {
        signOut();
      }
      setReady();
    });

    return () => unsub();
  }, [setAuth, setReady, signOut]);
}
