/* ============================
   BARBERPRO PWA — Firebase Messaging Service Worker
   Recebe push notifications em background
   ============================ */

// Importa scripts do Firebase (CDN)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Configuração mínima do Firebase (apenas projectId é obrigatório para messaging)
firebase.initializeApp({
  apiKey: 'placeholder',
  projectId: 'barberpro-dev',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:000000000000',
});

const messaging = firebase.messaging();

// ─── Handler de mensagem em background ──────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Push recebido em background:', payload);

  const { title, body, icon, image, click_action } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'BarberPro', {
    body: body || 'Você tem uma nova notificação',
    icon: icon || '/icon.svg',
    badge: '/icon.svg',
    image: image || undefined,
    vibrate: [200, 100, 200],
    tag: data.tag || 'barberpro-notification',
    data: {
      url: click_action || data.url || '/app',
    },
    actions: data.type === 'appointment'
      ? [
          { action: 'view', title: '👀 Ver agendamento' },
          { action: 'dismiss', title: 'Dispensar' },
        ]
      : [],
  });
});

// ─── Clique na notificação ──────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já tem uma aba aberta, foca nela
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Senão, abre nova aba
      return clients.openWindow(url);
    })
  );
});
