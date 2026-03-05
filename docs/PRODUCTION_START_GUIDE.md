# 🚀 Guia: Como Iniciar a Produção - BarberPro

Passo a passo completo para colocar o BarberPro em produção.

---

## 📋 Checklist Pré-Produção

### 1. ✅ Configurações Obrigatórias

#### A. Firebase (Já configurado ✅)
- [x] Projeto criado: `baberpro-31c40`
- [x] Apps registrados (Web, iOS, Android)
- [x] Credenciais no `.env`
- [x] Firestore Rules deployadas

#### B. Stripe (Configurar agora)
```bash
# 1. Acesse: https://dashboard.stripe.com
# 2. Ative sua conta (modo Live)
# 3. Copie as chaves:
#    - Publishable key: pk_live_xxxxx
#    - Secret key: sk_live_xxxxx

# 4. Configure no .env:
```

**Arquivo: `apps/mobile/.env`**
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Arquivo: `firebase/functions/.env`**
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_MONTHLY=price_live_xxxxx
STRIPE_PRICE_SEMIANNUAL=price_live_xxxxx
FIREBASE_WEB_URL=https://baberpro-31c40.web.app
```

#### C. Criar Produtos no Stripe
1. **Plano Mensal**: R$ 99,99 / mês
2. **Plano Semestral**: R$ 500 / 6 meses

Passo a passo:
- Stripe Dashboard > Products > Add product
- Configure recorrência
- Copie o Price ID

---

## 🚀 Deploy Passo a Passo

### ETAPA 1: Deploy das Cloud Functions

```bash
cd firebase

# Instalar dependências
npm install

# Login no Firebase (se não estiver logado)
firebase login

# Deploy das functions
firebase deploy --only functions

# Verificar logs
firebase functions:log
```

### ETAPA 2: Deploy do Web App

```bash
cd apps/public-web

# Instalar dependências
npm install

# Build de produção
npm run build

# Deploy para Firebase Hosting
cd ../../firebase
firebase deploy --only hosting
```

**URL do site**: https://baberpro-31c40.web.app

### ETAPA 3: Build do App Mobile (EAS)

```bash
cd apps/mobile

# Login na Expo
npx eas login

# Configurar projeto EAS
npx eas build:configure

# Build Android (APK para testes internos)
npx eas build --platform android --profile preview

# Build Android (AAB para Play Store)
npx eas build --platform android --profile production

# Build iOS (requer Apple Developer)
npx eas build --platform ios --profile production
```

---

## 📱 Publicação nas Lojas

### Google Play Store

1. **Acesse**: https://play.google.com/console
2. **Crie a conta de desenvolvedor** (US$25 uma vez)
3. **Crie um novo app**:
   - Nome: BarberPro
   - Idioma padrão: Português (Brasil)
4. **Configure**:
   - Política de privacidade (cole o link do seu site)
   - Categorias: "Beleza" e "Produtividade"
5. **Upload do AAB**:
   - Arraste o arquivo gerado pelo EAS
6. **Screenshots**:
   - Capture telas do app
   - Mínimo 2 screenshots por idioma
7. **Descrição**:
   ```
   BarberPro - O app completo para gestão de barbearias
   
   ✅ Agendamentos online
   ✅ Gestão de clientes
   ✅ Controle financeiro
   ✅ Sistema de fidelidade
   ✅ Inventário de produtos
   
   Disponível em Português, Inglês e Espanhol.
   ```
8. **Envie para revisão**

### Apple App Store

1. **Acesse**: https://appstoreconnect.apple.com
2. **Requisitos**:
   - Conta Apple Developer (US$99/ano)
3. **Crie o app** no App Store Connect
4. **Upload via Xcode ou EAS**:
   ```bash
   npx eas submit --platform ios
   ```
5. **Aguarde revisão** (2-7 dias)

---

## 🔧 Configurações Pós-Deploy

### 1. Configurar Webhook Stripe

No Stripe Dashboard:
1. Developers > Webhooks
2. Add endpoint
3. URL: `https://sua-regiao-baberpro-31c40.cloudfunctions.net/stripeWebhook`
4. Events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

### 2. Configurar Domínio Personalizado (Opcional)

**Firebase Hosting:**
1. Firebase Console > Hosting
2. Add custom domain
3. Siga as instruções de DNS
4. Aguarde propagação (24-48h)

**Sugestão de domínios:**
- app.barberpro.com.br
- barberpro.app

### 3. Configurar Email Profissional

Opções gratuitas:
- **Zoho Mail**: https://www.zoho.com/mail/ (grátis até 5 usuários)
- **Google Workspace**: Pago, mas profissional

Emails sugeridos:
- suporte@barberpro.com.br
- contato@barberpro.com.br
- dpo@barberpro.com.br

---

## 📊 Monitoramento

### 1. Firebase Analytics
```
Firebase Console > Analytics > Dashboard
```

### 2. Crashlytics
```
Firebase Console > Crashlytics
```

### 3. Performance
```
Firebase Console > Performance
```

### 4. Stripe Dashboard
```
https://dashboard.stripe.com
- Verificar pagamentos
- Assinaturas ativas
- Falhas de pagamento
```

---

## 🎯 Primeiros Passos Após o Launch

### Dia 1: Testes
- [ ] Faça um agendamento completo
- [ ] Teste o pagamento (use cartão de teste)
- [ ] Verifique as notificações push
- [ ] Teste em diferentes dispositivos

### Semana 1: Beta
- [ ] Convide 10-20 barbeiros para testar
- [ ] Colete feedback
- [ ] Corrija bugs críticos

### Mês 1: Marketing
- [ ] Crie perfis no Instagram/Facebook
- [ ] Poste cortes dos usuários
- [ ] Use hashtags: #BarberPro #Barbearia #CorteMasculino
- [ ] Parcerias com barbeiros influenciadores

---

## 🆘 Troubleshooting

### Erro: "Firebase App not initialized"
```bash
# Verifique se as credenciais estão corretas no .env
# Reinstale as dependências
cd apps/mobile && rm -rf node_modules && npm install
```

### Erro: "Stripe checkout não funciona"
```bash
# Verifique:
1. As chaves são do modo LIVE (não test)
2. Webhook configurado corretamente
3. Price IDs estão corretos
```

### Erro: "Build falha no EAS"
```bash
# Limpe o cache
npx eas build --platform android --clear-cache
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Documentação**: Verifique os guias em `/docs`
2. **Logs**: `firebase functions:log`
3. **Comunidade**: Stack Overflow, Reddit r/Firebase
4. **Suporte Firebase**: https://firebase.google.com/support

---

## ✅ Checklist Final de Lançamento

- [ ] Firebase deploy realizado
- [ ] Web app no ar
- [ ] App mobile buildado
- [ ] Play Store configurada
- [ ] App Store configurada (iOS)
- [ ] Stripe modo live ativo
- [ ] Webhook configurado
- [ ] Domínio personalizado (opcional)
- [ ] Email profissional configurado
- [ ] Analytics funcionando
- [ ] Primeiro teste realizado
- [ ] Marketing preparado

---

## 🎉 Pronto para Lançar!

Quando tudo estiver ✅, é hora de divulgar!

**Boa sorte com o BarberPro! 🚀**

---

**Próximos passos sugeridos:**
1. Execute `firebase deploy --only functions`
2. Execute `npm run build` no public-web
3. Execute `npx eas build` no mobile
4. Configure a Play Store
5. Lançe o app! 🎊
