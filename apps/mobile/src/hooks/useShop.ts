/* ============================
   BARBERPRO — Hook para dados da barbearia
   ============================ */
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUser } from '../store/user';
import type { Barbershop } from '../types/models';

export function useShop() {
  const shopId = useUser((s) => s.shopId);
  const [shop, setShop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !db) {
      setShop(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'barbershops', shopId),
      (snap) => {
        if (snap.exists()) {
          setShop({ ...(snap.data() as Barbershop) });
        } else {
          setShop(null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Erro ao carregar barbearia:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [shopId]);

  return { shop, shopId, loading };
}
