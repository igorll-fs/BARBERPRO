/* ============================
   BARBERPRO PWA — Home do Cliente
   Próximo agendamento, serviços, promoções
   ============================ */
import React, { useState, useEffect } from 'react';
import { useUser } from '../../store/user';
import { useNavigate } from 'react-router-dom';
import { listServices, listenMyAppointments, type ServiceItem, type Appointment } from '../../services/scheduling';

// Formatar preço
function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function CustomerHome() {
  const { name, shopId, uid } = useUser();
  const navigate = useNavigate();
  const sid = shopId || 'demo';
  const userId = uid || 'demo-user';

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  // Saudação por hora
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Carregar serviços
  useEffect(() => {
    listServices(sid).then(setServices).catch(() => {});
  }, [sid]);

  // Ouvir próximo agendamento
  useEffect(() => {
    const unsub = listenMyAppointments(sid, userId, (appointments) => {
      const now = new Date();
      const upcoming = appointments
        .filter((a) => new Date(a.start) > now && !['cancelled', 'no-show'].includes(a.status))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      setNextAppointment(upcoming[0] || null);
      setLoading(false);
    });
    return unsub;
  }, [sid, userId]);

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, marginTop: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{greeting} 👋</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{name || 'Cliente'}</h1>
      </div>

      {/* CTA Agendar */}
      <button
        onClick={() => navigate('/app/booking')}
        style={{
          width: '100%', cursor: 'pointer', textAlign: 'left', display: 'block',
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          border: 'none', padding: 20, marginBottom: 16, borderRadius: 'var(--radius-md)',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 28 }}>✂️</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Agendar Horário</div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
          Escolha seu serviço e barbeiro favorito
        </p>
      </button>

      {/* Próximo Agendamento */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📅 Próximo Agendamento</h3>
        {loading ? (
          <div className="flex-center" style={{ padding: 20 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
        ) : nextAppointment ? (
          <div
            onClick={() => navigate('/app/appointments')}
            style={{ cursor: 'pointer', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{nextAppointment.serviceName}</p>
                {nextAppointment.staffName && (
                  <p className="text-muted text-sm" style={{ marginTop: 2 }}>✂️ {nextAppointment.staffName}</p>
                )}
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                color: 'var(--primary)', background: 'var(--primary-bg)',
              }}>
                {nextAppointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                📆 {formatDate(nextAppointment.start)}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                🕐 {formatTime(nextAppointment.start)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center" style={{ padding: 20 }}>
            <p style={{ fontSize: 32 }}>📭</p>
            <p className="text-muted" style={{ marginTop: 8 }}>Nenhum agendamento marcado</p>
            <button className="btn btn-outline mt-lg" onClick={() => navigate('/app/booking')} style={{ width: 'auto' }}>
              Agendar agora
            </button>
          </div>
        )}
      </div>

      {/* Serviços Populares */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>⭐ Serviços</h3>
        {services.length === 0 ? (
          <p className="text-muted text-sm" style={{ padding: 12 }}>Carregando serviços...</p>
        ) : (
          services.slice(0, 5).map((s, i) => (
            <div
              key={s.id}
              onClick={() => navigate('/app/booking')}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', cursor: 'pointer',
                borderBottom: i < Math.min(services.length, 5) - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <div>
                <p style={{ fontWeight: 500 }}>{s.name}</p>
                <p className="text-muted text-sm">{s.durationMin} min</p>
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {formatPrice(s.priceCents)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
