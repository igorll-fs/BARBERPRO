/* ============================
   BARBERPRO — Relatórios Financeiros (Dono)
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, StatCard, EmptyState } from '../../components';
import { useUser } from '../../store/user';

export default function ReportsScreen() {
  const shopId = useUser((s) => s.shopId);
  const [stats, setStats] = useState({ revenue: 0, total: 0, completed: 0, cancelled: 0, noShow: 0 });
  const [topServices, setTopServices] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const loadReport = async () => {
    if (!shopId || !db) { setLoading(false); return; }
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const apptRef = collection(db, 'barbershops', shopId, 'appointments');
      const snap = await getDocs(apptRef);
      const appts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      // Filtrar por período
      const filtered = appts.filter((a) => {
        const s = a.start?.toDate ? a.start.toDate() : new Date(a.start);
        return s >= startDate;
      });

      const revenue = filtered
        .filter((a) => a.status === 'completed')
        .reduce((sum, a) => sum + (a.priceCents || 0), 0);

      const completed = filtered.filter((a) => a.status === 'completed').length;
      const cancelled = filtered.filter((a) => a.status === 'cancelled').length;
      const noShow = filtered.filter((a) => a.status === 'no-show').length;

      setStats({ revenue, total: filtered.length, completed, cancelled, noShow });

      // Top services
      const svcCount: Record<string, { name: string; count: number; revenue: number }> = {};
      filtered.forEach((a) => {
        const key = a.serviceId || 'unknown';
        if (!svcCount[key]) svcCount[key] = { name: a.serviceName || key, count: 0, revenue: 0 };
        svcCount[key].count++;
        if (a.status === 'completed') svcCount[key].revenue += a.priceCents || 0;
      });
      setTopServices(Object.values(svcCount).sort((a, b) => b.count - a.count).slice(0, 5));
    } catch (e) {
      console.warn('Erro ao gerar relatório:', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, [shopId, period]);

  const periodLabels = { today: 'Hoje', week: 'Semana', month: 'Mês' };

  return (
    <View style={globalStyles.screen}>
      <Header title="Relatórios" subtitle={periodLabels[period]} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReport} tintColor={colors.primary} />}
      >
        {/* Period tabs */}
        <View style={{ flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm }}>
          {(['today', 'week', 'month'] as const).map((p) => (
            <View key={p} style={{
              flex: 1,
              backgroundColor: period === p ? colors.primary : colors.card,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              alignItems: 'center',
            }}>
              <Text
                style={{ color: period === p ? colors.white : colors.textMuted, fontWeight: '600', fontSize: fontSize.sm }}
                onPress={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
          <StatCard icon="💰" label="Receita" value={`R$ ${(stats.revenue / 100).toFixed(0)}`} trend="up" />
          <StatCard icon="📅" label="Agendamentos" value={stats.total} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
          <StatCard icon="✅" label="Concluídos" value={stats.completed} trend="up" />
          <StatCard icon="❌" label="Cancelados" value={stats.cancelled} trend={stats.cancelled > 0 ? 'down' : 'neutral'} />
        </View>

        {/* Top services */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
          Serviços mais populares
        </Text>
        {topServices.length === 0 ? (
          <EmptyState icon="📊" title="Sem dados" message="Agendamentos concluídos aparecerão aqui" />
        ) : (
          topServices.map((svc, i) => (
            <AppCard key={i}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                    #{i + 1} {svc.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{svc.count} agendamentos</Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: fontSize.lg, fontWeight: '700' }}>
                  R$ {(svc.revenue / 100).toFixed(0)}
                </Text>
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
