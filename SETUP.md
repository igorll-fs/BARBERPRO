# Setup do Ambiente de Desenvolvimento

## Pré-requisitos

- **Node.js >= 20.19** (obrigatório para React Native 0.81)
- **npm** ou **yarn**
- **Firebase CLI**: `npm install -g firebase-tools`
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI** (opcional, para builds): `npm install -g eas-cli`

## Configuração Inicial

### 1. Clone e Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd barberpro

# Instale dependências raiz
npm install

# Instale dependências do mobile
cd apps/mobile
npm install
cd ../..

# Instale dependências das Cloud Functions
cd firebase/functions
npm install
cd ../..

# Instale dependências do web (opcional)
cd apps/public-web
npm install
cd ../..
```

### 2. Configurar Variáveis de Ambiente

#### Mobile (`apps/mobile/.env`)

Copie o arquivo de exemplo:
```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edite `apps/mobile/.env` com suas credenciais do Firebase:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123:web:abc123
FIREBASE_MEASUREMENT_ID=G-ABC123

# Opcional para desenvolvimento inicial
GOOGLE_CLIENT_ID=
FCM_VAPID_KEY=
STRIPE_PUBLISHABLE_KEY=
GOOGLE_MAPS_API_KEY=
```

> 💡 **Dica**: Para desenvolvimento local, você pode usar os emuladores do Firebase sem credenciais reais.

#### Firebase Functions (`firebase/functions/.env`)

```bash
cp firebase/functions/.env.example firebase/functions/.env
```

Preencha com suas credenciais de produção (Twilio, Stripe).

### 3. Configurar Firebase

```bash
# Faça login no Firebase
firebase login

# Use o projeto existente (será configurado para o projeto real em produção)
firebase use --add
```

### 4. Executar em Modo Desenvolvimento

#### Terminal 1 - Emuladores Firebase
```bash
cd firebase
firebase emulators:start
```

Emuladores disponíveis em:
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- UI: http://localhost:4000

#### Terminal 2 - App Mobile
```bash
cd apps/mobile
npx expo start --clear
```

#### Terminal 3 - Web Pública (opcional)
```bash
cd apps/public-web
npm run dev
```

### 5. Configurar Google OAuth (opcional)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Baixe o JSON de OAuth 2.0 Client
4. Salve em: `apps/mobile/.secrets/google-oauth-client.json`

> ⚠️ **NUNCA** commit este arquivo! Já está no .gitignore.

## Troubleshooting

### Erro: "Firebase project not found"
Verifique se `FIREBASE_PROJECT_ID` está correto no `.env`

### Erro: "Metro bundler cache"
```bash
cd apps/mobile
npx expo start --clear
```

### Erro: "Cannot find module"
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Modo Demo
O app funciona em modo demo sem Firebase! Basta não configurar o `.env` que o app detectará `__DEV__` e usará dados mockados.

## Próximos Passos

1. ✅ [Configure as regras do Firestore](docs/modeling.md)
2. ✅ [Leia a documentação de deploy](docs/DEPLOY.md)
3. ✅ [Entenda a conformidade LGPD](docs/LGPD.md)
