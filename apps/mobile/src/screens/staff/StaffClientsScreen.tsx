/* ============================
   BARBERPRO — Lista de Clientes do Staff
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { Header, AppCard, Avatar, AppButton, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';

interface ClientInfo {
  uid: string;
  name?: string;
  phone?: string;
  visitCount: number;
  lastVisit?: Date;
  blocked?: boolean;
}

export default function StaffClientsScreen() {
  const shopId = useUser((s) => s.shopId);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !db) { setLoading(false); return; }
    loadClients();
  }, [shopId]);

  const loadClients = async () => {
    if (!shopId || !db) return;
    setLoading(true);
    try {
      const apptSnap = await getDocs(collection(db, 'barbershops', shopId, 'appointments'));
      const clientMap: Record<string, ClientInfo> = {};
      apptSnap.docs.forEach((d) => {
        const data = d.data() as any;
        const cuid = data.customerUid;
        if (!cuid) return;
        if (!clientMap[cuid]) {
          clientMap[cuid] = { uid: cuid, name: data.customerName, visitCount: 0 };
        }
        clientMap[cuid].visitCount++;
        const start = data.start?.toDate ? data.start.toDate() : new Date(data.start);
        if (!clientMap[cuid].lastVisit || start > clientMap[cuid].lastVisit!) {
          clientMap[cuid].lastVisit = start;
        }
      });
      setClients(Object.values(clientMap).sort((a, b) => b.visitCount - a.visitCount));
    } catch (e) {
      console.warn('Erro:', e);
    }
    setLoading(false);
  };

  const blockClient = (client: ClientInfo) => {
    Alert.alert('Bloquear cliente', `Bloquear ${client.name || client.uid}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Bloquear', style: 'destructive', onPress: async () => {
          try {
            const fn = httpsCallable(functions, 'blockCustomer');
            await fn({ customerUid: client.uid, reason: 'Bloqueado pelo barbeiro' });
            Alert.alert('Bloqueado', 'Cliente foi bloqueado.');
            loadClients();
          } catch (e: any) { Alert.alert('Erro', e.message); }
        },
      },
    ]);
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Clientes" subtitle={`${clients.length} cliente(s)`} />
      <FlatList
        data={clients}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => (
          <AppCard>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={item.name || 'Cliente'} size={40} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {item.name || item.uid}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                  {item.visitCount} visitas · Última: {item.lastVisit?.toLocaleDateString('pt-BR') || '-'}
                </Text>
              </View>
              {item.blocked ? (
                <Badge text="Bloqueado" variant="danger" />
              ) : (
                <AppButton title="Bloquear" variant="ghost" size="sm" onPress={() => blockClient(item)} />
              )}
            </View>
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState icon="👤" title="Nenhum cliente" message="Clientes aparecerão após agendamentos" />}
      />
    </View>
  );
}
