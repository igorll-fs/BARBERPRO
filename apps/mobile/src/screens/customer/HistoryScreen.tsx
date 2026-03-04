/* ============================
   BARBERPRO — Histórico do Cliente
   Todos os agendamentos passados, possibilidade de reagendar
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { Appointment } from '../../types/models';
import type { RootStackParamList } from '../../types/navigation';

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { uid, shopId } = useUser();
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadHistory();
  }, [uid, shopId, filter]);

  const loadHistory = async () => {
    if (!uid || !shopId || !db) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const now = Timestamp.now();
      let q = query(
        collection(db, 'barbershops', shopId, 'appointments'),
        where('customerUid', '==', uid),
        where('start', '<', now),
        orderBy('start', 'desc')
      );

      const snap = await getDocs(q);
      let data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      // Filtrar por status
      if (filter !== 'all') {
        data = data.filter((a) => a.status === filter);
      }

      setHistory(data);
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date: any) => {
    const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Concluído', variant: 'success' as const };
      case 'cancelled':
        return { text: 'Cancelado', variant: 'danger' as const };
      case 'no-show':
        return { text: 'Não compareceu', variant: 'warning' as const };
      default:
        return { text: status, variant: 'info' as const };
    }
  };

  const handleRebook = (appt: Appointment) => {
    navigation.navigate('Booking', { shopId: shopId!, serviceId: appt.serviceId });
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Histórico" subtitle={`${history.length} atendimento(s)`} />

      {/* Filtros */}
      <View style={{ flexDirection: 'row', padding: spacing.lg, gap: spacing.sm }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'completed', label: 'Concluídos' },
          { key: 'cancelled', label: 'Cancelados' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key as any)}
            style={{
              flex: 1,
              backgroundColor: filter === f.key ? colors.primary : colors.card,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: filter === f.key ? colors.white : colors.textMuted,
                fontWeight: '600',
                fontSize: fontSize.sm,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const statusInfo = getStatusLabel(item.status);
          return (
            <AppCard style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                    {item.serviceName || 'Serviço'}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                    📅 {formatDate(item.start)} às {formatTime(item.start)}
                  </Text>
                  {item.staffName && (
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                      ✂️ {item.staffName}
                    </Text>
                  )}
                </View>
                <Badge text={statusInfo.text} variant={statusInfo.variant} />
              </View>

              {item.priceCents && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Valor pago</Text>
                  <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '700' }}>
                    {formatCurrency(item.priceCents)}
                  </Text>
                </View>
              )}

              {item.cancelReason && (
                <View style={{ backgroundColor: colors.dangerBg, padding: spacing.sm, borderRadius: radius.sm, marginTop: spacing.sm }}>
                  <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>
                    Motivo: {item.cancelReason}
                  </Text>
                </View>
              )}

              {item.status === 'completed' && (
                <TouchableOpacity
                  onPress={() => handleRebook(item)}
                  style={{
                    backgroundColor: colors.primaryBg,
                    borderRadius: radius.md,
                    paddingVertical: spacing.sm,
                    alignItems: 'center',
                    marginTop: spacing.md,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
                    🔄 Reagendar este serviço
                  </Text>
                </TouchableOpacity>
              )}
            </AppCard>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="📜"
            title={filter === 'all' ? 'Nenhum histórico' : 'Nenhum resultado'}
            message={
              filter === 'all'
                ? 'Seus atendimentos concluídos aparecerão aqui'
                : 'Nenhum agendamento encontrado com este filtro'
            }
          />
        }
      />
    </View>
  );
}
