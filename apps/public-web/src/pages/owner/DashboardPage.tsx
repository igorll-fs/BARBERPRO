/* ============================
   BARBERPRO PWA — Dashboard Dono (com dados reais)
   KPIs + agenda do dia + atalhos rápidos
   ============================ */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useUser } from '../../store/user';
import type { Appointment } from '../../services/scheduling';

// ─── Helpers ────────────────────────────────────────────
function fmt(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatTime(iso: string | any): string {
  const d = iso?.toDate ? iso.toDate() : new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Demo ───────────────────────────────────────────────
function demoAppointments(): Appointment[] {
  const now = new Date();
  const today = (h: number, m: number) => {
    const d = new Date(now); d.setHours(h, m, 0, 0); return d.toISOString();
  };
  const past = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
  return [
    { id: '1', shopId: 'demo', serviceId: 's1', serviceName: 'Corte Masculino', staffUid: 's1', staffName: 'Carlos', customerUid: 'c1', customerName: 'João', start: today(9, 0), end: today(9, 30), durationMin: 30, status: 'confirmed', priceCents: 3500 },
    { id: '2', shopId: 'demo', serviceId: 's2', serviceName: 'Barba', staffUid: 's2', staffName: 'Lucas', customerUid: 'c2', customerName: 'Pedro', start: today(10, 30), end: today(11, 0), durationMin: 30, status: 'pending', priceCents: 2500 },
    { id: '3', shopId: 'demo', serviceId: 's1', serviceName: 'Corte + Barba', staffUid: 's1', staffName: 'Carlos', customerUid: 'c3', customerName: 'Lucas', start: today(14, 0), end: today(15, 0), durationMin: 60, status: 'confirmed', priceCents: 5500 },
    { id: '4', shopId: 'demo', serviceId: 's3', serviceName: 'Degradê', staffUid: 's3', staffName: 'Rafael', customerUid: 'c4', customerName: 'André', start: today(16, 0), end: today(16, 45), durationMin: 45, status: 'pending', priceCents: 4000 },
    // Passados (para KPIs da semana)
    { id: '5', shopId: 'demo', serviceId: 's1', serviceName: 'Corte', staffUid: 's1', staffName: 'Carlos', customerUid: 'c5', customerName: 'Marcos', start: past(1), end: past(1), durationMin: 30, status: 'completed', priceCents: 3500 },
    { id: '6', shopId: 'demo', serviceId: 's2', serviceName: 'Barba', staffUid: 's2', staffName: 'Lucas', customerUid: 'c6', customerName: 'Thiago', start: past(2), end: past(2), durationMin: 30, status: 'completed', priceCents: 2500 },
    { id: '7', shopId: 'demo', serviceId: 's1', serviceName: 'Corte', staffUid: 's1', staffName: 'Carlos', customerUid: 'c7', customerName: 'Bruno', start: past(3), end: past(3), durationMin: 30, status: 'completed', priceCents: 3500 },
  ];
}

export default function OwnerDashboard() {
  const { name, shopId, isDemo } = useUser();
  const sid = shopId || 'demo';
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // ─── Carregar ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (isDemo || !db) { setAppointments(demoAppointments()); setLoading(false); return; }
      try {
        const snap = await getDocs(collection(db, 'barbershops', sid, 'appointments'));
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch { setAppointments(demoAppointments()); }
      setLoading(false);
    };
    load();
  }, [sid, isDemo]);

  // ─── Filtros ──────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const weekStart = new Date(now.getTime() - 7 * 86400000);

  const todayAppts = useMemo(() => appointments.filter((a) => {
    const d = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    return d >= todayStart && d < todayEnd;
  }).sort((a, b) => {
    const da = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    const db2 = b.start?.toDate ? b.start.toDate() : new Date(b.start);
    return da.getTime() - db2.getTime();
  }), [appointments]);

  const weekAppts = useMemo(() => appointments.filter((a) => {
    const d = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    return d >= weekStart;
  }), [appointments]);

  // ─── KPIs ─────────────────────────────────────────────
  const todayCount = todayAppts.length;
  const todayRevenue = todayAppts.filter((a) => a.status === 'completed').reduce((s, a) => s + (a.priceCents || 0), 0);
  const weekRevenue = weekAppts.filter((a) => a.status === 'completed').reduce((s, a) => s + (a.priceCents || 0), 0);
  const weekCompleted = weekAppts.filter((a) => a.status === 'completed').length;
  const pendingToday = todayAppts.filter((a) => a.status === 'pending').length;

  // ─── Atalhos ──────────────────────────────────────────
  const shortcuts = [
    { icon: '👥', label: 'Equipe', to: '/app/team' },
    { icon: '📢', label: 'Eventos', to: '/app/events' },
    { icon: '💬', label: 'Chat', to: '/app/chat' },
    { icon: '📊', label: 'Relatórios', to: '/app/reports' },
    { icon: '💳', label: 'Assinatura', to: '/app/subscription' },
  ];

  const statusColor: Record<string, string> = {
    pending: '#F59E0B', confirmed: '#10B981', completed: '#3B82F6',
    cancelled: '#EF4444', 'no-show': '#8B5CF6',
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Saudação */}
      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{greeting} 👋</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{name?.split(' ')[0] || 'Dono'}</h1>
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700 }}>{todayCount}</p>
              <p className="text-muted" style={{ fontSize: 11 }}>📅 Agendamentos Hoje</p>
              {pendingToday > 0 && (
                <p style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>{pendingToday} pendente{pendingToday > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{fmt(todayRevenue)}</p>
              <p className="text-muted" style={{ fontSize: 11 }}>💰 Faturado Hoje</p>
            </div>
            <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{fmt(weekRevenue)}</p>
              <p className="text-muted" style={{ fontSize: 11 }}>📈 Receita Semana</p>
            </div>
            <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700 }}>{weekCompleted}</p>
              <p className="text-muted" style={{ fontSize: 11 }}>✅ Concluídos Semana</p>
            </div>
          </div>

          {/* Atalhos rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {shortcuts.map((s) => (
              <button
                key={s.to}
                onClick={() => navigate(s.to)}
                className="card"
                style={{
                  padding: '12px 4px', textAlign: 'center', cursor: 'pointer',
                  border: 'none', background: 'var(--card)',
                }}
              >
                <p style={{ fontSize: 24 }}>{s.icon}</p>
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>{s.label}</p>
              </button>
            ))}
          </div>

          {/* Agenda de Hoje */}
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📋 Agenda de Hoje</h3>
          {todayAppts.length === 0 ? (
            <div className="card text-center" style={{ padding: 30 }}>
              <p style={{ fontSize: 36 }}>📭</p>
              <p className="text-muted mt-sm">Nenhum agendamento hoje</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayAppts.map((a) => (
                <div key={a.id} className="card" style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Horário */}
                    <div style={{ textAlign: 'center', minWidth: 50 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>{formatTime(a.start)}</p>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{a.customerName || 'Cliente'}</p>
                      <p className="text-muted" style={{ fontSize: 12 }}>
                        {a.serviceName} · {a.staffName || 'Barbeiro'}
                      </p>
                    </div>
                    {/* Status dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: statusColor[a.status] || '#666',
                    }} title={a.status} />
                    {/* Preço */}
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                      {a.priceCents ? fmt(a.priceCents) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
