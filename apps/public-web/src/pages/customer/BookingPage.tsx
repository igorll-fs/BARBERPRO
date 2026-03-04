/* ============================
   BARBERPRO PWA — Página de Agendamento
   Fluxo: Serviço → Data → Horário → Barbeiro → Confirmar
   ============================ */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../store/user';
import {
  listServices, listStaff, getAvailableSlots, createAppointmentClient,
  type ServiceItem, type StaffItem,
} from '../../services/scheduling';

// ─── Steps do Booking ───────────────────────────────────
type BookingStep = 'service' | 'date' | 'time' | 'staff' | 'confirm';

// Formatar preço em centavos → R$ string
function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// Formatar hora ISO → "10:30"
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Gerar próximos 14 dias
function getNextDays(count: number): { date: string; label: string; weekday: string }[] {
  const days: { date: string; label: string; weekday: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.getDate().toString().padStart(2, '0'),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    });
  }
  return days;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { shopId, isDemo } = useUser();
  const sid = shopId || 'demo';

  // State do fluxo
  const [step, setStep] = useState<BookingStep>('service');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Seleções
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  const days = getNextDays(14);

  // ─── Carregar Serviços ────────────────────────────────
  useEffect(() => {
    setLoading(true);
    listServices(sid)
      .then(setServices)
      .catch(() => setError('Erro ao carregar serviços'))
      .finally(() => setLoading(false));
  }, [sid]);

  // ─── Carregar Staff ───────────────────────────────────
  useEffect(() => {
    listStaff(sid).then(setStaffList).catch(() => {});
  }, [sid]);

  // ─── Carregar Slots quando seleciona data ─────────────
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot('');
    getAvailableSlots(sid, selectedService.id, selectedDate, selectedStaff?.uid)
      .then(setSlots)
      .catch(() => setError('Erro ao buscar horários'))
      .finally(() => setLoading(false));
  }, [sid, selectedService, selectedDate, selectedStaff]);

  // ─── Confirmar Agendamento ────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await createAppointmentClient(sid, selectedService.id, selectedSlot, selectedStaff?.uid);
      navigate('/app/appointments', { state: { booked: true } });
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [sid, selectedService, selectedSlot, selectedStaff, navigate]);

  // ─── Navegação entre steps ────────────────────────────
  const goBack = () => {
    const order: BookingStep[] = ['service', 'date', 'time', 'staff', 'confirm'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
    else navigate(-1);
  };

  // ─── Progress bar ────────────────────────────────────
  const stepIndex = ['service', 'date', 'time', 'staff', 'confirm'].indexOf(step);
  const progress = ((stepIndex + 1) / 5) * 100;

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, marginTop: 8 }}>
        <button onClick={goBack} className="btn-ghost" style={{
          padding: '8px 12px', fontSize: 18, borderRadius: 8, border: 'none',
          background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text)',
        }}>
          ←
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>Agendar Horário</h2>
      </div>

      {/* Barra de progresso */}
      <div style={{
        height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 20, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: 'var(--primary)',
          borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px',
          borderRadius: 12, marginBottom: 16, fontSize: 13,
        }}>
          ❌ {error}
        </div>
      )}

      {/* ─── Step 1: Serviço ──────────────────────────── */}
      {step === 'service' && (
        <div>
          <p className="text-muted mb-lg" style={{ fontSize: 14 }}>Escolha o serviço desejado</p>
          {loading ? (
            <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep('date'); }}
                  className="card"
                  style={{
                    cursor: 'pointer', textAlign: 'left', border: selectedService?.id === s.id
                      ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                    padding: '16px 20px', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</p>
                      {s.description && (
                        <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{s.description}</p>
                      )}
                      <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                        ⏱ {s.durationMin} min
                      </p>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', marginLeft: 12 }}>
                      {formatPrice(s.priceCents)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Data ─────────────────────────────── */}
      {step === 'date' && (
        <div>
          <p className="text-muted mb-lg" style={{ fontSize: 14 }}>
            Selecione a data — <strong>{selectedService?.name}</strong>
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
            gap: 8, marginBottom: 16,
          }}>
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => { setSelectedDate(d.date); setStep('time'); }}
                style={{
                  padding: '12px 4px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  border: selectedDate === d.date ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedDate === d.date ? 'var(--primary-bg)' : 'var(--card)',
                  color: 'var(--text)', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {d.weekday}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{d.label}</div>
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => setStep('service')}>← Voltar</button>
        </div>
      )}

      {/* ─── Step 3: Horário ──────────────────────────── */}
      {step === 'time' && (
        <div>
          <p className="text-muted mb-lg" style={{ fontSize: 14 }}>
            Horários disponíveis — {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </p>
          {loading ? (
            <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div>
          ) : slots.length === 0 ? (
            <div className="text-center" style={{ padding: 40 }}>
              <p style={{ fontSize: 40 }}>😕</p>
              <p className="text-muted mt-md">Nenhum horário disponível nesta data</p>
              <button className="btn btn-outline mt-lg" style={{ width: 'auto' }} onClick={() => setStep('date')}>
                Escolher outra data
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8,
            }}>
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => { setSelectedSlot(slot); setStep('staff'); }}
                  style={{
                    padding: '14px 8px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: selectedSlot === slot ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedSlot === slot ? 'var(--primary-bg)' : 'var(--card)',
                    color: selectedSlot === slot ? 'var(--primary)' : 'var(--text)',
                    fontWeight: 600, fontSize: 15, transition: 'all 0.2s',
                  }}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-ghost mt-lg" onClick={() => setStep('date')}>← Voltar</button>
        </div>
      )}

      {/* ─── Step 4: Barbeiro (opcional) ──────────────── */}
      {step === 'staff' && (
        <div>
          <p className="text-muted mb-lg" style={{ fontSize: 14 }}>Escolha seu barbeiro (opcional)</p>

          {/* Opção "qualquer barbeiro" */}
          <button
            onClick={() => { setSelectedStaff(null); setStep('confirm'); }}
            className="card"
            style={{
              width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10,
              border: !selectedStaff ? '2px solid var(--primary)' : '1px solid var(--card-border)',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                🔀
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>Qualquer disponível</p>
                <p className="text-muted text-sm">O sistema escolhe automaticamente</p>
              </div>
            </div>
          </button>

          {staffList.map((s) => (
            <button
              key={s.uid}
              onClick={() => { setSelectedStaff(s); setStep('confirm'); }}
              className="card"
              style={{
                width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10,
                border: selectedStaff?.uid === s.uid ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  overflow: 'hidden',
                }}>
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '✂️'}
                </div>
                <p style={{ fontWeight: 600 }}>{s.name || 'Barbeiro'}</p>
              </div>
            </button>
          ))}

          <button className="btn btn-ghost mt-lg" onClick={() => setStep('time')}>← Voltar</button>
        </div>
      )}

      {/* ─── Step 5: Confirmar ────────────────────────── */}
      {step === 'confirm' && selectedService && (
        <div>
          <p className="text-muted mb-lg" style={{ fontSize: 14 }}>Confirme os detalhes do agendamento</p>

          <div className="card" style={{ marginBottom: 16 }}>
            {/* Resumo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Serviço</p>
                <p style={{ fontWeight: 600, fontSize: 17, marginTop: 4 }}>{selectedService.name}</p>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Data</p>
                  <p style={{ fontWeight: 600, marginTop: 4 }}>
                    {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Horário</p>
                  <p style={{ fontWeight: 600, marginTop: 4 }}>{formatTime(selectedSlot)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Barbeiro</p>
                  <p style={{ fontWeight: 600, marginTop: 4 }}>{selectedStaff?.name || 'Qualquer disponível'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Duração</p>
                  <p style={{ fontWeight: 600, marginTop: 4 }}>{selectedService.durationMin} min</p>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div style={{
              marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span className="text-muted">Total</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                {formatPrice(selectedService.priceCents)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={submitting}
            style={{ marginBottom: 10 }}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Agendando...</>
            ) : (
              '✅ Confirmar Agendamento'
            )}
          </button>
          <button className="btn btn-ghost" onClick={() => setStep('staff')}>← Voltar</button>
        </div>
      )}
    </div>
  );
}
