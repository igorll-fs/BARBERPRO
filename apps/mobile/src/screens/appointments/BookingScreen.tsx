/* ============================
   BARBERPRO — Tela de Agendamento
   Seleção de serviço, staff, data e horário
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, fontSize, radius, globalStyles, shadows } from '../../theme';
import { Header, AppButton, ServiceCard, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import { listServices, listStaff, getAvailableSlots, createAppointmentClient, getPromotionsForService, calculateDiscountedPrice } from '../../services/scheduling';
import type { RootStackParamList } from '../../types/navigation';
import type { ServiceItem, StaffMember, Promotion } from '../../types/models';

type RouteParams = RouteProp<RootStackParamList, 'Booking'>;

export default function BookingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { shopId: userShopId, isDemo } = useUser();
  const shopId = route.params?.shopId || userShopId || 'demo';

  // Steps: 1=serviço, 2=promoção, 3=staff, 4=data, 5=horário, 6=confirmar
  const [step, setStep] = useState(1);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Gerar próximos 14 dias
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    if (!shopId) return;
    // Carregar serviços e staff via scheduling service
    Promise.all([
      listServices(shopId),
      listStaff(shopId),
    ]).then(([svcList, staffList]) => {
      setServices(svcList.filter((s: any) => s.active !== false));
      setStaff(staffList as StaffMember[]);
    }).catch(console.warn);
  }, [shopId]);

  // Pre-select service if serviceId was passed
  useEffect(() => {
    if (route.params?.serviceId && services.length > 0) {
      const svc = services.find((s) => s.id === route.params?.serviceId);
      if (svc) { 
        setSelectedService(svc); 
        loadPromotionsForService(svc.id);
        setStep(2); 
      }
    }
  }, [route.params?.serviceId, services]);

  // Carregar promoções quando um serviço é selecionado
  const loadPromotionsForService = async (serviceId: string) => {
    if (!shopId) return;
    try {
      const promos = await getPromotionsForService(shopId, serviceId);
      setPromotions(promos);
      // Auto-selecionar a melhor promoção (maior desconto)
      if (promos.length > 0) {
        const bestPromo = promos.reduce((best, current) => 
          (current.discountPercent || 0) > (best.discountPercent || 0) ? current : best
        );
        setSelectedPromotion(bestPromo);
      }
    } catch (e) {
      console.warn('Erro ao carregar promoções:', e);
    }
  };

  const fetchSlots = async (date: string) => {
    if (!selectedService) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const result = await getAvailableSlots(
        shopId,
        selectedService.id,
        date,
        selectedStaff?.uid || undefined,
      );
      setSlots(result);
    } catch (e) {
      console.warn('Erro ao buscar slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedService || !selectedSlot) return;
    setLoading(true);
    try {
      await createAppointmentClient(
        shopId,
        selectedService.id,
        selectedSlot,
        selectedStaff?.uid || undefined,
        selectedPromotion?.id
      );
      Alert.alert('✅ Agendado!', 'Seu horário foi reservado com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível agendar');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View key={s} style={{
          width: step >= s ? 32 : 8, height: 8, borderRadius: 4,
          backgroundColor: step >= s ? colors.primary : colors.borderLight,
        }} />
      ))}
    </View>
  );

  return (
    <View style={globalStyles.screen}>
      <Header
        title="Agendar serviço"
        leftIcon="←"
        onLeftPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {renderStepIndicator()}

        {/* Step 1 — Serviço */}
        {step === 1 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Escolha o serviço
            </Text>
            {services.length === 0 ? (
              <EmptyState icon="✂️" title="Sem serviços" message="Nenhum serviço disponível" />
            ) : (
              services.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  selected={selectedService?.id === svc.id}
                  onPress={() => { setSelectedService(svc); loadPromotionsForService(svc.id); setStep(2); }}
                />
              ))
            )}
          </View>
        )}

        {/* Step 2 — Promoções (se houver) */}
        {step === 2 && promotions.length > 0 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              🎉 Promoções disponíveis
            </Text>
            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={() => setSelectedPromotion(null)}
                style={{
                  backgroundColor: !selectedPromotion ? colors.primaryBg : colors.card,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                  borderColor: !selectedPromotion ? colors.primary : colors.borderLight,
                }}
              >
                <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                  Sem promoção
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                  Preço normal
                </Text>
              </TouchableOpacity>
              {promotions.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  onPress={() => setSelectedPromotion(promo)}
                  style={{
                    backgroundColor: selectedPromotion?.id === promo.id ? colors.primaryBg : colors.card,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.md,
                    borderWidth: 2,
                    borderColor: selectedPromotion?.id === promo.id ? colors.gold : colors.borderLight,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                        {promo.title}
                      </Text>
                      {promo.description && (
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                          {promo.description}
                        </Text>
                      )}
                      {promo.usageLimit && (
                        <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs }}>
                          {promo.usageCount || 0}/{promo.usageLimit} usos
                        </Text>
                      )}
                    </View>
                    <View style={{
                      backgroundColor: colors.gold,
                      borderRadius: radius.full,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }}>
                      <Text style={{ color: colors.black, fontSize: fontSize.md, fontWeight: '700' }}>
                        -{promo.discountPercent}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <AppButton
              title="Continuar"
              onPress={() => setStep(3)}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}

        {/* Pular promoções se não houver */}
        {step === 2 && promotions.length === 0 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.md, marginBottom: spacing.lg, textAlign: 'center' }}>
              Nenhuma promoção disponível para este serviço 😕
            </Text>
            <AppButton
              title="Continuar"
              onPress={() => setStep(3)}
            />
          </View>
        )}

        {/* Step 3 — Staff (opcional) */}
        {step === 3 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Escolha o profissional
            </Text>
            <TouchableOpacity
              onPress={() => { setSelectedStaff(null); setStep(4); }}
              style={{
                backgroundColor: !selectedStaff ? colors.primaryBg : colors.card,
                borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md,
                borderWidth: 1, borderColor: !selectedStaff ? colors.primary : colors.borderLight,
              }}
            >
              <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                🎲 Qualquer profissional disponível
              </Text>
            </TouchableOpacity>
            {staff.filter((s: any) => s.active !== false).map((s) => (
              <TouchableOpacity
                key={s.uid}
                onPress={() => { setSelectedStaff(s); setStep(4); }}
                style={{
                  backgroundColor: selectedStaff?.uid === s.uid ? colors.primaryBg : colors.card,
                  borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md,
                  borderWidth: 1, borderColor: selectedStaff?.uid === s.uid ? colors.primary : colors.borderLight,
                  flexDirection: 'row', alignItems: 'center',
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
                  alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
                }}>
                  <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '700' }}>
                    {(s.name || 'B')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                  {s.name || s.uid}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4 — Data */}
        {step === 4 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Escolha a data
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
              {dates.map((d) => {
                const dateStr = formatDate(d);
                const isSelected = selectedDate === dateStr;
                const isToday = formatDate(new Date()) === dateStr;
                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => { setSelectedDate(dateStr); fetchSlots(dateStr); setStep(5); }}
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderRadius: radius.lg, padding: spacing.md, marginRight: spacing.sm,
                      alignItems: 'center', minWidth: 64,
                      borderWidth: 1, borderColor: isSelected ? colors.primary : colors.borderLight,
                    }}
                  >
                    <Text style={{ color: isSelected ? '#fff' : colors.textSecondary, fontSize: fontSize.xs }}>
                      {dayNames[d.getDay()]}
                    </Text>
                    <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>
                      {d.getDate()}
                    </Text>
                    {isToday && <Text style={{ color: isSelected ? '#fff' : colors.primary, fontSize: fontSize.xs }}>Hoje</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Step 5 — Horário */}
        {step === 5 && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Escolha o horário
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>

            {loadingSlots ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: spacing.xxl }} />
            ) : slots.length === 0 ? (
              <EmptyState icon="⏰" title="Sem horários" message="Nenhum horário disponível nesta data" />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {slots.map((slot) => {
                  const time = new Date(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => { setSelectedSlot(slot); setStep(6); }}
                      style={{
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
                        borderWidth: 1, borderColor: isSelected ? colors.primary : colors.borderLight,
                      }}
                    >
                      <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                        {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Step 6 — Confirmação */}
        {step === 6 && selectedService && selectedSlot && (
          <View>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.lg }}>
              Confirmar agendamento
            </Text>

            <View style={{
              backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
              borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.xl,
            }}>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Serviço</Text>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {selectedService.name}
                </Text>
              </View>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Profissional</Text>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {selectedStaff?.name || 'Qualquer disponível'}
                </Text>
              </View>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Data e horário</Text>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {new Date(selectedSlot).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' às '}
                  {new Date(selectedSlot).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Valor</Text>
                {selectedPromotion ? (
                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, textDecorationLine: 'line-through' }}>
                      R$ {(selectedService.priceCents / 100).toFixed(2)}
                    </Text>
                    <Text style={{ color: colors.gold, fontSize: fontSize.xxl, fontWeight: '700' }}>
                      R$ {calculateDiscountedPrice(selectedService.priceCents, selectedPromotion.discountPercent || 0) / 100}
                    </Text>
                    <Text style={{ color: colors.gold, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.xs }}>
                      🎉 {selectedPromotion.discountPercent}% de desconto!
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.primary, fontSize: fontSize.xxl, fontWeight: '700' }}>
                    R$ {(selectedService.priceCents / 100).toFixed(2)}
                  </Text>
                )}
              </View>
            </View>

            <AppButton title="Confirmar agendamento" onPress={confirmBooking} loading={loading} />
            <AppButton
              title="Voltar"
              variant="outline"
              onPress={() => setStep(5)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
