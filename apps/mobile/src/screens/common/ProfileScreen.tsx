/* ============================
   BARBERPRO — Perfil / Configurações
   ============================ */
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TextInput } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, Avatar, AppButton, AppInput } from '../../components';
import { useUser } from '../../store/user';
import { doSignOut } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { name, email, phone, role, shopId, isDemo, uid, setProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name || '');
  const [editEmail, setEditEmail] = useState(email || '');
  const [editPhone, setEditPhone] = useState(phone || '');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async () => {
    if (!uid || !db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', uid), {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      }, { merge: true });
      setProfile({ name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() });
      setEditing(false);
      Alert.alert('✅ Salvo', 'Perfil atualizado com sucesso.');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!uid || !functions) return;
    setExporting(true);
    try {
      const fn = httpsCallable(functions, 'exportUserData');
      const res: any = await fn({});
      Alert.alert('📦 Dados Exportados', 'Seus dados foram exportados com sucesso. Verifique seu email.');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível exportar dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão removidos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Permanentemente',
          style: 'destructive',
          onPress: async () => {
            if (!uid || !functions) return;
            setDeleting(true);
            try {
              const fn = httpsCallable(functions, 'deleteUserData');
              await fn({});
              Alert.alert('Conta Excluída', 'Seus dados foram removidos.');
              doSignOut();
            } catch (e: any) {
              Alert.alert('Erro', e.message || 'Não foi possível excluir conta.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => doSignOut() },
    ]);
  };

  const roleLabel = role === 'dono' ? 'Proprietário' : role === 'funcionario' ? 'Barbeiro' : 'Cliente';

  return (
    <View style={globalStyles.screen}>
      <Header title="Perfil" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Avatar + Info */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
          <Avatar name={name || 'Usuário'} size={80} />
          <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.md }}>
            {name || 'Usuário'}
          </Text>
          <Text style={{ color: colors.primaryLight, fontSize: fontSize.md, marginTop: spacing.xs }}>
            {roleLabel}
          </Text>
          {isDemo && (
            <Text style={{ color: colors.warning, fontSize: fontSize.sm, marginTop: spacing.xs }}>
              🧪 Modo Demo
            </Text>
          )}
        </View>

        {/* Edição de perfil */}
        {editing ? (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md }}>Editar Perfil</Text>
            <AppInput label="Nome" value={editName} onChangeText={setEditName} />
            <AppInput label="Email" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            <AppInput label="Telefone" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <AppButton title="Salvar" onPress={handleSaveProfile} loading={saving} style={{ flex: 1 }} />
              <AppButton title="Cancelar" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
            </View>
          </AppCard>
        ) : (
          <AppCard>
            <InfoRow label="Email" value={email || 'Não informado'} />
            <InfoRow label="Telefone" value={phone || 'Não informado'} />
            <InfoRow label="ID" value={uid || '-'} />
            {shopId && <InfoRow label="Barbearia" value={shopId} />}
          </AppCard>
        )}

        {/* Ações */}
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {!editing && (
            <AppButton title="Editar perfil" variant="secondary" icon="✏️" onPress={() => setEditing(true)} />
          )}
          <AppButton title="Exportar meus dados" variant="ghost" icon="📦" onPress={handleExportData} loading={exporting} />
          <AppButton title="Excluir minha conta" variant="ghost" icon="🗑️" onPress={handleDeleteAccount} loading={deleting} />
          <AppButton title="Sair" variant="danger" icon="🚪" onPress={handleSignOut} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '500' }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
