/* ============================
   BARBERPRO — Home do Cliente (Booksy-inspired)
   Hero, Próximo agendamento, serviços com badges
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles, shadows, fontWeight } from '../../theme';
import { Header, AppCard, AppButton, AppointmentCard, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import { useAppointments, useNotifications } from '../../hooks';
import type { ServiceItem, Promotion } from '../../types/models';
import type { RootStackParamList } from '../../types/navigation';

export default function HomeCustomerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name, shopId, isDemo } = useUser();
  const { upcoming } = useAppointments('customer');
  const { unreadCount } = useNotifications();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!shopId || !db) return;
    try {
      const svcSnap = await getDocs(collection(db, 'barbershops', shopId, 'services'));
      setServices(svcSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).filter((s: any) => s.active !== false));

      const promoSnap = await getDocs(query(collection(db, 'barbershops', shopId, 'promotions'), where('active', '==', true)));
      setPromotions(promoSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
    }
  };

  useEffect(() => { loadData(); }, [shopId]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  };

  return (
    <View style={globalStyles.screen}>
      <Header
        title={`${greeting()}, ${name?.split(' ')[0] || 'Cliente'}!`}
        subtitle={isDemo ? '🧪 Modo Demo' : undefined}
        rightIcon="🔔"
        badgeCount={unreadCount}
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Hero CTA — Estilo Booksy */}
        <AppCard variant="elevated" style={{ ...shadows.lg, borderWidth: 2, borderColor: colors.primary, marginBottom: spacing.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <View style={{ 
              width: 64, 
              height: 64, 
              borderRadius: radius.lg, 
              backgroundColor: colors.primaryBg, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: spacing.lg,
            }}>
              <Text style={{ fontSize: 36 }}>✂️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
                Agendar serviço
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, marginTop: spacing.xs }}>
                Escolha o serviço e horário ideal
              </Text>
            </View>
          </View>
          <AppButton
            title="Agendar agora"
            size="lg"
            onPress={() => navigation.navigate('Booking', { shopId: shopId || 'demo' })}
          />
        </AppCard>

        {/* Próximo agendamento — Com timeline */}
        {upcoming.length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <View style={globalStyles.rowBetween}>
              <Text style={globalStyles.subtitle}>Próximo agendamento</Text>
              <Badge text="Em breve" variant="success" />
            </View>
            <AppCard variant="glass" style={{ marginTop: spacing.lg, borderWidth: 2, borderColor: colors.primary }}>
              <AppointmentCard appointment={upcoming[0]} showDate />
            </AppCard>
          </View>
        )}

        {/* Promoções — Cards vibrantes */}
        {promotions.length > 0 && (
          <View style={{ marginBottom: spacing.xxl }}>
            <Text style={globalStyles.subtitle}>🔥 Ofertas especiais</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg }}>
              {promotions.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: colors.cardElevated,
                    borderRadius: radius.xl,
                    padding: spacing.xl,
                    marginRight: spacing.lg,
                    width: 280,
                    borderWidth: 2,
                    borderColor: colors.gold,
                    ...shadows.md,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 36 }}>🎉</Text>
                    {promo.discountPercent && (
                      <View style={{ 
                        backgroundColor: colors.gold, 
                        borderRadius: radius.full, 
                        paddingHorizontal: spacing.md, 
                        paddingVertical: spacing.xs 
                      }}>
                        <Text style={{ color: colors.black, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                          -{promo.discountPercent}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: spacing.md }}>
                    {promo.title}
                  </Text>
                  {promo.description && (
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm, lineHeight: 20 }}>
                      {promo.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Serviços — Com badges e ratings */}
        <View style={globalStyles.rowBetween}>
          <Text style={globalStyles.subtitle}>Serviços disponíveis</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{services.length} serviços</Text>
        </View>
        
        {services.length === 0 ? (
          <EmptyState icon="💈" title="Nenhum serviço" message={isDemo ? 'Configure serviços no Firebase' : 'Serviços serão exibidos aqui'} />
        ) : (
          <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
            {services.map((svc, idx) => (
              <TouchableOpacity
                key={svc.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Booking', { shopId: shopId || 'demo', serviceId: svc.id })}
              >
                <AppCard variant={idx === 0 ? 'elevated' : 'default'}>
                  <View style={globalStyles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                        <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }}>
                          {svc.name}
                        </Text>
                        {idx === 0 && (
                          <Badge text="Popular" variant="success" style={{ marginLeft: spacing.sm }} />
                        )}
                      </View>
                      {svc.description && (
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.sm, lineHeight: 18 }}>
                          {svc.description}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                          ⏱️ {svc.durationMinutes}min
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                          ⭐ 4.8
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
                        {svc.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick actions — Maior e mais espaçado */}
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xxxl }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { shopId: shopId || 'demo', roomId: 'general', title: 'Chat' })}
            style={{
              flex: 1, 
              backgroundColor: colors.cardElevated, 
              borderRadius: radius.xl, 
              padding: spacing.xl,
              alignItems: 'center', 
              borderWidth: 1, 
              borderColor: colors.cardBorder,
              ...shadows.sm,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Loyalty' })}
            style={{
              flex: 1, 
              backgroundColor: colors.cardElevated, 
              borderRadius: radius.xl, 
              padding: spacing.xl,
              alignItems: 'center', 
              borderWidth: 1, 
              borderColor: colors.cardBorder,
              ...shadows.sm,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>⭐</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>Fidelidade</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
