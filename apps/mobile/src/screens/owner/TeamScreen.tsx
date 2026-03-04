/* ============================
   BARBERPRO — Gerenciar Equipe (Dono)
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { Header, AppCard, Avatar, AppButton, Badge, EmptyState, AppInput } from '../../components';
import { useUser } from '../../store/user';
import type { StaffMember } from '../../types/models';

export default function TeamScreen() {
  const shopId = useUser((s) => s.shopId);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invName, setInvName] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!shopId || !db) { setLoading(false); return; }
    const unsub = onSnapshot(collection(db, 'barbershops', shopId, 'staff'), (snap) => {
      setStaff(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
    return () => unsub();
  }, [shopId]);

  const invite = async () => {
    if (!invName.trim() || !invEmail.trim()) { Alert.alert('Erro', 'Preencha nome e email'); return; }
    setInviting(true);
    try {
      const fn = httpsCallable(functions, 'inviteStaff');
      const res: any = await fn({ shopId, email: invEmail, name: invName });
      Alert.alert('Convite enviado!', `Link: ${res.data?.inviteUrl}`);
      setShowInvite(false);
      setInvEmail('');
      setInvName('');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
    setInviting(false);
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Equipe" subtitle={`${staff.length} barbeiro(s)`} rightIcon="➕" onRightPress={() => setShowInvite(!showInvite)} />

      {showInvite && (
        <AppCard style={{ marginHorizontal: spacing.lg }}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md }}>
            Convidar barbeiro
          </Text>
          <AppInput label="Nome" value={invName} onChangeText={setInvName} placeholder="Nome do barbeiro" />
          <AppInput label="Email" value={invEmail} onChangeText={setInvEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
          <AppButton title="Enviar convite" onPress={invite} loading={inviting} />
        </AppCard>
      )}

      <FlatList
        data={staff}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} tintColor={colors.primary} onRefresh={() => {}} />}
        renderItem={({ item }) => (
          <AppCard>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={item.name || 'Barbeiro'} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {item.name || 'Barbeiro'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                  {item.email || item.phone || item.uid}
                </Text>
              </View>
              <Badge text={item.active ? 'Ativo' : 'Inativo'} variant={item.active ? 'success' : 'danger'} />
            </View>
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState icon="👥" title="Nenhum barbeiro" message="Convide barbeiros para sua equipe" />}
      />
    </View>
  );
}
