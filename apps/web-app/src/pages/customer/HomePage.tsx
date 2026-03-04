/* ============================
   BARBERPRO PWA — Customer Home
   ============================ */
import React from 'react';
import { useUser } from '../../store/user';
import { useShop } from '../../hooks/useShop';
import { useAppointments } from '../../hooks/useAppointments';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const { name, shopId } = useUser();
    const { shop } = useShop();
    const { upcoming, loading } = useAppointments('customer');
    const navigate = useNavigate();

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Bom dia';
        if (h < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const formatDate = (d: any) => {
        const date = d?.toDate ? d.toDate() : new Date(d);
        return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
    };

    const formatTime = (d: any) => {
        const date = d?.toDate ? d.toDate() : new Date(d);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

    return (
        <div className="page-content">
            <div className="container">
                {/* Header */}
                <div style={{ padding: 'var(--sp-xl) 0' }} className="animate-fade-in-up">
                    <p className="caption">{greeting()} 👋</p>
                    <h1 className="title" style={{ marginTop: 'var(--sp-xs)' }}>{name || 'Cliente'}</h1>
                    {shop && (
                        <p className="body" style={{ marginTop: 'var(--sp-xs)' }}>📍 {shop.name}</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }} className="animate-fade-in-up">
                    <button className="card" onClick={() => navigate('/booking')} style={{ textAlign: 'center', cursor: 'pointer', marginBottom: 0 }}>
                        <div style={{ fontSize: 32, marginBottom: 'var(--sp-sm)' }}>📅</div>
                        <div className="heading">Agendar</div>
                        <div className="caption">Novo horário</div>
                    </button>
                    <button className="card" onClick={() => navigate('/chat')} style={{ textAlign: 'center', cursor: 'pointer', marginBottom: 0 }}>
                        <div style={{ fontSize: 32, marginBottom: 'var(--sp-sm)' }}>💬</div>
                        <div className="heading">Chat</div>
                        <div className="caption">Fale conosco</div>
                    </button>
                </div>

                {/* Upcoming Appointments */}
                <div className="animate-fade-in-up">
                    <div className="row-between" style={{ marginBottom: 'var(--sp-lg)' }}>
                        <h2 className="subtitle">Próximos</h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
                            Ver todos →
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                            {[1, 2].map((i) => (
                                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--r-lg)' }} />
                            ))}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--sp-xxl)' }}>
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-title">Nenhum agendamento</div>
                            <div className="empty-state-text">Agende seu primeiro horário!</div>
                            <button className="btn btn-primary" onClick={() => navigate('/booking')} style={{ marginTop: 'var(--sp-lg)', maxWidth: 200 }}>
                                Agendar agora
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                            {upcoming.slice(0, 3).map((a) => (
                                <div key={a.id} className="appointment-card">
                                    <div className="row-between">
                                        <div>
                                            <div className="heading">{a.serviceName || 'Serviço'}</div>
                                            <div className="caption" style={{ marginTop: 'var(--sp-xs)' }}>
                                                {a.staffName && `✂️ ${a.staffName} · `}{formatDate(a.start)} · {formatTime(a.start)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge badge-${a.status === 'confirmed' ? 'info' : 'warning'}`}>
                                                {a.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pendente'}
                                            </span>
                                            {a.priceCents && (
                                                <div className="heading" style={{ color: 'var(--primary)', marginTop: 'var(--sp-xs)' }}>
                                                    {formatPrice(a.priceCents)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Promotions Section */}
                <div style={{ marginTop: 'var(--sp-xxl)' }} className="animate-fade-in-up">
                    <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>🔥 Promoções</h2>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--card-elevated), var(--card))', borderColor: 'var(--gold)', borderWidth: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
                            <div style={{ fontSize: 36 }}>🎉</div>
                            <div>
                                <div className="heading" style={{ color: 'var(--gold)' }}>Desconto de Boas-vindas</div>
                                <div className="body">Ganhe 10% off no primeiro corte!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
