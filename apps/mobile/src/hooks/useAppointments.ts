/* ============================
   BARBERPRO — Hook de agendamentos em tempo real
   ============================ */
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUser } from '../store/user';
import type { Appointment } from '../types/models';

export function useAppointments(mode: 'customer' | 'staff' | 'shop' = 'customer') {
  const { uid, shopId } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !uid || !db) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const apptRef = collection(db, 'barbershops', shopId, 'appointments');
    let q;

    if (mode === 'customer') {
      q = query(apptRef, where('customerUid', '==', uid), orderBy('start', 'desc'));
    } else if (mode === 'staff') {
      q = query(apptRef, where('staffUid', '==', uid), orderBy('start', 'desc'));
    } else {
      q = query(apptRef, orderBy('start', 'desc'));
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Appointment[];
        setAppointments(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Erro ao carregar agendamentos:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid, shopId, mode]);

  const upcoming = appointments.filter((a) => {
    const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    return s > new Date() && (a.status === 'pending' || a.status === 'confirmed');
  });

  const past = appointments.filter((a) => {
    const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    return s <= new Date() || a.status === 'completed' || a.status === 'cancelled' || a.status === 'no-show';
  });

  return { appointments, upcoming, past, loading };
}
