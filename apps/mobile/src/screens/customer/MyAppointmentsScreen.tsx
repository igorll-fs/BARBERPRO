/* ============================
   BARBERPRO — Meus Agendamentos (Cliente)
   ============================ */
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Alert, RefreshControl } from 'react-native';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppointmentCard, EmptyState, AppButton } from '../../components';
import { useAppointments } from '../../hooks';
import { useUser } from '../../store/user';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

export default function MyAppointmentsScreen() {
  const { upcoming, past, loading } = useAppointments('customer');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const uid = useUser((s) => s.uid);

  const data = tab === 'upcoming' ? upcoming : past;

  const cancelAppointment = (apptId: string, shopId: string) => {
    Alert.alert('Cancelar agendamento', 'Tem certeza?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            const fn = httpsCallable(functions, 'cancelAppointment');
            await fn({ shopId, appointmentId: apptId });
            Alert.alert('Cancelado', 'Seu agendamento foi cancelado.');
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Meus Agendamentos" rightIcon="🔔" />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        {(['upcoming', 'past'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.textMuted, fontWeight: '600', fontSize: fontSize.md }}>
              {t === 'upcoming' ? 'Próximos' : 'Histórico'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => {
              if (item.status === 'pending' || item.status === 'confirmed') {
                cancelAppointment(item.id, item.shopId);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'upcoming' ? '📅' : '📋'}
            title={tab === 'upcoming' ? 'Nenhum agendamento' : 'Sem histórico'}
            message={tab === 'upcoming' ? 'Agende um serviço para aparecer aqui' : 'Seus agendamentos passados aparecerão aqui'}
          />
        }
      />
    </View>
  );
}
