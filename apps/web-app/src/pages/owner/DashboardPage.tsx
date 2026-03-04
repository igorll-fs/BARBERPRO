/* ============================
   BARBERPRO PWA — Owner Dashboard
   ============================ */
import React from 'react';
import { useUser } from '../../store/user';
import { useShop } from '../../hooks/useShop';
import { useAppointments } from '../../hooks/useAppointments';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { name } = useUser();
    const { shop } = useShop();
    const { appointments, upcoming, loading } = useAppointments('shop');
    const navigate = useNavigate();

    const todayAppts = appointments.filter((a) => {
        const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
        const today = new Date();
        return s.toDateString() === today.toDateString();
    });

    const todayRevenue = todayAppts
        .filter((a) => a.status === 'completed')
        .reduce((sum, a) => sum + (a.priceCents || 0), 0);

    const pendingCount = appointments.filter((a) => a.status === 'pending').length;

    const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

    const quickActions = [
        { icon: '✂️', label: 'Serviços', path: '/services' },
        { icon: '⏰', label: 'Horários', path: '/schedule' },
        { icon: '👥', label: 'Equipe', path: '/team' },
        { icon: '🎉', label: 'Promoções', path: '/promotions' },
        { icon: '💬', label: 'Chat', path: '/chat' },
        { icon: '📊', label: 'Relatórios', path: '/reports' },
        { icon: '🔔', label: 'Notificações', path: '/notifications' },
        { icon: '⚙️', label: 'Config', path: '/settings' },
    ];

    return (
        <div className="page-content">
            <div className="container">
                {/* Header */}
                <div style={{ padding: 'var(--sp-xl) 0' }} className="animate-fade-in-up">
                    <p className="caption">Dashboard</p>
                    <h1 className="title" style={{ marginTop: 'var(--sp-xs)' }}>
                        {shop?.name || name || 'Minha Barbearia'}
                    </h1>
                    {shop?.subscription && (
                        <span className={`badge ${shop.subscription.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: 'var(--sp-sm)' }}>
                            {shop.subscription.status === 'active' ? '✅ Ativo' : '⚠️ Inativo'}
                            {shop.subscription.plan && ` · ${shop.subscription.plan === 'monthly' ? 'Mensal' : 'Anual'}`}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }} className="animate-fade-in-up">
                    <div className="card stat-card" style={{ marginBottom: 0 }}>
                        <div className="stat-value">{todayAppts.length}</div>
                        <div className="stat-label">Hoje</div>
                    </div>
                    <div className="card stat-card" style={{ marginBottom: 0 }}>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
                        <div className="stat-label">Pendentes</div>
                    </div>
                    <div className="card stat-card" style={{ marginBottom: 0 }}>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{formatPrice(todayRevenue)}</div>
                        <div className="stat-label">Receita</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="subtitle animate-fade-in-up" style={{ marginBottom: 'var(--sp-lg)' }}>Ações Rápidas</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-xxl)' }} className="animate-fade-in-up">
                    {quickActions.map((action) => (
                        <button
                            key={action.path}
                            className="card"
                            onClick={() => navigate(action.path)}
                            style={{ textAlign: 'center', cursor: 'pointer', marginBottom: 0, padding: 'var(--sp-md)' }}
                        >
                            <div style={{ fontSize: 24, marginBottom: 'var(--sp-xs)' }}>{action.icon}</div>
                            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>{action.label}</div>
                        </button>
                    ))}
                </div>

                {/* Upcoming */}
                <div className="animate-fade-in-up">
                    <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>Próximos Agendamentos</h2>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                            {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--r-lg)' }} />)}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', opacity: 0.7 }}>
                            <p className="body">Nenhum agendamento próximo</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                            {upcoming.slice(0, 5).map((a) => {
                                const date = a.start?.toDate ? a.start.toDate() : new Date(a.start);
                                return (
                                    <div key={a.id} className="appointment-card">
                                        <div className="row-between">
                                            <div>
                                                <div className="heading">{a.customerName || 'Cliente'}</div>
                                                <div className="caption">{a.serviceName} · {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <span className={`badge badge-${a.status === 'confirmed' ? 'info' : 'warning'}`}>
                                                {a.status === 'confirmed' ? '✅' : '⏳'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
