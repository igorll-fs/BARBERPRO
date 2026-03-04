/* ============================
   BARBERPRO PWA — Meus Agendamentos
   Lista com status, cancelar, avaliar
   ============================ */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../store/user';
import {
  listenMyAppointments, cancelAppointment,
  type Appointment, type AppointmentStatus,
} from '../../services/scheduling';

// ─── Helpers ────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  confirmed: { label: 'Confirmado', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  cancelled: { label: 'Cancelado', color: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },
  completed: { label: 'Concluído', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  'no-show': { label: 'Não compareceu', color: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },
};

type TabFilter = 'upcoming' | 'past';

export default function AppointmentsPage() {
  const { shopId, uid, isDemo } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const sid = shopId || 'demo';
  const userId = uid || 'demo-user';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>('upcoming');
  const [showBooked, setShowBooked] = useState(false);

  // Toast de sucesso ao vir do booking
  useEffect(() => {
    if ((location.state as any)?.booked) {
      setShowBooked(true);
      window.history.replaceState({}, '');
      setTimeout(() => setShowBooked(false), 3000);
    }
  }, [location.state]);

  // ─── Listener Real-time ───────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = listenMyAppointments(sid, userId, (data) => {
      setAppointments(data);
      setLoading(false);
    });
    return unsub;
  }, [sid, userId]);

  // ─── Filtrar por tab ──────────────────────────────────
  const now = new Date();
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const start = new Date(a.start);
      if (tab === 'upcoming') {
        return start >= now && !['cancelled', 'completed', 'no-show'].includes(a.status);
      }
      return start < now || ['cancelled', 'completed', 'no-show'].includes(a.status);
    });
  }, [appointments, tab]);

  // ─── Cancelar ─────────────────────────────────────────
  const handleCancel = async (apt: Appointment) => {
    if (!confirm(`Cancelar agendamento de ${apt.serviceName || 'serviço'}?`)) return;
    setCancelling(apt.id);
    try {
      if (!isDemo) {
        await cancelAppointment(sid, apt.id);
      }
      // Atualizar localmente em demo
      setAppointments((prev) =>
        prev.map((a) => a.id === apt.id ? { ...a, status: 'cancelled' as AppointmentStatus } : a),
      );
    } catch {
      alert('Erro ao cancelar. Tente novamente.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Toast de sucesso */}
      {showBooked && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--primary)', color: '#fff', padding: '12px 24px',
          borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 200,
          boxShadow: '0 8px 32px rgba(16,185,129,0.3)', animation: 'fadeIn 0.3s ease',
        }}>
          ✅ Agendamento criado com sucesso!
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20, marginTop: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Meus Agendamentos</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['upcoming', 'past'] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              background: tab === t ? 'var(--primary)' : 'var(--card)',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t === 'upcoming' ? '📅 Próximos' : '📜 Histórico'}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        /* Empty */
        <div className="text-center" style={{ padding: 60 }}>
          <p style={{ fontSize: 56 }}>{tab === 'upcoming' ? '📭' : '📋'}</p>
          <p className="text-muted mt-lg">
            {tab === 'upcoming' ? 'Nenhum agendamento futuro' : 'Nenhum agendamento anterior'}
          </p>
          {tab === 'upcoming' && (
            <button className="btn btn-primary mt-xl" style={{ width: 'auto' }} onClick={() => navigate('/app/booking')}>
              Agendar Agora
            </button>
          )}
        </div>
      ) : (
        /* Lista */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((apt) => {
            const status = statusConfig[apt.status] || statusConfig.pending;
            const canCancel = ['pending', 'confirmed'].includes(apt.status) && new Date(apt.start) > now;
            const canReview = apt.status === 'completed';

            return (
              <div key={apt.id} className="card" style={{ padding: '16px 20px' }}>
                {/* Título + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16 }}>{apt.serviceName || 'Serviço'}</p>
                    {apt.staffName && (
                      <p className="text-muted text-sm" style={{ marginTop: 2 }}>✂️ {apt.staffName}</p>
                    )}
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    color: status.color, background: status.bg,
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Data + Hora + Preço */}
                <div style={{
                  display: 'flex', gap: 16, flexWrap: 'wrap',
                  padding: '10px 0', borderTop: '1px solid var(--border-light)',
                  borderBottom: canCancel || canReview ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div>
                    <p className="text-muted text-xs">Data</p>
                    <p style={{ fontWeight: 500, fontSize: 14, marginTop: 2 }}>{formatDate(apt.start)}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Horário</p>
                    <p style={{ fontWeight: 500, fontSize: 14, marginTop: 2 }}>{formatTime(apt.start)}</p>
                  </div>
                  {apt.priceCents && (
                    <div>
                      <p className="text-muted text-xs">Valor</p>
                      <p style={{ fontWeight: 600, fontSize: 14, marginTop: 2, color: 'var(--primary)' }}>
                        {formatPrice(apt.priceCents)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                {(canCancel || canReview) && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {canCancel && (
                      <button
                        className="btn btn-outline"
                        onClick={() => handleCancel(apt)}
                        disabled={cancelling === apt.id}
                        style={{ flex: 1, padding: '8px 12px', fontSize: 13, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        {cancelling === apt.id ? 'Cancelando...' : '✕ Cancelar'}
                      </button>
                    )}
                    {canReview && (
                      <button
                        className="btn btn-outline"
                        onClick={() => navigate(`/app/review/${apt.id}`)}
                        style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                      >
                        ⭐ Avaliar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
