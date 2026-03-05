#!/usr/bin/env node

/**
 * Script de Configuração Firebase para Produção
 * 
 * Este script facilita a configuração das credenciais do Firebase
 * para ambiente de produção.
 * 
 * Uso: node scripts/setup-firebase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('🔧 Configuração Firebase para Produção - BarberPro\n');
console.log('========================================\n');

async function setupFirebase() {
  console.log('📋 Instruções:');
  console.log('1. Acesse: https://console.firebase.google.com/');
  console.log('2. Selecione o projeto "baberpro-31c40"');
  console.log('3. Vá em ⚙️ Project Settings > General');
  console.log('4. Copie as credenciais do SDK\n');
  console.log('========================================\n');

  // Coletar credenciais
  const firebaseConfig = {
    apiKey: await question('🔑 API Key (começa com AIzaSy...): '),
    authDomain: await question('🌐 Auth Domain (ex: baberpro-31c40.firebaseapp.com): '),
    projectId: await question('📁 Project ID (ex: baberpro-31c40): '),
    storageBucket: await question('📦 Storage Bucket (ex: baberpro-31c40.appspot.com): '),
    messagingSenderId: await question('📨 Messaging Sender ID (ex: 559665774528): '),
    appId: await question('📱 App ID (ex: 1:559665774528:web:...): '),
    measurementId: await question('📊 Measurement ID (ex: G-XXXXXXX): '),
  };

  // Configurações opcionais
  console.log('\n📌 Configurações Opcionais (deixe em branco se não tiver):\n');
  
  const optionalConfig = {
    stripeKey: await question('💳 Stripe Publishable Key (pk_test_... ou pk_live_...): '),
    googleMapsKey: await question('🗺️  Google Maps API Key: '),
    googleClientId: await question('🔐 Google Client ID (para OAuth): '),
    fcmVapidKey: await question('🔔 FCM VAPID Key (para notificações web): '),
  };

  console.log('\n📝 Gerando arquivos de configuração...\n');

  // 1. Criar apps/mobile/.env
  const mobileEnv = `# Firebase Configuration - PRODUÇÃO
FIREBASE_API_KEY=${firebaseConfig.apiKey}
FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
FIREBASE_APP_ID=${firebaseConfig.appId}
FIREBASE_MEASUREMENT_ID=${firebaseConfig.measurementId}

# Google OAuth
GOOGLE_CLIENT_ID=${optionalConfig.googleClientId || ''}

# Firebase Cloud Messaging
FCM_VAPID_KEY=${optionalConfig.fcmVapidKey || ''}

# Stripe Payment Gateway
STRIPE_PUBLISHABLE_KEY=${optionalConfig.stripeKey || ''}

# Google Maps API
GOOGLE_MAPS_API_KEY=${optionalConfig.googleMapsKey || ''}
`;

  fs.writeFileSync(path.join('apps', 'mobile', '.env'), mobileEnv);
  console.log('✅ Criado: apps/mobile/.env');

  // 2. Criar apps/public-web/.env
  const webEnv = `# Firebase Web Configuration - PRODUÇÃO
VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
VITE_FIREBASE_APP_ID=${firebaseConfig.appId}

# Firebase Cloud Messaging (Web Push Notifications)
VITE_FCM_VAPID_KEY=${optionalConfig.fcmVapidKey || ''}
`;

  fs.writeFileSync(path.join('apps', 'public-web', '.env'), webEnv);
  console.log('✅ Criado: apps/public-web/.env');

  // 3. Atualizar apps/mobile/app.json
  const appJsonPath = path.join('apps', 'mobile', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  appJson.expo.extra = {
    ...appJson.expo.extra,
    FIREBASE_API_KEY: firebaseConfig.apiKey,
    FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
    FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
    FIREBASE_APP_ID: firebaseConfig.appId,
    FIREBASE_MEASUREMENT_ID: firebaseConfig.measurementId,
    STRIPE_PUBLISHABLE_KEY: optionalConfig.stripeKey || '',
    GOOGLE_MAPS_API_KEY: optionalConfig.googleMapsKey || '',
  };

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('✅ Atualizado: apps/mobile/app.json');

  console.log('\n========================================');
  console.log('🎉 Configuração Completa!');
  console.log('========================================\n');
  console.log('Próximos passos:');
  console.log('1. 🔧 Verifique se os arquivos foram criados corretamente');
  console.log('2. 🚀 Execute: cd apps/mobile && npx expo start');
  console.log('3. 🧪 Teste o app com Firebase real');
  console.log('4. 📱 Para build: eas build --platform android');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Os arquivos .env NÃO devem ser commitados');
  console.log('   - Já estão no .gitignore ✅');
  console.log('   - Guarde as credenciais em local seguro!\n');

  rl.close();
}

setupFirebase().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
