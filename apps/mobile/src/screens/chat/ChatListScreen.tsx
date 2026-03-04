/* ============================
   BARBERPRO — Lista de Chats
   Tela para funcionários/donos verem todas conversas
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, Avatar, EmptyState } from '../../components';
import { useUser } from '../../store/user';

interface ChatRoom {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhotoURL?: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount?: number;
}

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { shopId, uid } = useUser();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'barbershops', shopId, 'chats'),
      orderBy('lastMessageAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const rooms: ChatRoom[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          shopId: shopId!,
          customerId: data.customerId || '',
          customerName: data.customerName || 'Cliente',
          customerPhotoURL: data.customerPhotoURL,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt,
          unreadCount: data.unreadCount || 0,
        };
      });
      setChatRooms(rooms);
      setLoading(false);
    });

    return () => unsub();
  }, [shopId, uid]);

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = date?.toDate?.() ?? new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return `${Math.floor(diff / 60000)}min`;
    if (hours < 24) return `${hours}h`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Conversas" subtitle={`${chatRooms.length} cliente(s)`} />

      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { shopId: item.shopId, roomId: item.id })}>
            <AppCard
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md,
                paddingVertical: spacing.md,
                backgroundColor: item.unreadCount ? colors.primaryBg : colors.card,
              }}
            >
              <Avatar name={item.customerName} photoUrl={item.customerPhotoURL} size={50} />
              
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: item.unreadCount ? '700' : '600' }}>
                    {item.customerName}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                    {formatTime(item.lastMessageAt)}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      color: item.unreadCount ? colors.text : colors.textSecondary,
                      fontSize: fontSize.sm,
                      flex: 1,
                      fontWeight: item.unreadCount ? '600' : '400',
                    }}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount! > 0 && (
                    <View style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: radius.full,
                      marginLeft: spacing.sm,
                      minWidth: 24,
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '700' }}>
                        {item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="💬" title="Nenhuma conversa" message="Quando clientes enviarem mensagens, elas aparecerão aqui" />
        }
      />
    </View>
  );
}
