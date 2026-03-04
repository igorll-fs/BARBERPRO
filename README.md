# 💈 BarberPro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Functions-orange.svg)](https://firebase.google.com)

> Aplicativo completo para gestão de barbearias com **3 perfis** de usuário (cliente, dono, funcionário)

<p align="center">
  <img src="https://via.placeholder.com/200x400/2D2D2D/FFFFFF?text=Cliente" width="200" />
  <img src="https://via.placeholder.com/200x400/4A90D9/FFFFFF?text=Dono" width="200" />
  <img src="https://via.placeholder.com/200x400/5CB85C/FFFFFF?text=Funcionario" width="200" />
</p>

## ✨ Funcionalidades

### 👤 Cliente
- [x] Agendamento de serviços
- [x] Chat com a barbearia
- [x] Histórico de agendamentos
- [x] Avaliações e reviews
- [x] Notificações de lembrete

### 🏪 Dono da Barbearia
- [x] Dashboard com métricas
- [x] Cadastro de serviços
- [x] Gestão de equipe (barbeiros)
- [x] Configuração de horários
- [x] Criação de promoções
- [x] Relatórios

### ✂️ Funcionário
- [x] Área do profissional
- [x] Gerenciamento de agenda
- [x] Confirmação/recusa de agendamentos
- [x] Histórico de clientes

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|------------|
| **Mobile** | React Native 0.81 + Expo SDK 54 |
| **Web** | Vite + React + TypeScript |
| **Backend** | Firebase Cloud Functions |
| **Database** | Firestore |
| **Auth** | Firebase Auth + Twilio (WhatsApp OTP) |
| **Storage** | Firebase Storage |
| **Push** | Firebase Cloud Messaging |
| **Pagamentos** | Stripe (assinaturas) |

## 📁 Estrutura do Monorepo

```
barberpro/
├── apps/
│   ├── mobile/          # App iOS/Android (Expo)
│   ├── public-web/      # Landing page / perfil público
│   └── web-app/         # Web app administrativo
├── firebase/
│   ├── functions/       # Cloud Functions
│   ├── firestore.rules  # Regras de segurança
│   └── storage.rules    # Regras do Storage
├── docs/                # Documentação
└── package.json         # Scripts do monorepo
```

## 🛠️ Setup Rápido

### Pré-requisitos
- **Node.js >= 20.19** (obrigatório para RN 0.81)
- Firebase CLI: `npm install -g firebase-tools`
- Contas: Firebase, Stripe, Twilio

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/barberpro.git
cd barberpro

# Instale todas as dependências
npm install
cd apps/mobile && npm install && cd ../..
cd firebase/functions && npm install && cd ../..
```

### 2. Configuração

```bash
# Copie os arquivos de ambiente
cp apps/mobile/.env.example apps/mobile/.env
cp firebase/functions/.env.example firebase/functions/.env

# Edite com suas credenciais
```

> 🔐 Veja [SETUP.md](./SETUP.md) para instruções detalhadas e [SECURITY.md](./SECURITY.md) para boas práticas de segurança.

### 3. Desenvolvimento

```bash
# Terminal 1 - Emuladores Firebase
cd firebase && firebase emulators:start

# Terminal 2 - App mobile
cd apps/mobile && npx expo start --clear
```

> 💡 Em modo DEV, o app conecta automaticamente aos emuladores Firebase localmente.

## 🧪 Testes

```bash
# Mobile
cd apps/mobile && npm test

# Functions
cd firebase/functions && npm test
```

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [SETUP.md](./SETUP.md) | Guia completo de setup |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Como contribuir |
| [SECURITY.md](./SECURITY.md) | Boas práticas de segurança |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de mudanças |
| [docs/modeling.md](docs/modeling.md) | Modelagem Firestore |
| [docs/LGPD.md](docs/LGPD.md) | Conformidade LGPD |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Guia de deploy |

## 🚀 Deploy

```bash
# Firebase (functions + rules + hosting)
cd firebase && firebase deploy

# Mobile - EAS Build
cd apps/mobile && eas build --platform all
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia nosso [Guia de Contribuição](./CONTRIBUTING.md).

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

## 🙏 Agradecimentos

- [Expo](https://expo.dev) pela incrível plataforma de desenvolvimento
- [Firebase](https://firebase.google.com) pelo backend serverless
- Comunidade React Native pelos excelentes recursos

---

<p align="center">
  Feito com 💙 para barbearias
</p>
