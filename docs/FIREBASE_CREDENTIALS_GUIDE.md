# 🔑 Guia Prático: Obter Credenciais Reais do Firebase

## 📍 Passo a Passo

### 1️⃣ **Acessar Firebase Console**

Abre no navegador:
```
https://console.firebase.google.com/
```

---

### 2️⃣ **Selecionar o Projeto**

Na tela inicial, clica em: **baberpro-31c40**

---

### 3️⃣ **Sua tela agora deve mostrar:**

```
🏠 Overview
  ├ Build
  │  ├ Authentication
  │  ├ Firestore Database
  │  ├ Realtime Database
  │  ├ Storage
  │  └ Hosting
  ├ Engage
  ├ Analytics
  └ ⚙️ Project Settings  ← CLICA AQUI
```

---

### 4️⃣ **Clica em ⚙️ Project Settings**

Na lateral direita, vai aparecer:

```
┌─────────────────────────────┐
│ General                     │  ← Tá aqui
│ Service Accounts            │
│ Cloud Billing               │
│ Integrations                │
└─────────────────────────────┘
```

**Certifica que está na tab "General"** (tab padrão)

---

### 5️⃣ **Procura por "SDK Setup and Configuration"**

Vai aparecer algo como:

```
┌──────────────────────────────────────┐
│ SDK & Configuration                  │
├──────────────────────────────────────┤
│ Firebase SDK snippet:                │
│                                      │
│   ◯ NPM    ◉ Config                  │
│                                      │
│  const firebaseConfig = {            │
│    apiKey: "AIzaSy...",             │
│    authDomain: "...",               │
│    projectId: "...",                │
│    ...                              │
│  }                                   │
│                                      │
│  [Copy] [Select all]                │
└──────────────────────────────────────┘
```

---

### 6️⃣ **Copiar a Configuração**

Clica em **[Copy]** ou **[Select all]** e copia tudo.

Vai ficar assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "baberpro-31c40.firebaseapp.com",
  projectId: "baberpro-31c40",
  storageBucket: "baberpro-31c40.appspot.com",
  messagingSenderId: "559665774528",
  appId: "1:559665774528:web:8f7a...",
  measurementId: "G-4N..."
};
```

---

## 📝 Valores que você vai precisar:

| Campo | Sinal Visual |
|-------|--------------|
| **apiKey** | Começa com `AIzaSy...` (longo, ~42 caracteres) |
| **authDomain** | `baberpro-31c40.firebaseapp.com` |
| **projectId** | `baberpro-31c40` |
| **storageBucket** | `baberpro-31c40.appspot.com` |
| **messagingSenderId** | `559665774528` (números) |
| **appId** | `1:559665774528:web:...` |
| **measurementId** | `G-...` (GA ID) |

---

## 🔧 Depois de Copiar

### Para Mobile:

Abre `apps/mobile/.env` e preenche:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=baberpro-31c40.firebaseapp.com
FIREBASE_PROJECT_ID=baberpro-31c40
FIREBASE_STORAGE_BUCKET=baberpro-31c40.appspot.com
FIREBASE_MESSAGING_SENDER_ID=559665774528
FIREBASE_APP_ID=1:559665774528:web:...
FIREBASE_MEASUREMENT_ID=G-...
```

### Para Web:

Abre `apps/public-web/.env` e preenche com `VITE_` na frente:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=baberpro-31c40.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=baberpro-31c40
VITE_FIREBASE_STORAGE_BUCKET=baberpro-31c40.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=559665774528
VITE_FIREBASE_APP_ID=1:559665774528:web:...
```

---

## ✅ Pronto!

Depois de preencher:

1. **Mobile vai funcionar** com Firebase real
2. **Web vai conectar** ao Firestore
3. **Notificações push** funcionam
4. **Autenticação** funciona

---

## 💡 Dúvidas Comuns

**P: E se o `apiKey` aparecer em branco?**
R: Usa o que está na config do Firebase (começa com `AIzaSy`)

**P: Qual é o `appId` certo?**
R: É o que tem o prefixo `1:` e depois o projeto ID

**P: E se copiar errado?**
R: App vai dar erro `Firebase: Error (auth/invalid-api-key)`. É só corrigir no `.env`.

---

## 🚨 Segurança

⚠️ **Importante:**
- ✅ `apiKey` é **pública** (OK no `.env`)
- ✅ `authDomain` é **pública**
- ❌ **NUNCA** coloque chaves privadas no `.env`
- ❌ **NUNCA** commite `.env` no Git (já está em `.gitignore`)

---

Consegue achar essas credenciais no Firebase? **Me avisa quando tiver copiado!** 🎯
