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

  const plans = [
    { mode: 'monthly' as const, title: 'Mensal', price: 'R$ 60', period: '/mês', features: ['Dashboard completo', 'Equipe ilimitada', 'Chat com clientes', 'Relatórios financeiros'] },
    { mode: 'yearly' as const, title: 'Anual', price: 'R$ 700', period: '/ano', badge: 'Economize 3%', features: ['Tudo do mensal', 'Prioridade no suporte', 'Recursos beta antecipados'] },
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
          <AppCard key={plan.mode} style={{ marginBottom: spacing.lg, ...shadows.md, borderWidth: 1, borderColor: plan.mode === 'yearly' ? colors.primary : colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>{plan.title}</Text>
              {plan.badge && <Badge text={plan.badge} variant="success" size="sm" />}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md }}>
              <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '700' }}>{plan.price}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{plan.period}</Text>
            </View>
            {plan.features.map((f) => (
              <Text key={f} style={{ color: colors.textSecondary, fontSize: fontSize.md, marginBottom: 4 }}>✓ {f}</Text>
            ))}
            <AppButton
              title={`Assinar ${plan.title}`}
              onPress={() => shopId && openCheckout(shopId, plan.mode)}
              variant={plan.mode === 'yearly' ? 'primary' : 'outline'}
              style={{ marginTop: spacing.lg }}
            />
          </AppCard>
        ))}

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
