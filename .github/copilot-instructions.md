# BarberPro — Instruções para Agentes de IA

## Contexto Geral
App completo para gestão de barbearias com **3 perfis de usuário** (cliente, dono, funcionario), cada um com navegação e telas específicas. Monorepo com mobile (Expo), web pública (Vite) e Cloud Functions (Firebase).

## Arquitetura Principal

### Autenticação Multi-Role
- Firebase Auth + **Custom Claims** (`role`, `shopId`) definem permissões e navegação
- Claims são sincronizados com **Zustand** ([user.ts](apps/mobile/src/store/user.ts))
- Hook `useAuthListener()` ([useAuth.ts](apps/mobile/src/hooks/useAuth.ts)) ouve `onAuthStateChanged` e sincroniza store automaticamente
- **Navegação condicional** por role: [AppNavigator.tsx](apps/mobile/src/navigation/AppNavigator.tsx) renderiza diferentes tabs (CustomerTab, OwnerTab, StaffTab)

### Estrutura de Dados
- **Firestore**: `/barbershops/{shopId}` é a raiz principal com subcoleções: `services`, `staff`, `appointments`, `loyalty`, etc.
- Modelo completo em [types/models.ts](apps/mobile/src/types/models.ts) e [docs/modeling.md](docs/modeling.md)
- **Security Rules**: Baseadas em custom claims ([firestore.rules](firebase/firestore.rules)). Owners acessam `shopId`, Staff também, Clientes veem apenas seus dados

### Modo DEV vs PROD
- Detectado automaticamente em [firebase.ts](apps/mobile/src/services/firebase.ts): se `__DEV__` e sem variáveis de ambiente, conecta aos **emuladores Firebase locais**
- Config hardcoded para dev: `projectId: 'barberpro-dev'`, conecta a `127.0.0.1:9099` (Auth), `:8080` (Firestore), etc.
- **NUNCA** quebre o app se Firebase não estiver disponível — use fallbacks e modo demo

## Padrões de Código

### Componentes
- **Design system centralizado** em [theme.ts](apps/mobile/src/theme.ts): `colors`, `spacing`, `fontSize`, `radius`
- Componentes reutilizáveis em `src/components/`: `AppButton`, `AppInput`, `AppCard`, etc.
- Props tipadas com variantes (`variant`, `size`), sempre com defaults sensatos
- Exemplo: `<AppButton variant="primary" size="md" loading={false} />`

### State Management
- **Zustand** para auth/user state ([store/user.ts](apps/mobile/src/store/user.ts))
- Actions: `setAuth()`, `setProfile()`, `signOut()`, `setDemo()` (modo offline)
- Custom hooks em `hooks/` para lógica compartilhada (ex.: `useAppointments`, `useShop`)

### Nomenclatura
- Arquivos/componentes: **PascalCase** (`LoginScreen.tsx`, `AppButton.tsx`)
- Serviços/utils: **camelCase** (`firebase.ts`, `auth.ts`)
- Types: sufixo descritivo (`UserRole`, `CustomerTabParamList`)
- Comentários separadores visuais: `// ─── Seção ───────────────`

