/* ============================
   BARBERPRO — Dashboard do Dono
   Stats, agendamentos recentes, ações rápidas
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getSubscriptionStatus } from '../../services/subscriptions';
import { colors, spacing, fontSize, radius, globalStyles, shadows } from '../../theme';
import { Header, AppCard, AppButton, StatCard, AppointmentCard, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import { useAppointments, useNotifications } from '../../hooks';
import type { RootStackParamList } from '../../types/navigation';

export default function DashboardOwnerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shopId, name, isDemo } = useUser();
  const { upcoming } = useAppointments('shop');
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [subStatus, setSubStatus] = useState<string>('checking');
  const [stats, setStats] = useState({ todayCount: 0, weekRevenue: 0, staffCount: 0, clientCount: 0 });
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true);

  const loadStats = async () => {
    if (!shopId || !db) return;
    try {
      // Verificar onboarding
      const shopDoc = await getDoc(doc(db, 'barbershops', shopId));
      const shopData = shopDoc.data();
      setOnboardingComplete(shopData?.onboardingComplete || false);
      
      // Assinatura
      const status = await getSubscriptionStatus(shopId).catch(() => 'demo');
      setSubStatus(status);

      // Agendamentos hoje
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const todaySnap = await getDocs(query(
        collection(db, 'barbershops', shopId, 'appointments'),
        where('start', '>=', Timestamp.fromDate(todayStart)),
        where('start', '<=', Timestamp.fromDate(todayEnd)),
      ));
      const todayCount = todaySnap.size;

      // Staff
      const staffSnap = await getDocs(collection(db, 'barbershops', shopId, 'staff'));
      const staffCount = staffSnap.size;

      // Revenue (soma priceCents dos agendamentos completed da semana)
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
      const weekSnap = await getDocs(query(
        collection(db, 'barbershops', shopId, 'appointments'),
        where('status', '==', 'completed'),
        where('start', '>=', Timestamp.fromDate(weekStart)),
      ));
      let weekRevenue = 0;
      weekSnap.forEach((d) => { weekRevenue += (d.data() as any).priceCents || 0; });

      // Clientes únicos
      const clientsSet = new Set<string>();
      const allAppts = await getDocs(collection(db, 'barbershops', shopId, 'appointments'));
      allAppts.forEach((d) => { const cu = (d.data() as any).customerUid; if (cu) clientsSet.add(cu); });

      setStats({ todayCount, weekRevenue, staffCount, clientCount: clientsSet.size });
    } catch (e) {
      console.warn('Erro ao carregar stats:', e);
    }
  };

  useEffect(() => { loadStats(); }, [shopId]);

  const onRefresh = async () => { setRefreshing(true); await loadStats(); setRefreshing(false); };

  return (
    <View style={globalStyles.screen}>
      <Header
        title={`Olá, ${name?.split(' ')[0] || 'Proprietário'}!`}
        subtitle={isDemo ? '🧪 Modo Demo' : subStatus === 'active' ? '✅ Assinatura ativa' : '⚠️ Assinatura pendente'}
        rightIcon="🔔"
        badgeCount={unreadCount}
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Alerta de onboarding */}
        {!onboardingComplete && (
          <TouchableOpacity
            onPress={() => navigation.navigate('OwnerOnboarding')}
            style={{ backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.warning }}
          >
            <Text style={{ color: colors.warning, fontWeight: '600' }}>🚀 Complete o setup da sua barbearia!</Text>
          </TouchableOpacity>
        )}

        {/* Alert de assinatura */}
        {subStatus !== 'active' && subStatus !== 'demo' && subStatus !== 'checking' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('OwnerPaywall')}
            style={{ backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.warning }}
          >
            <Text style={{ color: colors.warning, fontWeight: '600' }}>⚠️ Assinatura inativa — Toque para assinar</Text>
          </TouchableOpacity>
        )}

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxl }}>
          <View style={{ flex: 1, minWidth: '45%' }}>
            <StatCard icon="📅" value={String(stats.todayCount)} label="Hoje" />
          </View>
          <View style={{ flex: 1, minWidth: '45%' }}>
            <StatCard icon="💰" value={`R$ ${(stats.weekRevenue / 100).toFixed(0)}`} label="Semana" />
          </View>
          <View style={{ flex: 1, minWidth: '45%' }}>
            <StatCard icon="👥" value={String(stats.staffCount)} label="Equipe" />
          </View>
          <View style={{ flex: 1, minWidth: '45%' }}>
            <StatCard icon="👤" value={String(stats.clientCount)} label="Clientes" />
          </View>
        </View>

        {/* Ações rápidas */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
          Ações rápidas
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxl }}>
          {[
            { icon: '➕', label: 'Agendar', onPress: () => navigation.navigate('Booking', { shopId: shopId || 'demo' }) },
            { icon: '⏰', label: 'Horários', onPress: () => navigation.navigate('ScheduleManagement') },
            { icon: '📦', label: 'Estoque', onPress: () => navigation.navigate('InventoryManagement') },
            { icon: '💬', label: 'Chat', onPress: () => navigation.navigate('Chat', { shopId: shopId || 'demo', roomId: 'general', title: 'Chat' }) },
            { icon: '💳', label: 'Assinatura', onPress: () => navigation.navigate('OwnerPaywall') },
            { icon: '🎁', label: 'Promoções', onPress: () => navigation.navigate('PromotionsManagement') },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              style={{
                flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
                alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
              <Text style={{ color: colors.text, fontSize: fontSize.xs, fontWeight: '500' }}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Próximos agendamentos */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
          Próximos agendamentos
        </Text>
        {upcoming.length === 0 ? (
          <EmptyState icon="📅" title="Nenhum agendamento" message="Os próximos agendamentos aparecerão aqui" />
        ) : (
          upcoming.slice(0, 5).map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} showDate />
          ))
        )}
      </ScrollView>
    </View>
  );
}
