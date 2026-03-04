/* ============================
   BARBERPRO — Hook de Notificações
   Contador de não lidas + mark as read
   ============================ */
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUser } from '../store/user';

export function useNotifications() {
  const { uid } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!uid || !db) return;

    const q = query(
      collection(db, 'users', uid, 'notifications'),
      where('read', '==', false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [uid]);

  return { unreadCount };
}