### Tratamento de Erros
- `ErrorBoundary` global em [App.tsx](apps/mobile/src/App.tsx#L16-L41)
- Try-catch silencioso em inicialização do Firebase para **não quebrar o app**
- Logs com emojis: `🔧 Modo DEV`, `❌ Erro`, `⚠️ Aviso`

## Workflows Essenciais

### Desenvolvimento
```powershell
# Mobile (raiz do monorepo)
npm run mobile              # Expo start
npm run mobile:clear        # Limpa cache

# Emuladores Firebase (para DEV local)
cd firebase; firebase emulators:start

# Testes mobile
cd apps/mobile; npm test
```

### Como Criar Novo Serviço Firebase
**Exemplo: Serviço de reviews**

1. **Criar arquivo** (`services/reviews.ts`):
```typescript
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Review { id: string; shopId: string; rating: number; comment: string; }

export async function listReviews(shopId: string): Promise<Review[]> {
  const q = query(collection(db, 'barbershops', shopId, 'reviews'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
}

export async function addReview(shopId: string, data: Omit<Review, 'id'>): Promise<void> {
  await addDoc(collection(db, 'barbershops', shopId, 'reviews'), data);
}
```

2. **Criar custom hook** (`hooks/useReviews.ts`):
```typescript
import { useState, useEffect } from 'react';
import { listReviews, type Review } from '../services/reviews';

export function useReviews(shopId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!shopId) return;
    listReviews(shopId)
      .then(setReviews)
      .catch(err => console.error('Erro ao buscar reviews:', err))
      .finally(() => setLoading(false));
  }, [shopId]);
  
  return { reviews, loading };
}
```

3. **Usar no componente**:
```tsx
import { useReviews } from '../../hooks/useReviews';
import { useUser } from '../../store/user';

function MyScreen() {
  const shopId = useUser(s => s.shopId);
  const { reviews, loading } = useReviews(shopId!);
  
  if (loading) return <LoadingScreen />;
  return <FlatList data={reviews} ... />;
}
```

### Estrutura de Features
1. Criar tipo em `types/models.ts` ou `types/navigation.ts`
2. Adicionar tela em `screens/{role}/` (customer, owner, staff, common)
3. Registrar rota em `navigation/AppNavigator.tsx` no tab correto
4. Criar serviço em `services/` se precisar Firebase
5. Adicionar custom hook em `hooks/` se lógica reutilizável

### Como Adicionar Nova Tela
**Exemplo: Tela de histórico para cliente**

1. **Criar tipo de navegação** ([types/navigation.ts](apps/mobile/src/types/navigation.ts)):
```typescript
export type CustomerTabParamList = {
  HistoryScreen: undefined; // ou { customerId: string } se precisar params
  // ...outras telas
};
```

2. **Criar componente** (`screens/customer/HistoryScreen.tsx`):
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useUser } from '../../store/user';
import { AppCard } from '../../components';
import { colors, spacing } from '../../theme';

export default function HistoryScreen() {
  const uid = useUser(s => s.uid);
  const shopId = useUser(s => s.shopId);
  
  // Lógica aqui
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg }}>
      <AppCard>
        <Text style={{ color: colors.text }}>Histórico</Text>
      </AppCard>
    </View>
  );
}
```

3. **Registrar no navegador** ([AppNavigator.tsx](apps/mobile/src/navigation/AppNavigator.tsx)):
```tsx
import HistoryScreen from '../screens/customer/HistoryScreen';

// Dentro de CustomerTabNavigator
<CTab.Screen 
  name="HistoryScreen" 
  component={HistoryScreen}
  options={{ 
    tabBarIcon: ({ focused }) => <TabIcon icon="📜" label="Histórico" focused={focused} /> 
  }} 
/>
```

4. **Navegar para tela**:
```tsx
import { useNavigation } from '@react-navigation/native';
const nav = useNavigation();
nav.navigate('HistoryScreen');
```

### Modificar Navegação
- **CustomerTabNavigator**, **OwnerTabNavigator**, **StaffTabNavigator** são separados
- Cada tab tem `tabBarIcon` com emoji + label (via `<TabIcon />`)
- Stack Navigator para modals/details (BookingScreen, NotificationsScreen, etc.)

## Regras Críticas
1. **Sempre checar role antes de renderizar UI sensível**: `const role = useUser(s => s.role)`
2. **Testar offline**: O app deve funcionar (modo demo) mesmo sem Firebase configurado
3. **Claims são a fonte de verdade**: Nunca guardar role apenas no Firestore user doc — claims controlam Security Rules
4. **PowerShell nos scripts**: Workspace é Windows, usar PowerShell para comandos (`;` para separar, nunca `&&`)
5. **Emuladores em DEV**: Use `firebase emulators:start` antes de rodar mobile no modo dev

## Cloud Functions & Backend

### Estrutura ([functions/src/index.ts](firebase/functions/src/index.ts))
- **HTTPS Callables**: `startOtpWhatsApp`, `verifyOtpWhatsApp`, `createAppointmentClient`, `cancelAppointment`, etc.
- **Triggers Firestore**: `onUserCreate` (define claims), `onAppointmentCreate` (notificações), `onSubscriptionUpdate`
- **Scheduled Functions**: `checkExpiredSubscriptions` (cron diário)

### Padrões de Segurança Obrigatórios
```typescript
// ✅ SEMPRE validar inputs
if (!data.shopId || !data.serviceId) {
  throw new functions.https.HttpsError("invalid-argument", "Dados incompletos");
}

