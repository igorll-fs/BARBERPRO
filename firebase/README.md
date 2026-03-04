# 🔥 Firebase - BarberPro

Configuração do Firebase para o BarberPro.

## Estrutura

```
firebase/
├── functions/          # Cloud Functions (TypeScript)
│   ├── src/
│   │   └── index.ts   # Todas as Cloud Functions
│   └── package.json
├── firestore.rules     # Regras de segurança do Firestore
├── firestore.indexes.json  # Índices de queries
├── storage.rules       # Regras do Firebase Storage
├── firebase.json       # Configuração do Firebase
└── seed/              # Dados de exemplo para emuladores
    └── auth_export/
    └── firestore_export/
```

## 🚀 Quick Start

### 1. Configurar Projeto Firebase

```bash
# Login no Firebase
firebase login

# Definir projeto (substitua pelo seu ID)
firebase use --add
```

### 2. Instalar Dependências

```bash
cd functions
npm install
cd ..
```

### 3. Executar Emuladores

```bash
firebase emulators:start
```

Emuladores disponíveis:
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199
- **UI**: http://localhost:4000

### 4. Seed Data (Dados de Exemplo)

Para carregar dados de exemplo nos emuladores:

```bash
firebase emulators:start --import=./seed
```

Para exportar dados dos emuladores:

```bash
firebase emulators:export ./seed
```

## 📋 Cloud Functions

| Function | Descrição | Trigger |
|----------|-----------|---------|
| `startOtpWhatsApp` | Envia OTP via WhatsApp (Twilio) | HTTP Callable |
| `verifyOtpWhatsApp` | Verifica OTP e autentica usuário | HTTP Callable |
| `createPaymentIntent` | Cria pagamento Stripe | HTTP Callable |
| `createPixPayment` | Cria pagamento PIX | HTTP Callable |
| `confirmAppointment` | Confirma agendamento | HTTP Callable |
| `rejectAppointment` | Recusa agendamento | HTTP Callable |
| `markNoShow` | Marca no-show | HTTP Callable |
| `rateAppointment` | Avalia serviço | HTTP Callable |

## 🔒 Segurança

### Firestore Rules

As regras estão definidas em `firestore.rules`:

- **Usuários**: Podem ler/escrever apenas seus próprios dados
- **Barbearias**: Leitura pública, escrita apenas pelo dono
- **Agendamentos**: Acesso baseado em roles (dono/staff/cliente)
- **OTP**: Acesso apenas via Cloud Functions

### Storage Rules

- **Public**: Leitura pública para imagens da barbearia
- **Users**: Acesso apenas ao próprio usuário

## 🌍 Deploy

```bash
# Deploy de tudo
firebase deploy

# Deploy apenas das functions
firebase deploy --only functions

# Deploy apenas das rules
firebase deploy --only firestore:rules

# Deploy apenas do storage
firebase deploy --only storage
```

## 🔧 Variáveis de Ambiente (Production)

```bash
# Twilio (WhatsApp OTP)
firebase functions:config:set twilio.account_sid="AC..."
firebase functions:config:set twilio.auth_token="..."
firebase functions:config:set twilio.whatsapp_from="whatsapp:+..."

# Stripe (Pagamentos)
firebase functions:config:set stripe.secret_key="sk_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

## 🧪 Testes

```bash
cd functions
npm test
```

## 📚 Documentação Adicional

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
