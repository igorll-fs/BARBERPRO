/* ============================
   BARBERPRO — Serviço de Confirmação de Agendamentos
   ============================ */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/** Confirmar agendamento (Staff/Dono) */
export async function confirmAppointment(shopId: string, appointmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'confirmAppointment');
  await fn({ shopId, appointmentId });
}

/** Recusar agendamento (Staff/Dono) */
export async function rejectAppointment(shopId: string, appointmentId: string, reason?: string): Promise<void> {
  const fn = httpsCallable(functions, 'rejectAppointment');
  await fn({ shopId, appointmentId, reason });
}

/**  Marcar como no-show manualmente (Staff/Dono) */
export async function markNoShow(shopId: string, appointmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'markNoShow');
  await fn({ shopId, appointmentId });
}