// ✅ SEMPRE validar permissões via claims
const shopId = context.auth?.token?.shopId;
if (context.auth?.token?.role !== 'dono' || shopId !== data.shopId) {
  throw new functions.https.HttpsError("permission-denied", "Sem permissão");
}

// ✅ SEMPRE sanitizar strings (telefone, email)
const phone = data.phone.replace(/[^\d+]/g, '');

// ✅ SEMPRE usar rate limiting em endpoints sensíveis
// Exemplo: max 3 OTP em 10 minutos (ver startOtpWhatsApp)
```

### Como Adicionar Nova Function
1. Definir em `functions/src/index.ts`: `export const myFunction = functions.https.onCall(...)`
2. Build: `cd firebase/functions && npm run build`
3. Deploy: `firebase deploy --only functions:myFunction`
4. Client: `httpsCallable(functions, 'myFunction')({ param: 'value' })`

## Fluxo de Agendamento (Business Logic)

### Criação de Agendamento (Cliente)
1. Cliente busca **slots disponíveis**: `getAvailableSlots(shopId, serviceId, date, staffUid?)` ([scheduling.ts](apps/mobile/src/services/scheduling.ts))
2. Cliente chama **Cloud Function**: `createAppointmentClient(shopId, serviceId, startISO, staffUid?)` 
3. Function valida:
   - Horário não conflita com outros agendamentos
   - Staff está disponível (se especificado)
   - Respeita `dailyLimitPerCustomer` (anti-spam)
4. Cria doc em `/barbershops/{shopId}/appointments/{id}` com `status: 'pending'`
5. Trigger `onAppointmentCreate` envia **WhatsApp** via Twilio para staff

### Cancelamento/Reagendamento
- **Cancelar**: `cancelAppointment(shopId, appointmentId)` → atualiza `status: 'cancelled'` + notifica
- **Reagendar**: `rescheduleAppointment(shopId, appointmentId, newStartISO, staffUid?)` → valida novo slot + atualiza

### Status de Agendamento
- `pending` (criado, aguardando)
- `confirmed` (staff/dono confirmou)
- `cancelled` (cancelado por cliente/staff)
- `no-show` (cliente não compareceu)
- `completed` (serviço concluído)

## Sistema de Custom Claims

### Como Claims São Definidos
- **Criação de usuário**: Trigger `onUserCreate` em Cloud Functions define claims iniciais (`role: 'cliente'`)
- **Tornar Dono**: Function `assignOwnerRole(uid, shopId)` → `admin.auth().setCustomUserClaims(uid, { role: 'dono', shopId })`
- **Tornar Staff**: Function `assignStaffRole(uid, shopId)` → claims `{ role: 'funcionario', shopId }`

### Sincronização Client-Side
- Hook `useAuthListener()` força **refresh do token**: `getIdTokenResult(user, true)` para pegar claims atualizados
- Sincroniza com Zustand: `setAuth(uid, role, shopId)` ([useAuth.ts](apps/mobile/src/hooks/useAuth.ts#L27-L31))
- **CRÍTICO**: Após atualizar claims no backend, cliente deve fazer logout/login OU forçar refresh do token

### Usando Claims na UI
```typescript
const role = useUser(s => s.role);
const shopId = useUser(s => s.shopId);

