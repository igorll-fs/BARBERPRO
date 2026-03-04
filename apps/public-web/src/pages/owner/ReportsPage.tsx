/* ============================
   BARBERPRO PWA — Relatórios (Dono)
   KPIs + gráficos de barras CSS puro
   ============================ */
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useUser } from '../../store/user';
import type { Appointment, AppointmentStatus } from '../../services/scheduling';

// ─── Helpers ────────────────────────────────────────────
function fmt(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function getDateRange(period: 'today' | 'week' | 'month'): Date {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') return new Date(now.getTime() - 7 * 86400000);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ─── Dados Demo ─────────────────────────────────────────
function demoAppointments(): Appointment[] {
  const now = Date.now();
  const day = 86400000;
  const items: Appointment[] = [];
  const services = [
    { id: 's1', name: 'Corte Masculino', price: 3500 },
    { id: 's2', name: 'Barba', price: 2500 },
    { id: 's3', name: 'Corte + Barba', price: 5500 },
    { id: 's4', name: 'Degradê', price: 4000 },
  ];
  const statuses: AppointmentStatus[] = ['completed', 'completed', 'completed', 'cancelled', 'completed', 'no-show', 'completed'];
  const staff = ['Carlos', 'Lucas', 'Rafael'];

  for (let i = 0; i < 35; i++) {
    const svc = services[i % services.length];
    const status = statuses[i % statuses.length];
    const d = new Date(now - (i * day / 2) - Math.random() * day);
    items.push({
      id: `demo-${i}`, shopId: 'demo', serviceId: svc.id, serviceName: svc.name,
      staffUid: `s${(i % 3) + 1}`, staffName: staff[i % 3],
      customerUid: `c${i}`, customerName: `Cliente ${i + 1}`,
      start: d.toISOString(), end: new Date(d.getTime() + 30 * 60000).toISOString(),
      durationMin: 30, status, priceCents: svc.price,
    });
  }
  return items;
}

export default function ReportsPage() {
  const { shopId, isDemo } = useUser();
  const sid = shopId || 'demo';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  // ─── Carregar ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (isDemo || !db) {
        setAppointments(demoAppointments());
        setLoading(false);
        return;
      }
      try {
        const snap = await getDocs(collection(db, 'barbershops', sid, 'appointments'));
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        setAppointments(demoAppointments());
      }
      setLoading(false);
    };
    load();
  }, [sid, isDemo]);

  // ─── Filtrar por período ──────────────────────────────
  const filtered = useMemo(() => {
    const startDate = getDateRange(period);
    return appointments.filter((a) => {
      const d = a.start?.toDate ? a.start.toDate() : new Date(a.start);
      return d >= startDate;
    });
  }, [appointments, period]);

  // ─── KPIs ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed = filtered.filter((a) => a.status === 'completed');
    const revenue = completed.reduce((s, a) => s + (a.priceCents || 0), 0);
    const cancelled = filtered.filter((a) => a.status === 'cancelled').length;
    const noShow = filtered.filter((a) => a.status === 'no-show').length;
    const avgTicket = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
    return { revenue, total: filtered.length, completed: completed.length, cancelled, noShow, avgTicket };
  }, [filtered]);

  // ─── Top Serviços ─────────────────────────────────────
  const topServices = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    filtered.forEach((a) => {
      const key = a.serviceId || 'unknown';
      if (!map[key]) map[key] = { name: a.serviceName || key, count: 0, revenue: 0 };
      map[key].count++;
      if (a.status === 'completed') map[key].revenue += a.priceCents || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filtered]);

  const maxCount = topServices.length > 0 ? topServices[0].count : 1;

  // ─── Top Barbeiros ────────────────────────────────────
  const topStaff = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    filtered.forEach((a) => {
      if (!a.staffUid) return;
      if (!map[a.staffUid]) map[a.staffUid] = { name: a.staffName || 'Barbeiro', count: 0, revenue: 0 };
      map[a.staffUid].count++;
      if (a.status === 'completed') map[a.staffUid].revenue += a.priceCents || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filtered]);

  const maxStaffRev = topStaff.length > 0 ? topStaff[0].revenue : 1;

  // ─── Receita por dia (últimos 7) ──────────────────────
  const dailyRevenue = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const revenue = filtered
        .filter((a) => {
          const ad = a.start?.toDate ? a.start.toDate() : new Date(a.start);
          return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && a.status === 'completed';
        })
        .reduce((s, a) => s + (a.priceCents || 0), 0);
      days.push({ label: dayStr, value: revenue });
    }
    return days;
  }, [filtered]);

  const maxDaily = Math.max(...dailyRevenue.map((d) => d.value), 1);

  const periodLabels = { today: 'Hoje', week: 'Semana', month: 'Mês' };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 16 }}>📊 Relatórios</h1>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: period === p ? 'var(--primary)' : 'var(--bg-secondary)',
              color: period === p ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <KpiCard icon="💰" label="Receita" value={fmt(stats.revenue)} color="var(--primary)" />
            <KpiCard icon="📅" label="Agendamentos" value={`${stats.total}`} color="#3B82F6" />
            <KpiCard icon="✅" label="Concluídos" value={`${stats.completed}`} color="#10B981" />
            <KpiCard icon="🎯" label="Ticket Médio" value={stats.avgTicket > 0 ? fmt(stats.avgTicket) : '—'} color="#8B5CF6" />
            <KpiCard icon="❌" label="Cancelados" value={`${stats.cancelled}`} color="#EF4444" />
            <KpiCard icon="👻" label="No-shows" value={`${stats.noShow}`} color="#F59E0B" />
          </div>

          {/* Gráfico de Receita Diária */}
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📈 Receita Diária</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
              {dailyRevenue.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span className="text-muted" style={{ fontSize: 9 }}>
                    {d.value > 0 ? `R$${(d.value / 100).toFixed(0)}` : ''}
                  </span>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: d.value > 0 ? 'var(--primary)' : 'var(--bg-secondary)',
                    height: `${Math.max((d.value / maxDaily) * 100, 4)}%`,
                    minHeight: 4, transition: 'height 0.3s ease',
                  }} />
                  <span className="text-muted" style={{ fontSize: 10, textTransform: 'capitalize' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Serviços */}
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏆 Serviços Mais Populares</h3>
            {topServices.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: 20 }}>Sem dados no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topServices.map((svc, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{svc.name}</span>
                      <span className="text-muted" style={{ fontSize: 12 }}>{svc.count}x · {fmt(svc.revenue)}</span>
                    </div>
                    <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--bg-secondary)' }}>
                      <div style={{
                        width: `${(svc.count / maxCount) * 100}%`, height: '100%',
                        borderRadius: 4, background: 'var(--primary)', transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Barbeiros */}
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>💇 Ranking Barbeiros</h3>
            {topStaff.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: 20 }}>Sem dados no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topStaff.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {s.name}
                      </span>
                      <span className="text-muted" style={{ fontSize: 12 }}>{s.count} atend. · {fmt(s.revenue)}</span>
                    </div>
                    <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--bg-secondary)' }}>
                      <div style={{
                        width: `${(s.revenue / maxStaffRev) * 100}%`, height: '100%',
                        borderRadius: 4, background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : 'var(--primary)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Componente KPI Card ────────────────────────────────
function KpiCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, marginBottom: 4 }}>{icon}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
      <p className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{label}</p>
    </div>
  );
}
