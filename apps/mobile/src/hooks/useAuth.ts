/* ============================
   BARBERPRO — Hook de Autenticação
   Ouve onAuthStateChanged e sincroniza com store
   ============================ */
import { useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { getClaims } from '../services/claims';
import { useUser } from '../store/user';
import type { UserRole } from '../types/models';

export function useAuthListener() {
  const { setAuth, setProfile, setReady, signOut: clearStore } = useUser();

  useEffect(() => {
    // Se Firebase auth não inicializou, marcar como ready sem auth
    if (!auth) {
      setReady();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar claims (role, shopId)
          const claims = await getClaims();
          const role = (claims.role as UserRole) || 'cliente';
          const shopId = (claims.shopId as string) || null;
          setAuth(firebaseUser.uid, role, shopId);

          // Buscar perfil do Firestore
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setProfile({
                name: data.name || firebaseUser.displayName || null,
                email: data.email || firebaseUser.email || null,
                phone: data.phone || firebaseUser.phoneNumber || null,
                photoUrl: data.photoUrl || firebaseUser.photoURL || null,
              });
            } else {
              setProfile({
                name: firebaseUser.displayName || null,
                email: firebaseUser.email || null,
                phone: firebaseUser.phoneNumber || null,
                photoUrl: firebaseUser.photoURL || null,
              });
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar perfil:', err);
          // Manter autenticado mesmo com erro no perfil
          setAuth(firebaseUser.uid, 'cliente', null);
        }
      } else {
        clearStore();
      }
      setReady();
    });

    return () => unsubscribe();
  }, []);
}

export async function doSignOut() {
  try {
    if (auth) await firebaseSignOut(auth);
  } catch {}
  useUser.getState().signOut();
}
