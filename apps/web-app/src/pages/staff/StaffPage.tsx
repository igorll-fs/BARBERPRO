/* ============================
   BARBERPRO PWA — Staff Area
   ============================ */
import React from 'react';
import { useUser } from '../../store/user';
import { useAppointments } from '../../hooks/useAppointments';
import { confirmAppointment, rejectAppointment } from '../../services/appointments';
import { completeAppointment } from '../../services/scheduling';

export default function StaffPage() {
    const { name, shopId } = useUser();
    const { appointments, upcoming, loading } = useAppointments('staff');
    const [actioningId, setActioningId] = React.useState<string | null>(null);

    const todayAppts = appointments.filter((a) => {
        const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
        return s.toDateString() === new Date().toDateString();
    });

    const handleConfirm = async (id: string) => {
        if (!shopId) return;
        setActioningId(id);
        try { await confirmAppointment(shopId, id); } catch (e: any) { alert(e.message); }
        setActioningId(null);
    };

    const handleReject = async (id: string) => {
        if (!shopId || !confirm('Recusar este agendamento?')) return;
        setActioningId(id);
        try { await rejectAppointment(shopId, id); } catch (e: any) { alert(e.message); }
        setActioningId(null);
    };

    const handleComplete = async (id: string) => {
        if (!shopId) return;
        setActioningId(id);
        try { await completeAppointment(shopId, id); } catch (e: any) { alert(e.message); }
        setActioningId(null);
    };

    const formatTime = (d: any) => {
        const date = d?.toDate ? d.toDate() : new Date(d);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="page-content">
            <div className="container">
                <div style={{ padding: 'var(--sp-xl) 0' }} className="animate-fade-in-up">
                    <p className="caption">Área do Barbeiro</p>
                    <h1 className="title">{name || 'Barbeiro'}</h1>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }} className="animate-fade-in-up">
                    <div className="card stat-card" style={{ marginBottom: 0 }}>
                        <div className="stat-value">{todayAppts.length}</div>
                        <div className="stat-label">Hoje</div>
                    </div>
                    <div className="card stat-card" style={{ marginBottom: 0 }}>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>
                            {appointments.filter((a) => a.status === 'pending').length}
                        </div>
                        <div className="stat-label">Pendentes</div>
                    </div>
                </div>

                {/* Appointments */}
                <h2 className="subtitle animate-fade-in-up" style={{ marginBottom: 'var(--sp-lg)' }}>Agenda do Dia</h2>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />)}
                    </div>
                ) : todayAppts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">Agenda livre hoje</div>
                        <div className="empty-state-text">Nenhum agendamento para hoje.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {todayAppts.map((a) => (
                            <div key={a.id} className="appointment-card animate-fade-in">
                                <div className="row-between" style={{ marginBottom: 'var(--sp-sm)' }}>
                                    <div>
                                        <div className="heading">{a.customerName || 'Cliente'}</div>
                                        <div className="caption">{a.serviceName} · {formatTime(a.start)}</div>
                                    </div>
                                    <span className={`badge badge-${a.status === 'pending' ? 'warning' : a.status === 'confirmed' ? 'info' : 'success'}`}>
                                        {a.status === 'pending' ? '⏳' : a.status === 'confirmed' ? '✅' : '✔️'} {a.status}
                                    </span>
                                </div>
                                {a.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-md)' }}>
                                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleConfirm(a.id)} disabled={actioningId === a.id}>
                                            ✅ Confirmar
                                        </button>
                                        <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleReject(a.id)} disabled={actioningId === a.id}>
                                            ❌ Recusar
                                        </button>
                                    </div>
                                )}
                                {a.status === 'confirmed' && (
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--sp-md)' }} onClick={() => handleComplete(a.id)} disabled={actioningId === a.id}>
                                        ✅ Concluir atendimento
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                    <div style={{ marginTop: 'var(--sp-xxl)' }} className="animate-fade-in-up">
                        <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>Próximos Dias</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                            {upcoming.filter((a) => {
                                const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
                                return s.toDateString() !== new Date().toDateString();
                            }).slice(0, 5).map((a) => {
                                const date = a.start?.toDate ? a.start.toDate() : new Date(a.start);
                                return (
                                    <div key={a.id} className="card" style={{ marginBottom: 0, opacity: 0.8 }}>
                                        <div className="row-between">
                                            <div>
                                                <div className="body">{a.customerName} · {a.serviceName}</div>
                                                <div className="caption">{date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} · {formatTime(a.start)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
