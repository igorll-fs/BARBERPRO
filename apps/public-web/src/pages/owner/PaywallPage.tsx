/* ============================
   BARBERPRO PWA — Tela de Assinatura (Paywall)
   3 planos: Mensal, Semestral, Anual
   ============================ */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../store/user';
import {
  getSubscriptionStatus,
  openCheckout,
  openBillingPortal,
  isSubscriptionActive,
  type SubscriptionInfo,
  type PlanMode,
} from '../../services/subscriptions';

// ─── Planos disponíveis ─────────────────────────────────
const plans: {
  mode: PlanMode;
  title: string;
  price: string;
  period: string;
  pricePerMonth: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
}[] = [
  {
    mode: 'monthly',
    title: 'Mensal',
    price: 'R$ 60',
    period: '/mês',
    pricePerMonth: 'R$ 60/mês',
    features: [
      'Dashboard completo',
      'Equipe ilimitada',
      'Agendamento online',
      'Chat com equipe',
      'Relatórios financeiros',
    ],
  },
  {
    mode: 'semiannual',
    title: 'Semestral',
    price: 'R$ 300',
    period: '/6 meses',
    pricePerMonth: 'R$ 50/mês',
    badge: '🔥 Mais Popular',
    highlight: true,
    features: [
      'Tudo do mensal',
      'Economize 17%',
      'Suporte prioritário',
      'Eventos e comunicados',
    ],
  },
  {
    mode: 'yearly',
    title: 'Anual',
    price: 'R$ 500',
    period: '/ano',
    pricePerMonth: 'R$ 42/mês',
    badge: '💰 Melhor Valor',
    features: [
      'Tudo do semestral',
      'Economize 30%',
      'Recursos beta antecipados',
      'Consultoria de setup',
    ],
  },
];

export default function PaywallPage() {
  const navigate = useNavigate();
  const { shopId, isDemo, role } = useUser();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanMode | null>(null);
  const [error, setError] = useState('');

  // Carregar status da assinatura
  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    getSubscriptionStatus(shopId)
      .then(setSub)
      .catch(() => setSub({ status: 'inactive' }))
      .finally(() => setLoading(false));
  }, [shopId]);

  // Iniciar checkout
  const handleCheckout = async (mode: PlanMode) => {
    if (!shopId || isDemo) {
      setError('Crie uma conta real para assinar');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setCheckoutLoading(mode);
    setError('');
    try {
      await openCheckout(shopId, mode);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar checkout');
      setTimeout(() => setError(''), 4000);
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Abrir portal de gerenciamento
  const handleManage = async () => {
    if (!sub?.stripeCustomerId) return;
    try {
      await openBillingPortal(sub.stripeCustomerId);
    } catch (err: any) {
      setError(err.message || 'Erro ao abrir portal');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isActive = sub ? isSubscriptionActive(sub.status) : false;

  // Demo data
  useEffect(() => {
    if (isDemo) {
      setSub({ status: 'inactive' });
      setLoading(false);
    }
  }, [isDemo]);

  if (loading) {
    return (
      <div className="page flex-center" style={{ minHeight: '60dvh' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text)', padding: 4 }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Assinatura</h1>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 20px',
          borderRadius: 12, fontWeight: 600, fontSize: 13, textAlign: 'center',
          marginBottom: 16, animation: 'fadeIn 0.3s ease',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Status atual */}
      <div className="card" style={{
        marginBottom: 20,
        borderLeft: `4px solid ${isActive ? 'var(--primary)' : 'var(--warning)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="text-muted text-xs">Status da assinatura</p>
            <p style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
              {isActive ? '✅ Ativa' : sub?.status === 'canceled' ? '❌ Cancelada' : sub?.status === 'past_due' ? '⚠️ Pagamento pendente' : '🔒 Inativa'}
            </p>
          </div>
          {isActive && sub?.stripeCustomerId && (
            <button className="btn btn-ghost" onClick={handleManage} style={{ fontSize: 13 }}>
              Gerenciar →
            </button>
          )}
        </div>
      </div>

      {/* Se ativo, mostrar info */}
      {isActive ? (
        <div>
          <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>👑</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>BarberPro Premium</h2>
            <p className="text-muted" style={{ marginTop: 8 }}>
              Você tem acesso completo a todas as funcionalidades.
            </p>
            {sub?.updatedAt && (
              <p className="text-muted text-xs" style={{ marginTop: 12 }}>
                Última atualização: {new Date(sub.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <button className="btn btn-secondary" onClick={handleManage} style={{ marginBottom: 12 }}>
            💳 Gerenciar Assinatura
          </button>
          <p className="text-muted text-xs" style={{ textAlign: 'center' }}>
            Alterar plano, método de pagamento ou cancelar
          </p>
        </div>
      ) : (
        <>
          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 40 }}>✂️</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>BarberPro Premium</h2>
            <p className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>
              Gerencie sua barbearia como um profissional
            </p>
          </div>

          {/* Cards de plano */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {plans.map((plan) => (
              <div
                key={plan.mode}
                className="card"
                style={{
                  position: 'relative',
                  border: plan.highlight ? '2px solid var(--primary)' : '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: plan.highlight ? 'var(--primary)' : 'var(--gold)',
                    color: plan.highlight ? '#fff' : '#000',
                    padding: '4px 12px', borderBottomLeftRadius: 10,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Header do plano */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>{plan.title}</h3>
                    <p className="text-muted text-xs" style={{ marginTop: 2 }}>{plan.pricePerMonth}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{plan.price}</span>
                    <span className="text-muted" style={{ fontSize: 13 }}>{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 14 }}>
                  {plan.features.map((f) => (
                    <p key={f} className="text-muted" style={{ fontSize: 13, marginBottom: 3 }}>
                      ✓ {f}
                    </p>
                  ))}
                </div>

                {/* Botão */}
                <button
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleCheckout(plan.mode)}
                  disabled={checkoutLoading !== null}
                  style={{ opacity: checkoutLoading && checkoutLoading !== plan.mode ? 0.5 : 1 }}
                >
                  {checkoutLoading === plan.mode ? '⏳ Abrindo checkout...' : `Assinar ${plan.title}`}
                </button>
              </div>
            ))}
          </div>

          {/* Garantia */}
          <div style={{
            textAlign: 'center', marginTop: 24, padding: 16,
            background: 'var(--bg-secondary)', borderRadius: 12,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>🛡️ Garantia de 7 dias</p>
            <p className="text-muted text-xs" style={{ marginTop: 4 }}>
              Teste sem risco. Não gostou? Devolvemos seu dinheiro.
            </p>
          </div>

          {/* FAQ rápido */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Dúvidas Frequentes</h3>
            <FaqItem
              q="Posso trocar de plano?"
              a="Sim! Acesse 'Gerenciar Assinatura' e mude a qualquer momento. A diferença é calculada automaticamente."
            />
            <FaqItem
              q="Como funciona o cancelamento?"
              a="Cancele quando quiser pelo portal de gerenciamento. Você continua usando até o final do período pago."
            />
            <FaqItem
              q="Quais formas de pagamento?"
              a="Cartão de crédito, débito e Pix. Processado com segurança pela Stripe."
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Componente FAQ ─────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="card"
      style={{ marginBottom: 8, cursor: 'pointer', padding: '12px 16px' }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{q}</p>
        <span style={{ fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {open && (
        <p className="text-muted" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{a}</p>
      )}
    </div>
  );
}