if (role === 'dono') {
  // Renderiza UI de owner
}
```

## Design System Completo

### Tokens ([theme.ts](apps/mobile/src/theme.ts))
```typescript
// Cores
colors.primary = '#22c55e'    // Verde marca
colors.bg = '#0b1220'          // Fundo escuro
colors.card = '#1e293b'        // Cards
colors.text = '#e2e8f0'        // Texto principal
colors.textMuted = '#64748b'   // Texto secundário
colors.danger = '#ef4444'      // Vermelho
colors.gold = '#fbbf24'        // Dourado (loyalty)

// Espaçamentos
spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 }

// Tipografia
fontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 20, xxxl: 24 }

// Bordas
radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 9999 }
```

### Componentes Principais
- **AppButton**: `variant="primary|secondary|outline|danger|ghost"` + `size="sm|md|lg"` + `loading` ([AppButton.tsx](apps/mobile/src/components/AppButton.tsx))
- **AppInput**: Campo de entrada com label, erro, ícone opcional
- **AppCard**: Container com padding/border/shadow padrão
- **StatusBadge**: Badge colorido para status de agendamento
- **ServiceCard**: Card de serviço com preço formatado
- **EmptyState**: Estado vazio com ícone + mensagem

### Exemplo de Uso
```tsx
<AppCard style={{ padding: spacing.lg }}>
  <AppInput label="Nome" value={name} onChangeText={setName} />
  <AppButton 
    variant="primary" 
    size="md" 
    title="Salvar" 
    onPress={handleSave} 
    loading={loading} 
  />
</AppCard>
```

## Deploy & Build

### Mobile (EAS Build)
```powershell
# Preview (internal testing)
cd apps/mobile; eas build --platform android --profile preview

# Produção (lojas)
eas build --platform all --profile production
eas submit -p android  # Google Play
eas submit -p ios      # App Store
```

### Firebase
```powershell
cd firebase

# Deploy completo
firebase deploy

# Deploy seletivo
firebase deploy --only firestore:rules
firebase deploy --only functions:myFunction
firebase deploy --only hosting
```

### Variáveis de Ambiente
- **Mobile**: `.env` em `apps/mobile/` (nunca commitar!)
  - `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `STRIPE_PUBLISHABLE_KEY`, etc.
  - Usar `eas secret:push` para secrets no EAS Build
- **Functions**: `firebase functions:config:set stripe.secret_key="sk_live_..."`
  - Ou usar `.secret.local` em DEV (emuladores)

## Debugging & DevTools

### Modo DEV Local
```powershell
# 1. Iniciar emuladores Firebase
cd firebase; firebase emulators:start

# 2. Em outro terminal, rodar mobile
cd apps/mobile; npm start

# 3. App detecta __DEV__ e conecta a 127.0.0.1:9099 (Auth), :8080 (Firestore)
```

### Logs Úteis
- **App mobile**: Console do Expo (procure emojis `🔧`, `❌`, `⚠️`)
- **Functions**: `firebase functions:log` ou Firestore Console → Functions
- **Emulators**: UI em `http://localhost:4000` (Firestore, Auth, Functions)

### Testar Sem Emuladores
- App funciona offline! Se Firebase não inicializar, use modo demo:
  ```typescript
  useUser.getState().setDemo('cliente'); // Navega sem backend
  ```

### React DevTools
```powershell
# Instalar
npm install -g react-devtools

# Rodar
react-devtools
# Conecta automaticamente ao app Expo
```

## Integrações Externas
- **Stripe**: Pagamentos ([payments.ts](apps/mobile/src/services/payments.ts))
- **Twilio**: WhatsApp notificações (via Cloud Functions)
- **Firebase**: Auth, Firestore, Storage, FCM, Functions
- **Expo Secure Store**: Tokens sensíveis

## Testes
- Jest + React Native Testing Library em `apps/mobile/__tests__/`
- Mocks do Firebase em `services/__mocks__/firebase.ts`
- Rodar: `cd apps/mobile && npm test`

---
**Resumo**: Multi-role app com navegação condicional, Firebase + Zustand, sempre testável offline. Todos os caminhos críticos estão em `services/`, `navigation/`, e `store/`. Leia os types primeiro.
