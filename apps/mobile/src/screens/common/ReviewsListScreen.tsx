/* ============================
   BARBERPRO — Avaliações da Barbearia (Cliente)
   Lista todas as avaliações de uma barbearia
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, Avatar, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { Review } from '../../types/models';

export default function ReviewsListScreen() {
  const shopId = useUser((s) => s.shopId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [shopId]);

  const loadReviews = async () => {
    if (!shopId || !db) {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'barbershops', shopId, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (e) {
      console.error('Erro ao carregar avaliações:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <View style={globalStyles.screen}>
      <Header title="Avaliações" subtitle={`${reviews.length} avaliação(ões)`} />

      {/* Resumo */}
      {reviews.length > 0 && (
        <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
          <AppCard style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.xs }}>⭐</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.xxxl, fontWeight: '700' }}>
              {avgRating.toFixed(1)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
              Baseado em {reviews.length} avaliação(ões)
            </Text>
          </AppCard>
        </View>
      )}

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReviews} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <AppCard style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Avatar name={item.customerName || 'Cliente'} size={40} photoUrl={item.customerPhoto} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                  {item.customerName || 'Cliente'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={{ fontSize: fontSize.lg }}>
                    {i < item.rating ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
            </View>

            {item.staffName && (
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm }}>
                Atendido por {item.staffName}
              </Text>
            )}

            {item.comment && (
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 20 }}>
                {item.comment}
              </Text>
            )}

            {item.reply && (
              <View style={{ backgroundColor: colors.primaryBg, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md }}>
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600', marginBottom: spacing.xs }}>
                  Resposta da barbearia:
                </Text>
                <Text style={{ color: colors.text, fontSize: fontSize.sm }}>{item.reply}</Text>
              </View>
            )}
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState icon="⭐" title="Nenhuma avaliação" message="Seja o primeiro a avaliar!" />}
      />
    </View>
  );
}
