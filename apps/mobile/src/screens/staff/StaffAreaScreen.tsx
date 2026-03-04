/* ============================
   BARBERPRO — Área do Barbeiro
   Agenda pessoal, registrar serviços, marcar como feito
   ============================ */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { confirmAppointment, rejectAppointment } from '../../services/appointments';
import { completeAppointment } from '../../services/scheduling';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppButton, AppointmentCard, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import { useAppointments } from '../../hooks';
import type { RootStackParamList } from '../../types/navigation';

export default function StaffAreaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name, shopId, isDemo } = useUser();
  const { upcoming, past, loading } = useAppointments('staff');
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Filtrar agendamentos de hoje ─────────────
  const todayAppts = upcoming.filter((a) => {
    const d = a.start instanceof Date
      ? a.start
      : (a.start as any)?.toDate?.() ?? new Date(a.start as any);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  // ─── Actions ──────────────────────────────────
  const handleConfirm = async (apptId: string) => {
    if (isDemo) {
      Alert.alert('Demo', 'Ação indisponível no modo demo');
      return;
    }
    try {
      setActionLoading(apptId);
      await confirmAppointment(shopId!, apptId);
      Alert.alert('✅ Confirmado', 'Agendamento confirmado! Cliente será notificado.');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao confirmar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (apptId: string) => {
    Alert.alert('Recusar agendamento?', 'O cliente será notificado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(apptId);
            await rejectAppointment(shopId!, apptId, 'Horário indisponível');
            Alert.alert('❌ Recusado', 'Agendamento recusado.');
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const markComplete = async (appt: any) => {
    if (isDemo) {
      Alert.alert('Demo', 'Ação indisponível no modo demo');
      return;
    }
    try {
      setActionLoading(appt.id);
      await completeAppointment(shopId!, appt.id);
      
      // Navegar para tela de avaliação
      navigation.navigate('RateAppointment', {
        shopId: shopId!,
        appointmentId: appt.id,
        serviceName: appt.serviceName,
        staffName: appt.staffName,
      });
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível completar');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Saudação por horário ─────────────────────
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // ─── Render ───────────────────────────────────
  return (
    <View style={globalStyles.screen}>
      <Header
        title={`${greeting()}, ${name?.split(' ')[0] || 'Barbeiro'}!`}
        subtitle={isDemo ? '🧪 Modo Demo' : undefined}
        rightIcon="🔔"
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Resumo do dia ── */}
        <View
          style={{
            backgroundColor: colors.primaryBg,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.xxl,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '500' }}>
                Hoje
              </Text>
              <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' }}>
                {todayAppts.length} atendimento{todayAppts.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={{ fontSize: 40 }}>✂️</Text>
          </View>
        </View>

        {/* ── Atendimentos de hoje ── */}
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.xl,
            fontWeight: '600',
            marginBottom: spacing.md,
          }}
        >
          Próximos atendimentos
        </Text>

        {todayAppts.length === 0 ? (
          <EmptyState icon="📋" title="Agenda livre" message="Nenhum atendimento agendado para hoje" />
        ) : (
          todayAppts.map((appt) => (
            <View key={appt.id} style={{ marginBottom: spacing.md }}>
              <AppointmentCard appointment={appt} showDate={false} />

              {/* Botões para pendente */}
              {appt.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <AppButton
                    title="✅ Confirmar"
                    onPress={() => handleConfirm(appt.id)}
                    loading={actionLoading === appt.id}
                    size="sm"
                    variant="primary"
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    title="❌ Recusar"
                    onPress={() => handleReject(appt.id)}
                    loading={actionLoading === appt.id}
                    size="sm"
                    variant="danger"
                    style={{ flex: 1 }}
                  />
                </View>
              )}

              {/* Botão para confirmado */}
              {appt.status === 'confirmed' && (
                <View style={{ marginTop: spacing.sm }}>
                  <AppButton
                    title="✅ Concluir atendimento"
                    onPress={() => markComplete(appt)}
                    loading={actionLoading === appt.id}
                    size="sm"
                  />
                </View>
              )}
            </View>
          ))
        )}

        {/* ── Próximos dias ── */}
        {upcoming.length > todayAppts.length && (
          <>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSize.xl,
                fontWeight: '600',
                marginTop: spacing.xxl,
                marginBottom: spacing.md,
              }}
            >
              Próximos dias
            </Text>
            {upcoming
              .filter((a) => !todayAppts.includes(a))
              .slice(0, 10)
              .map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} showDate />
              ))}
          </>
        )}

        {/* ── Recentes ── */}
        {past.length > 0 && (
          <>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSize.xl,
                fontWeight: '600',
                marginTop: spacing.xxl,
                marginBottom: spacing.md,
              }}
            >
              Recentes
            </Text>
            {past.slice(0, 5).map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} showDate />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
