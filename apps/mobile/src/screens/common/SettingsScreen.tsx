/* ============================
   BARBERPRO — Configurações
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, Switch, Linking } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { Header, AppCard, AppButton } from '../../components';
import { useUser } from '../../store/user';
import { doSignOut } from '../../hooks/useAuth';
import { openBillingPortal } from '../../services/subscriptions';
import { registerForPushNotificationsAsync, savePushToken } from '../../services/notifications';

export default function SettingsScreen() {
  const { role, shopId, uid, pushToken } = useUser();
  const setPushToken = useUser((s) => s.setPushToken);
  const [notifEnabled, setNotifEnabled] = useState(!!pushToken);
  const [exporting, setExporting] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    setNotifEnabled(value);
    if (value && uid) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        await savePushToken(uid, token).catch(console.warn);
      } else {
        setNotifEnabled(false);
        Alert.alert('Permissão negada', 'Habilite as notificações nas configurações do dispositivo.');
      }
    }
  };

  const handleExportData = async () => {
    if (!functions) return;
    setExporting(true);
    try {
      const fn = httpsCallable(functions, 'exportUserData');
      await fn({});
      Alert.alert('📦 Dados Exportados', 'Seus dados foram exportados com sucesso.');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível exportar dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!functions) return;
            try {
              const fn = httpsCallable(functions, 'deleteUserData');
              await fn({});
              Alert.alert('Conta Excluída', 'Seus dados foram removidos.');
              doSignOut();
            } catch (e: any) {
              Alert.alert('Erro', e.message || 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Configurações" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>

        {/* Notificações */}
        <AppCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>Notificações</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Receber lembretes e avisos</Text>
            </View>
            <Switch value={notifEnabled} onValueChange={handleToggleNotifications} trackColor={{ true: colors.primary }} />
          </View>
        </AppCard>

        {/* Assinatura (dono) */}
        {role === 'dono' && shopId && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>Assinatura</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
              Gerencie sua assinatura BarberPro
            </Text>
            <AppButton title="Gerenciar assinatura" variant="outline" size="sm" style={{ marginTop: spacing.md }}
              onPress={() => openBillingPortal(shopId).catch((e: any) => Alert.alert('Erro', e.message))} />
          </AppCard>
        )}

        {/* Sobre */}
        <AppCard>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>Sobre</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>BarberPro v1.0.0</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>© 2026 BarberPro</Text>
        </AppCard>

        {/* LGPD */}
        <AppCard>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>Privacidade (LGPD)</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <AppButton title="Exportar meus dados" variant="ghost" size="sm" onPress={handleExportData} loading={exporting} />
            <AppButton title="Excluir minha conta" variant="ghost" size="sm" onPress={handleDeleteAccount} />
            <AppButton title="Política de Privacidade" variant="ghost" size="sm" onPress={() => Linking.openURL('https://barberpro.app/privacidade')} />
          </View>
        </AppCard>

        <AppButton title="Sair da conta" variant="danger" icon="🚪" style={{ marginTop: spacing.lg }}
          onPress={() => {
            Alert.alert('Sair', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => doSignOut() },
            ]);
          }} />
      </ScrollView>
    </View>
  );
}
