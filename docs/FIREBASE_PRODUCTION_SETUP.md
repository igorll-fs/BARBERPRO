# 🔧 Configuração Firebase para Produção

Guia completo para configurar as credenciais reais do Firebase no projeto BarberPro.

---

## 📋 Pré-requisitos

1. Acesso ao [Firebase Console](https://console.firebase.google.com/)
2. Projeto Firebase já criado: `baberpro-31c40`
3. Permissões de administrador no projeto

---

## 🚀 Opção 1: Script Automático (Recomendado)

### Passo 1: Executar o Script

```bash
node scripts/setup-firebase.js
```

### Passo 2: Obter Credenciais do Firebase

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto **"baberpro-31c40"**
3. Clique no ⚙️ **Project Settings** (canto superior esquerdo)
4. Na tab **General**, role até **"Your apps"**
5. Selecione o app web ou clique em **"Add app"** se não existir
6. Copie as credenciais do SDK

### Passo 3: Preencher no Script

O script vai pedir cada campo. Cole os valores correspondentes:

```
🔑 API Key:                    AIzaSy... (cole aqui)
🌐 Auth Domain:                baberpro-31c40.firebaseapp.com
📁 Project ID:                 baberpro-31c40
📦 Storage Bucket:             baberpro-31c40.appspot.com
📨 Messaging Sender ID:        559665774528
📱 App ID:                     1:559665774528:web:xxxxx
📊 Measurement ID:             G-XXXXXXX
```

### Passo 4: Configurações Opcionais

O script também vai perguntar (pode deixar em branco se não tiver):

- **Stripe Publishable Key**: Para pagamentos (`pk_live_...`)
- **Google Maps API Key**: Para mapas no app
- **Google Client ID**: Para login com Google
- **FCM VAPID Key**: Para notificações push web

---

## 🔧 Opção 2: Configuração Manual

### 1. Mobile App (.env)

Crie o arquivo `apps/mobile/.env`:

```env
# Firebase Configuration - PRODUÇÃO
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=baberpro-31c40.firebaseapp.com
FIREBASE_PROJECT_ID=baberpro-31c40
FIREBASE_STORAGE_BUCKET=baberpro-31c40.appspot.com
FIREBASE_MESSAGING_SENDER_ID=559665774528
FIREBASE_APP_ID=1:559665774528:web:xxxxx
FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com

# Firebase Cloud Messaging (opcional)
FCM_VAPID_KEY=BLxxxxxxxx...

# Stripe Payment Gateway (opcional)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Google Maps API (opcional)
GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 2. Web App (.env)

Crie o arquivo `apps/public-web/.env`:

```env
# Firebase Web Configuration - PRODUÇÃO
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=baberpro-31c40.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=baberpro-31c40
VITE_FIREBASE_STORAGE_BUCKET=baberpro-31c40.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=559665774528
VITE_FIREBASE_APP_ID=1:559665774528:web:xxxxx

# Firebase Cloud Messaging (opcional)
VITE_FCM_VAPID_KEY=BLxxxxxxxx...
```

### 3. Atualizar app.json

Atualize `apps/mobile/app.json` na seção `extra`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "00000000-0000-0000-0000-000000000000"
      },
      "FIREBASE_API_KEY": "AIzaSy...",
      "FIREBASE_AUTH_DOMAIN": "baberpro-31c40.firebaseapp.com",
      "FIREBASE_PROJECT_ID": "baberpro-31c40",
      "FIREBASE_STORAGE_BUCKET": "baberpro-31c40.appspot.com",
      "FIREBASE_MESSAGING_SENDER_ID": "559665774528",
      "FIREBASE_APP_ID": "1:559665774528:web:xxxxx",
      "FIREBASE_MEASUREMENT_ID": "G-XXXXXXX",
      "STRIPE_PUBLISHABLE_KEY": "pk_live_xxxxx",
      "GOOGLE_MAPS_API_KEY": "AIzaSy..."
    }
  }
}
```

---

## 🧪 Testar Configuração

### Teste Mobile

```bash
cd apps/mobile
npx expo start
```

Verifique no console se conectou ao Firebase real (não emulador).

### Teste Web

```bash
cd apps/public-web
npm run dev
```

Abra o navegador e verifique se consegue fazer login.

---

## 🔐 Segurança

### ✅ O que é seguro:

- `FIREBASE_API_KEY` - **PÚBLICA**, pode estar no código
- `FIREBASE_AUTH_DOMAIN` - **PÚBLICA**
- `FIREBASE_PROJECT_ID` - **PÚBLICA**

### ❌ NUNCA commite:

- Arquivos `.env` (já estão no `.gitignore` ✅)
- Chaves privadas de serviço
- Stripe Secret Keys (`sk_live_...`)
- Tokens de acesso pessoal

---

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/invalid-api-key)"

**Causa**: API Key incorreta ou projeto inexistente
**Solução**: Verifique se copiou a chave completa (começa com `AIzaSy`)

### Erro: "Firebase: Error (auth/unauthorized-domain)"

**Causa**: Domínio não autorizado no Firebase Auth
**Solução**: 
1. Vá em Firebase Console > Authentication > Settings
2. Adicione o domínio em "Authorized domains"

### Erro: "Permission denied" no Firestore

**Causa**: Regras de segurança não configuradas
**Solução**: Deploy das regras do Firestore

```bash
cd firebase
firebase deploy --only firestore:rules
```

### Erro: "Project not found"

**Causa**: `projectId` incorreto
**Solução**: Verifique o ID exato no Firebase Console (canto superior)

---

## ✅ Checklist de Verificação

Após configurar, verifique:

- [ ] Arquivo `apps/mobile/.env` criado
- [ ] Arquivo `apps/public-web/.env` criado
- [ ] `app.json` atualizado com credenciais
- [ ] App mobile conecta ao Firebase real
- [ ] App web conecta ao Firebase real
- [ ] Login funciona corretamente
- [ ] Firestore dados aparecem
- [ ] Storage funciona (upload de imagens)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique as credenciais no Firebase Console
2. Confira se o projeto está ativo
3. Verifique se as regras do Firestore estão deployadas
4. Consulte os logs no console do app

---

**Próximo passo**: Após configurar, execute os testes para garantir que tudo funciona!

```bash
cd apps/mobile && npm test
```
