/* ============================
   BARBERPRO PWA — My Appointments
   ============================ */
import React, { useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { useUser } from '../../store/user';
import { cancelAppointment } from '../../services/scheduling';

type FilterType = 'upcoming' | 'past' | 'all';

export default function AppointmentsPage() {
    const { appointments, upcoming, past, loading } = useAppointments('customer');
    const { shopId } = useUser();
    const [filter, setFilter] = useState<FilterType>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const filtered = filter === 'upcoming' ? upcoming : filter === 'past' ? past : appointments;

    const formatDate = (d: any) => {
        const date = d?.toDate ? d.toDate() : new Date(d);
        return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (d: any) => {
        const date = d?.toDate ? d.toDate() : new Date(d);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

    const statusLabel: Record<string, { text: string; className: string }> = {
        pending: { text: '⏳ Pendente', className: 'badge-warning' },
        confirmed: { text: '✅ Confirmado', className: 'badge-info' },
        completed: { text: '✅ Concluído', className: 'badge-success' },
        cancelled: { text: '❌ Cancelado', className: 'badge-danger' },
        'no-show': { text: '🚫 Não compareceu', className: 'badge-danger' },
    };

    const handleCancel = async (appointmentId: string) => {
        if (!shopId || !confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        setCancellingId(appointmentId);
        try {
            await cancelAppointment(shopId, appointmentId);
        } catch (e: any) {
            alert(e.message || 'Erro ao cancelar');
        }
        setCancellingId(null);
    };

    return (
        <div className="page-content">
            <div className="container">
                <div style={{ padding: 'var(--sp-xl) 0' }}>
                    <h1 className="title">📅 Meus Agendamentos</h1>
                </div>

                {/* Filters */}
                <div className="filter-tabs" style={{ marginBottom: 'var(--sp-xl)' }}>
                    {[
                        { key: 'upcoming' as FilterType, label: `Próximos (${upcoming.length})` },
                        { key: 'past' as FilterType, label: `Passados (${past.length})` },
                        { key: 'all' as FilterType, label: `Todos (${appointments.length})` },
                    ].map((f) => (
                        <button
                            key={f.key}
                            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">Nenhum agendamento</div>
                        <div className="empty-state-text">
                            {filter === 'upcoming' ? 'Você não tem agendamentos futuros.' : 'Nenhum agendamento encontrado.'}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {filtered.map((a) => (
                            <div key={a.id} className="appointment-card animate-fade-in">
                                <div className="row-between" style={{ marginBottom: 'var(--sp-md)' }}>
                                    <div className="heading">{a.serviceName || 'Serviço'}</div>
                                    <span className={`badge ${statusLabel[a.status]?.className || 'badge-info'}`}>
                                        {statusLabel[a.status]?.text || a.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xs)' }}>
                                    <div className="caption">📅 {formatDate(a.start)} · {formatTime(a.start)}</div>
                                    {a.staffName && <div className="caption">✂️ {a.staffName}</div>}
                                    {a.priceCents && <div className="body" style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatPrice(a.priceCents)}</div>}
                                </div>
                                {(a.status === 'pending' || a.status === 'confirmed') && (
                                    <div style={{ marginTop: 'var(--sp-md)', display: 'flex', gap: 'var(--sp-sm)' }}>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            style={{ flex: 1 }}
                                            onClick={() => handleCancel(a.id)}
                                            disabled={cancellingId === a.id}
                                        >
                                            {cancellingId === a.id ? 'Cancelando...' : '❌ Cancelar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
