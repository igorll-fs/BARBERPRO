/* ============================
   BARBERPRO — Notificações Melhoradas
   Lista notificações em tempo real com badge de não lidas
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { Header, AppCard, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { AppNotification } from '../../types/models';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { uid } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const handlePress = async (notif: AppNotification) => {
    // Marcar como lida
    if (!notif.read && uid) {
      try {
        await updateDoc(doc(db, 'users', uid, 'notifications', notif.id), { read: true });
      } catch (e) {
        console.error('Erro ao marcar como lida:', e);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!uid) return;
    const unreadNotifs = notifications.filter((n) => !n.read);
    for (const notif of unreadNotifs) {
      try {
        await updateDoc(doc(db, 'users', uid, 'notifications', notif.id), { read: true });
      } catch (e) {
        console.error('Erro:', e);
      }
    }
  };

  const formatTime = (date: any) => {
    const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      appointment: '📅',
      reminder: '⏰',
      promotion: '🎉',
      chat: '💬',
      review: '⭐',
    };
    return map[type] || '🔔';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={globalStyles.screen}>
      <Header
        title="Notificações"
        subtitle={unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Tudo lido'}
        rightIcon={unreadCount > 0 ? '✓' : undefined}
        onRightPress={unreadCount > 0 ? markAllAsRead : undefined}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
            <AppCard
              style={{
                marginBottom: spacing.md,
                backgroundColor: item.read ? colors.card : colors.primaryBg,
                borderLeftWidth: 4,
                borderLeftColor: item.read ? colors.border : colors.primary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 28, marginRight: spacing.md }}>{getIcon(item.type)}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                    <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600', flex: 1 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 }}>
                    {item.body}
                  </Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="🔔" title="Nenhuma notificação" message="Você está em dia!" />}
      />
    </View>
  );
}
