/* ============================
   BARBERPRO — Setup da Barbearia
   ============================ */
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, radius, globalStyles, shadows } from '../../theme';
import { Header, AppButton, AppInput, AppCard } from '../../components';
import { useUser } from '../../store/user';
import type { RootStackParamList } from '../../types/navigation';

export default function OwnerSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setAuth } = useUser();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const fn = httpsCallable(functions, 'ensureOwnerShop');
      const res: any = await fn({ name: name.trim(), slug: slug.trim().toLowerCase() });
      const shopId = res.data?.shopId || slug.trim().toLowerCase();
      // Atualizar store com shopId
      setAuth(useUser.getState().uid || '', 'dono', shopId);
      navigation.reset({ index: 0, routes: [{ name: 'OwnerTabs' }] });
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível criar a barbearia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Configurar Barbearia" />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: spacing.lg }}>💈</Text>
        <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm }}>
          Crie sua barbearia
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.xxl }}>
          Configure os dados iniciais para começar a usar o BarberPro
        </Text>

        <AppCard style={{ ...shadows.md }}>
          <AppInput
            label="Nome da barbearia"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Barbearia do João"
          />
          <AppInput
            label="Slug (URL pública)"
            value={slug}
            onChangeText={(t: string) => setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="ex: barbearia-joao"
            autoCapitalize="none"
          />
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: -spacing.sm, marginBottom: spacing.lg }}>
            barberpro.app/{slug || 'seu-slug'}
          </Text>

          <AppButton title="Criar barbearia" onPress={create} loading={loading} />
        </AppCard>
      </ScrollView>
    </View>
  );
}
