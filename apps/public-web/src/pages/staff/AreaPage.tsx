/* ============================
   BARBERPRO PWA — Área do Staff (melhorada)
   Agenda do dia + ações (confirmar, concluir, recusar)
   ============================ */
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../store/user';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Appointment, AppointmentStatus } from '../../services/scheduling';

// ─── Dados demo ─────────────────────────────────────────
function demoTodayAppointments(): Appointment[] {
  const now = new Date();
  const today = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: 'a1', shopId: 'demo', serviceId: 's1', serviceName: 'Corte Masculino',
      staffUid: 'demo-staff', staffName: 'Você', customerUid: 'c1', customerName: 'João Silva',
      start: today(9, 0), end: today(9, 30), durationMin: 30, status: 'confirmed', priceCents: 3500,
    },
    {
      id: 'a2', shopId: 'demo', serviceId: 's2', serviceName: 'Barba',
      staffUid: 'demo-staff', staffName: 'Você', customerUid: 'c2', customerName: 'Pedro Santos',
      start: today(10, 0), end: today(10, 30), durationMin: 30, status: 'pending', priceCents: 2500,
    },
    {
      id: 'a3', shopId: 'demo', serviceId: 's1', serviceName: 'Corte + Barba',
      staffUid: 'demo-staff', staffName: 'Você', customerUid: 'c3', customerName: 'Lucas Oliveira',
      start: today(11, 0), end: today(12, 0), durationMin: 60, status: 'pending', priceCents: 5500,
    },
    {
      id: 'a4', shopId: 'demo', serviceId: 's3', serviceName: 'Degradê',
      staffUid: 'demo-staff', staffName: 'Você', customerUid: 'c4', customerName: 'Rafael Costa',
      start: today(14, 0), end: today(14, 45), durationMin: 45, status: 'confirmed', priceCents: 4000,
    },
  ];
}

