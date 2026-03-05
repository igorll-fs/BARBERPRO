/* ============================
   BARBERPRO — Paywall / Assinatura
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { openCheckout, getSubscriptionStatus, openBillingPortal } from '../../services/subscriptions';
import { colors, spacing, fontSize, radius, globalStyles, shadows } from '../../theme';
import { Header, AppButton, AppCard, Badge } from '../../components';
import { useUser } from '../../store/user';
import { useNavigation } from '@react-navigation/native';

export default function OwnerPaywallScreen() {
  const navigation = useNavigation();
  const { shopId, isDemo } = useUser();
  const [status, setStatus] = useState<string>('checking');

  useEffect(() => {
    if (!shopId) return;
    getSubscriptionStatus(shopId).then(setStatus).catch(() => setStatus('inactive'));
  }, [shopId]);

  // Conversão de moeda por país (simulado - em produção usar API de câmbio)
  const getPricesByCountry = () => {
    const country = 'BR'; // Detectar do usuário
    const prices = {
      BR: { currency: 'R$', monthly: '99,99', semiannual: '500,00', monthlyValue: 99.99, semiannualValue: 500 },
      PT: { currency: '€', monthly: '18,99', semiannual: '95,00', monthlyValue: 18.99, semiannualValue: 95 },
      US: { currency: 'US$', monthly: '19,99', semiannual: '99,00', monthlyValue: 19.99, semiannualValue: 99 },
      ES: { currency: '€', monthly: '18,99', semiannual: '95,00', monthlyValue: 18.99, semiannualValue: 95 },
      AR: { currency: 'ARS$', monthly: '8.999', semiannual: '44.999', monthlyValue: 8999, semiannualValue: 44999 },
      MX: { currency: 'MX$', monthly: '399', semiannual: '1.999', monthlyValue: 399, semiannualValue: 1999 },
    };
    return prices[country as keyof typeof prices] || prices.BR;
  };

  const prices = getPricesByCountry();

  const plans = [
    { 
      mode: 'monthly' as const, 
      title: 'Mensal', 
      price: `${prices.currency} ${prices.monthly}`, 
      period: '/mês', 
      badge: 'Mais popular',
      features: ['Dashboard completo', 'Equipe ilimitada', 'Chat com clientes', 'Relatórios financeiros', 'Notificações push', 'Suporte prioritário'],
      savings: null
    },
    { 
      mode: 'semiannual' as const, 
      title: 'Semestral', 
      price: `${prices.currency} ${prices.semiannual}`, 
      period: '/6 meses', 
      badge: '🔥 Melhor oferta',
      features: ['Tudo do mensal', 'Economia de 2 meses', 'Prioridade máxima', 'Recursos exclusivos', 'Suporte VIP 24h'],
      savings: `Economize ${prices.currency} ${((prices.monthlyValue * 6) - prices.semiannualValue).toFixed(2).replace('.', ',')}`
    },
  ];

  return (
    <View style={globalStyles.screen}>
      <Header title="Assinatura" leftIcon="←" onLeftPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Status atual */}
        <View style={{
          backgroundColor: status === 'active' ? colors.successBg : colors.warningBg,
          borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xxl,
          borderWidth: 1, borderColor: status === 'active' ? colors.success : colors.warning,
        }}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
            Status: {status === 'active' ? '✅ Ativa' : status === 'checking' ? '⏳ Verificando...' : '❌ Inativa'}
          </Text>
        </View>

        <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
          BarberPro Premium
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.xxl }}>
          Gerencie sua barbearia como um profissional
        </Text>

        {/* Planos */}
        {plans.map((plan) => (
          <AppCard key={plan.mode} style={{ marginBottom: spacing.lg, ...shadows.md, borderWidth: 2, borderColor: plan.mode === 'semiannual' ? colors.primary : colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>{plan.title}</Text>
              {plan.badge && <Badge text={plan.badge} variant={plan.mode === 'semiannual' ? 'primary' : 'success'} size="sm" />}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.xs }}>
              <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '800' }}>{plan.price}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, marginLeft: spacing.xs }}>{plan.period}</Text>
            </View>
            {plan.savings && (
              <Text style={{ color: colors.success, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.md }}>
                💰 {plan.savings}
              </Text>
            )}
            {plan.features.map((f) => (
              <Text key={f} style={{ color: colors.textSecondary, fontSize: fontSize.md, marginBottom: 4 }}>✓ {f}</Text>
            ))}
            <AppButton
              title={`Assinar ${plan.title}`}
              onPress={() => shopId && openCheckout(shopId, plan.mode)}
              variant={plan.mode === 'semiannual' ? 'primary' : 'outline'}
              style={{ marginTop: spacing.lg }}
            />
          </AppCard>
        ))}

        {/* Política de preços por país */}
        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }}>
          💱 Preços convertidos automaticamente para sua moeda local
        </Text>

        {/* Gerenciar */}
        {status === 'active' && (
          <AppButton
            title="Gerenciar assinatura"
            variant="secondary"
            onPress={() => openBillingPortal('CUSTOMER_PLACEHOLDER')}
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScrollView>
    </View>
  );
}
