import React from 'react';
import Badge from './Badge';
import type { AppointmentStatus } from '../types/models';

const map: Record<AppointmentStatus, { text: string; variant: 'primary' | 'danger' | 'warning' | 'info' | 'success' }> = {
  pending: { text: 'Pendente', variant: 'warning' },
  confirmed: { text: 'Confirmado', variant: 'info' },
  completed: { text: 'Concluído', variant: 'success' },
  cancelled: { text: 'Cancelado', variant: 'danger' },
  'no-show': { text: 'Faltou', variant: 'danger' },
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = map[status] || map.pending;
  return <Badge text={cfg.text} variant={cfg.variant} />;
}