// ─── Helpers ────────────────────────────────────────────
function formatTime(iso: string | any): string {
  const d = iso?.toDate ? iso.toDate() : new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

const statusConfig: Record<AppointmentStatus, { label: string; icon: string; color: string; bg: string }> = {
  pending:   { label: 'Pendente',   icon: '🕐', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  confirmed: { label: 'Confirmado', icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  completed: { label: 'Concluído',  icon: '✔️', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  cancelled: { label: 'Cancelado',  icon: '❌', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  'no-show': { label: 'No-show',    icon: '👻', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
};

export default function StaffArea() {
  const { name, uid, shopId, isDemo } = useUser();
  const sid = shopId || 'demo';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'past'>('today');
  const [toast, setToast] = useState('');

  // ─── Saudação ─────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // ─── Carregar ─────────────────────────────────────────
  const loadAppointments = async () => {
    setLoading(true);
    if (isDemo || !db) {
      setAppointments(demoTodayAppointments());
      setLoading(false);
      return;
    }
    try {
      const ref = collection(db, 'barbershops', sid, 'appointments');
      const q = query(ref, where('staffUid', '==', uid), orderBy('start', 'asc'));
      const snap = await getDocs(q);
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
      setAppointments(demoTodayAppointments());
    }
    setLoading(false);
  };

  useEffect(() => { loadAppointments(); }, [sid, uid]);

  // ─── Filtrar ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    return appointments.filter((a) => {
      const d = a.start?.toDate ? a.start.toDate() : new Date(a.start);
      if (filter === 'today') return d >= todayStart && d < todayEnd;
      if (filter === 'upcoming') return d >= todayEnd;
      return d < todayStart;
    });
  }, [appointments, filter]);

  // ─── Stats do dia ─────────────────────────────────────
  const todayAppts = useMemo(() => {
    const now = new Date();
    const ts = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const te = new Date(ts.getTime() + 86400000);
    return appointments.filter((a) => {
      const d = a.start?.toDate ? a.start.toDate() : new Date(a.start);
      return d >= ts && d < te;
    });
  }, [appointments]);

  const todayPending = todayAppts.filter((a) => a.status === 'pending').length;
  const todayConfirmed = todayAppts.filter((a) => a.status === 'confirmed').length;
  const todayRevenue = todayAppts.filter((a) => a.status === 'completed').reduce((s, a) => s + (a.priceCents || 0), 0);

  // ─── Ações ────────────────────────────────────────────
  const updateStatus = async (apptId: string, status: AppointmentStatus, label: string) => {
    if (isDemo) {
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, status } : a));
      showToast(label);
      return;
    }
    setActionLoading(apptId);
    try {
      await updateDoc(doc(db!, 'barbershops', sid, 'appointments', apptId), { status });
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, status } : a));
      showToast(label);
    } catch (err: any) {
      alert(err.message || 'Erro');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Saudação */}
      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{greeting} 👋</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{name?.split(' ')[0] || 'Barbeiro'}</h1>
      </div>

      {/* Stats do dia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div className="card" style={{ padding: '10px 6px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{todayAppts.length}</p>
          <p className="text-muted" style={{ fontSize: 10 }}>Hoje</p>
        </div>
        <div className="card" style={{ padding: '10px 6px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{todayPending}</p>
          <p className="text-muted" style={{ fontSize: 10 }}>Pendentes</p>
        </div>
        <div className="card" style={{ padding: '10px 6px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{todayConfirmed}</p>
          <p className="text-muted" style={{ fontSize: 10 }}>Confirmados</p>
        </div>
        <div className="card" style={{ padding: '10px 6px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(todayRevenue)}</p>
          <p className="text-muted" style={{ fontSize: 10 }}>Faturado</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['today', 'upcoming', 'past'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: filter === f ? 'var(--primary)' : 'var(--bg-secondary)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {f === 'today' ? '📅 Hoje' : f === 'upcoming' ? '📆 Próximos' : '📜 Passados'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center" style={{ padding: 40 }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p className="text-muted mt-lg">
            {filter === 'today' ? 'Nenhum agendamento hoje' : filter === 'upcoming' ? 'Nenhum agendamento futuro' : 'Nenhum histórico'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((appt) => {
            const sc = statusConfig[appt.status];
            const isActionable = appt.status === 'pending' || appt.status === 'confirmed';
            return (
              <div key={appt.id} className="card" style={{ padding: '14px 16px' }}>
                {/* Horário + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>
                    {formatTime(appt.start)}
                  </span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    color: sc.color, background: sc.bg,
                  }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>

                {/* Info */}
                <p style={{ fontWeight: 600, fontSize: 15 }}>{appt.customerName || 'Cliente'}</p>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {appt.serviceName || 'Serviço'} · {appt.durationMin}min
                  {appt.priceCents ? ` · ${formatPrice(appt.priceCents)}` : ''}
                </p>

                {/* Ações */}
                {isActionable && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
                    {appt.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => updateStatus(appt.id, 'confirmed', '✅ Confirmado!')}
                          disabled={actionLoading === appt.id}
                          style={{ flex: 1, fontSize: 13, padding: '8px' }}
                        >
                          ✅ Confirmar
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            if (confirm('Recusar este agendamento?')) {
                              updateStatus(appt.id, 'cancelled', '❌ Recusado');
                            }
                          }}
                          disabled={actionLoading === appt.id}
                          style={{ flex: 1, fontSize: 13, padding: '8px', color: 'var(--danger)' }}
                        >
                          ❌ Recusar
                        </button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => updateStatus(appt.id, 'completed', '✔️ Concluído!')}
                          disabled={actionLoading === appt.id}
                          style={{ flex: 1, fontSize: 13, padding: '8px' }}
                        >
                          ✔️ Concluir
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => updateStatus(appt.id, 'no-show', '👻 No-show registrado')}
                          disabled={actionLoading === appt.id}
                          style={{ flex: 1, fontSize: 13, padding: '8px' }}
                        >
                          👻 No-show
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--card)', color: 'var(--text)', padding: '10px 20px',
          borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: 14,
          fontWeight: 600, animation: 'fadeIn 0.3s ease', zIndex: 999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
