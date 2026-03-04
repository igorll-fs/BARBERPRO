/* ============================
   BARBERPRO — App Root
   Auth persistente + Navegação por role
   ============================ */
import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthListener } from './hooks/useAuth';
import { useUser } from './store/user';
import { LoadingScreen } from './components';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme';
import {
  registerForPushNotificationsAsync,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from './services/notifications';

// ─── Error Boundary ─────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1a0000', padding: 20, paddingTop: 60 }}>
          <Text style={{ color: '#ff4444', fontSize: 22, fontWeight: 'bold' }}>Erro no App</Text>
          <Text style={{ color: '#ff8888', fontSize: 14, marginTop: 10 }}>{this.state.error?.message}</Text>
          <Text style={{ color: '#ff6666', fontSize: 11, marginTop: 10 }}>{this.state.error?.stack?.slice(0, 500)}</Text>
          <View style={{ marginTop: 20 }}>
            <Button title="Tentar novamente" onPress={() => this.setState({ hasError: false, error: null })} />
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// ─── Theme para NavigationContainer ─────────────────────
const barberProTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.borderLight,
  },
};

// ─── Deep Linking ───────────────────────────────────────
const linking = {
  prefixes: ['barberpro://', 'https://barberpro.app'],
  config: {
    screens: {
      Login: 'login',
      CustomerTabs: 'cliente',
      OwnerTabs: 'dono',
      StaffTabs: 'funcionario',
    },
  },
};

// ─── Main App ───────────────────────────────────────────
function AppContent() {
  // Ouve onAuthStateChanged e sincroniza store
  useAuthListener();

  const isReady = useUser((s) => s.isReady);
  const isAuthenticated = useUser((s) => s.isAuthenticated);
  const role = useUser((s) => s.role);
  const uid = useUser((s) => s.uid);
  const setPushToken = useUser((s) => s.setPushToken);

  // ─── Push Notifications ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !uid) return;

    let receivedSub: any;
    let responseSub: any;

    // Registrar token (com try-catch para não quebrar o app)
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setPushToken(token);
          savePushToken(uid, token).catch(console.warn);
        }
      })
      .catch((err) => console.warn('⚠️ Push registration error:', err));

    // Listeners (fora da promise para evitar timing issues)
    try {
      receivedSub = addNotificationReceivedListener((notification) => {
        console.log('🔔 Notificação recebida:', notification.request.content.title);
      });

      responseSub = addNotificationResponseReceivedListener((response) => {
        console.log('🔔 Notificação tocada:', response.notification.request.content.data);
      });
    } catch (err) {
      console.warn('⚠️ Listeners error:', err);
    }

    return () => {
      try {
        receivedSub?.remove();
        responseSub?.remove();
      } catch {}
    };
  }, [isAuthenticated, uid]);

  if (!isReady) {
    return <LoadingScreen message="Iniciando BarberPro..." />;
  }

  return (
    <NavigationContainer theme={barberProTheme} linking={linking}>
      <AppNavigator isAuthenticated={isAuthenticated} role={role} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// Exportar tipos para compatibilidade com telas que importam de App
export type { RootStackParamList } from './types/navigation';
