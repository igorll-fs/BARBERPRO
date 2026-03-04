/* ============================
   BARBERPRO — Fidelidade (Cliente)
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, Badge, EmptyState, AppButton } from '../../components';
import { useUser } from '../../store/user';
import type { LoyaltyRecord, LoyaltyReward } from '../../types/models';

export default function LoyaltyScreen() {
  const { uid, shopId } = useUser();
  const [loyalty, setLoyalty] = useState<LoyaltyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!shopId || !uid || !db) { setLoading(false); return; }
    try {
      const snap = await getDoc(doc(db, 'barbershops', shopId, 'loyalty', uid));
      if (snap.exists()) {
        setLoyalty(snap.data() as LoyaltyRecord);
      }
    } catch (e) {
      console.warn('Erro ao carregar fidelidade:', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [uid, shopId]);

  const visits = loyalty?.visits || 0;
  const points = loyalty?.points || 0;
  const rewards = loyalty?.rewards || [];
  const nextRewardAt = 10; // A cada 10 visitas
  const progress = Math.min(visits / nextRewardAt, 1);

  return (
    <View style={globalStyles.screen}>
      <Header title="Fidelidade" subtitle="Acumule pontos e ganhe recompensas" />

      <View style={{ padding: spacing.lg }}>
        {/* Progress Card */}
        <AppCard>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>⭐</Text>
          <Text style={{ color: colors.text, fontSize: fontSize.xxxl, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm }}>
            {points} pontos
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.xs }}>
            {visits} visitas realizadas
          </Text>

          {/* Progress bar */}
          <View style={{ marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Progresso</Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>
                {visits}/{nextRewardAt}
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.bgLight, borderRadius: radius.full }}>
              <View style={{
                height: 8,
                width: `${progress * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: radius.full,
              }} />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs, textAlign: 'center' }}>
              {visits >= nextRewardAt ? '🎉 Parabéns! Recompensa disponível!' : `Faltam ${nextRewardAt - visits} visitas para a próxima recompensa`}
            </Text>
          </View>
        </AppCard>

        {/* Rewards */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.md }}>
          Recompensas
        </Text>
        {rewards.length === 0 ? (
          <EmptyState icon="🎁" title="Nenhuma recompensa ainda" message="Continue acumulando pontos!" />
        ) : (
          <FlatList
            data={rewards}
            keyExtractor={(item, i) => item.id || String(i)}
            renderItem={({ item }) => (
              <AppCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                      {item.description}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
                      {item.type === 'free_service' ? '🎟️ Serviço grátis' : item.type === 'discount' ? '💰 Desconto' : '🎁 Brinde'}
                    </Text>
                  </View>
                  <Badge text={item.redeemed ? 'Usado' : 'Disponível'} variant={item.redeemed ? 'info' : 'success'} />
                </View>
              </AppCard>
            )}
          />
        )}
      </View>
    </View>
  );
}
