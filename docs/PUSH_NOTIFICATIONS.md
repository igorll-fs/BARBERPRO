# Firebase Cloud Messaging (FCM) Push Notifications Setup

## 📱 Configuração das Notificações Push

Seu projeto BarberPro usa **Firebase Cloud Messaging** para enviar notificações push de forma nativa.

### Suas Chaves VAPID

**Chave Pública (VAPID):**
```
BJfJsaDwLiWwl2Ag0yd5rV9JDdqZKBmLo1kRbHO11ZAIuUev-gjyfyzGGeHnVIGbpWESQhCoifxhYpZrvLqgdZI
```

Esta é a chave usada para:
- ✅ Web Push Notifications
- ✅ Autenticação VAPID do navegador
- ✅ Integração com Twilio/WhatsApp (opcional)

---

## 🔧 Configuração por Plataforma

### 📱 Mobile (React Native/Expo)

**Arquivo:** `apps/mobile/.env`

```env
FCM_VAPID_KEY=BJfJsaDwLiWwl2Ag0yd5rV9JDdqZKBmLo1kRbHO11ZAIuUev-gjyfyzGGeHnVIGbpWESQhCoifxhYpZrvLqgdZI
```

**Como usar no código:**

```typescript
// services/notifications.ts
import { registerForPushNotificationsAsync } from './notifications';

// Registrar para receber push notifications
const token = await registerForPushNotificationsAsync();
```

**Arquivo de configuração:** `apps/mobile/src/services/notifications.ts`

```typescript
export async function registerForPushNotificationsAsync() {
  // Expo automáticamente usa FCM VAPID key do Firebase
  // Registra dispositivo para receber notifications
}

export async function savePushToken(uid: string, token: string) {
  // Salva token no Firestore para enviar mensagens personalizadas
}
```

---

### 🌐 Web (React/Vite)

**Arquivo:** `apps/public-web/.env`

```env
VITE_FCM_VAPID_KEY=BJfJsaDwLiWwl2Ag0yd5rV9JDdqZKBmLo1kRbHO11ZAIuUev-gjyfyzGGeHnVIGbpWESQhCoifxhYpZrvLqgdZI
```

**Service Worker:** `apps/public-web/public/firebase-messaging-sw.js`

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');

firebase.initializeApp({
  // ... firebase config
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  // Mostrar notificação no browser
});
```

---

## 📤 Como Enviar Notificações

### Via Cloud Functions (Backend)

```typescript
// firebase/functions/src/index.ts
import * as admin from 'firebase-admin';

export const sendPushNotification = functions.https.onCall(async (data) => {
  const { token, title, body } = data;
  
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token, // Token salvo em savePushToken()
    webpush: {
      vapidDetails: {
        subject: 'mailto:seu-email@example.com',
        publicKey: process.env.FCM_VAPID_KEY,
        privateKey: process.env.FCM_VAPID_PRIVATE_KEY,
      },
    },
  };

  return admin.messaging().send(message);
});
```

### Via Firebase Console

1. Vai em **Growth** > **Messaging**
2. Cria uma **Nova Campanha**
3. Seleciona **Firebase Cloud Messaging**
4. Configura titulo, mensagem, target
5. Envia!

---

## 🔐 Segurança

⚠️ **Importante:**
- ✅ Chave **Pública** (VAPID) → pode estar no `.env`
- ❌ Chave **Privada** → NUNCA coloque em `.env` público
- ❌ Chave privada → salva em Cloud Functions ou servidor backend

---

## 🧪 Testar Notificações

### 1. Mobile (Expo)

```typescript
// Testa se consegue registrar para notificações
const token = await registerForPushNotificationsAsync();
console.log('Push token:', token);
```

### 2. Web

```javascript
// Browser console
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notificações habilitadas!');
  }
});
```

---

## 📚 Referências

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://firebase.google.com/docs/cloud-messaging/js/client)
- [VAPID Keys](https://firebase.google.com/docs/cloud-messaging/manage-tokens#retrieve-token)
- [Expo Notifications](https://docs.expo.dev/guides/push-notifications/)
