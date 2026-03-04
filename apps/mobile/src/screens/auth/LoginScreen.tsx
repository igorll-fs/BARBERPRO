/* ============================
   BARBERPRO — Login Screen
   OTP WhatsApp + Email + Demo
   ============================ */
import React from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { AppButton, AppInput, AppCard } from '../../components';
import { startOtpWhatsApp, verifyOtpWhatsApp, signInOwnerEmail } from '../../services/auth';
import { getClaims } from '../../services/claims';
import { useUser } from '../../store/user';
import type { UserRole } from '../../types/models';

export default function LoginScreen() {
  const [role, setRole] = React.useState<UserRole>('cliente');
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const setDemo = useUser((s) => s.setDemo);

  const requestOtp = async () => {
    if (!phone.trim()) { Alert.alert('Erro', 'Digite seu telefone'); return; }
    setLoading(true);
    try {
      await startOtpWhatsApp(phone);
      setOtpSent(true);
      Alert.alert('Código enviado', 'Confira o WhatsApp para o código de 6 dígitos.');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!code.trim()) { Alert.alert('Erro', 'Digite o código'); return; }
    setLoading(true);
    try {
      await verifyOtpWhatsApp(phone, code, role);
      // Auth listener no App.tsx irá redirecionar automaticamente
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
    setLoading(false);
  };

  const ownerEmailLogin = async () => {
    if (!email.trim() || !password.trim()) { Alert.alert('Erro', 'Preencha email e senha'); return; }
    setLoading(true);
    try {
      await signInOwnerEmail(email, password);
      // Auth listener no App.tsx irá redirecionar automaticamente
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
    setLoading(false);
  };

  const demoLogin = () => {
    setDemo(role, 'demo');
    // store.isAuthenticated se torna true → App redireciona
  };

  const roles: { key: UserRole; label: string; icon: string }[] = [
    { key: 'cliente', label: 'Cliente', icon: '👤' },
    { key: 'dono', label: 'Proprietário', icon: '🏪' },
    { key: 'funcionario', label: 'Barbeiro', icon: '✂️' },
  ];

  return (
    <KeyboardAvoidingView style={globalStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xxl }}>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>✂️</Text>
          <Text style={{ fontSize: fontSize.title, fontWeight: '800', color: colors.primary }}>
            BARBERPRO
          </Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
            Sua barbearia na palma da mão
          </Text>
        </View>

        {/* Seleção de role */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl }}>
          {roles.map((r) => (
            <View
              key={r.key}
              style={{
                flex: 1,
                backgroundColor: role === r.key ? colors.primaryBg : colors.card,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderColor: role === r.key ? colors.primary : colors.borderLight,
                paddingVertical: spacing.md,
                alignItems: 'center',
              }}
            >
              <Text onPress={() => { setRole(r.key); setOtpSent(false); }} style={{ fontSize: 20 }}>{r.icon}</Text>
              <Text
                onPress={() => { setRole(r.key); setOtpSent(false); }}
                style={{ color: role === r.key ? colors.primary : colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginTop: 4 }}
              >
                {r.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Formulário por role */}
        {role === 'cliente' && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Login via WhatsApp
            </Text>
            <AppInput label="Telefone" value={phone} onChangeText={setPhone} placeholder="+55 11 99999-9999" keyboardType="phone-pad" />
            {!otpSent ? (
              <AppButton title="Enviar código" onPress={requestOtp} loading={loading} icon="📱" />
            ) : (
              <>
                <AppInput label="Código de 6 dígitos" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" maxLength={6} />
                <AppButton title="Entrar" onPress={verifyOtp} loading={loading} />
              </>
            )}
          </AppCard>
        )}

        {role === 'dono' && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Login do Proprietário
            </Text>
            <AppInput label="E-mail" value={email} onChangeText={setEmail} placeholder="email@exemplo.com" autoCapitalize="none" keyboardType="email-address" />
            <AppInput label="Senha" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
            <AppButton title="Entrar" onPress={ownerEmailLogin} loading={loading} icon="🔐" />
          </AppCard>
        )}

        {role === 'funcionario' && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
              Acesso do Barbeiro
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 }}>
              Use o link de convite enviado pelo dono da barbearia para ativar sua conta.
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.md }}>
              Ainda não tem convite? Peça ao dono para enviar um link.
            </Text>
          </AppCard>
        )}

        {/* Demo */}
        <View style={{ marginTop: spacing.xxxl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, fontSize: fontSize.sm }}>
            🧪 Sem Firebase configurado?
          </Text>
          <AppButton title="Entrar em Modo Demo" variant="outline" onPress={demoLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
