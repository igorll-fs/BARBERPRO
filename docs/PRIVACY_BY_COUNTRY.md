# 🌍 Políticas de Privacidade por País - BarberPro

Guia completo de conformidade com leis de privacidade de diferentes países.

---

## 📋 Índice

1. [Brasil - LGPD](#brasil---lgpd)
2. [União Europeia - GDPR](#união-europeia---gdpr)
3. [Estados Unidos - CCPA/CPRA](#estados-unidos---ccpacpra)
4. [Argentina - Ley de Protección de Datos](#argentina---ley-de-protección-de-datos)
5. [México - LFPDPPP](#méxico---lfpdppp)
6. [Implementação Técnica](#implementação-técnica)

---

## 🇧🇷 Brasil - LGPD

### Lei nº 13.709/2018

**Principais Requisitos:**

### 1. Base Legal para Processamento
- ✅ **Consentimento** - Obtido no cadastro
- ✅ **Execução de contrato** - Prestação de serviços
- ✅ **Legítimo interesse** - Melhorias no app
- ✅ **Cumprimento de obrigação legal** - Fiscais

### 2. Direitos do Titular (Art. 18)
- ✅ **Confirmação** - Confirmar existência de dados
- ✅ **Acesso** - Acessar dados através do app
- ✅ **Correção** - Editar perfil
- ✅ **Anonimização** - Opção de anonimizar dados
- ✅ **Portabilidade** - Exportar dados (JSON)
- ✅ **Eliminação** - Deletar conta
- ✅ **Revogação do consentimento** - Cancelar a qualquer momento

### 3. Implementações Técnicas

```typescript
// Exportar dados (LGPD Art. 18)
export const exportUserData = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  // Coletar todos os dados
  const userData = await collectAllUserData(uid);
  return { data: userData, exportedAt: new Date().toISOString() };
});

// Deletar dados (LGPD Art. 18)
export const deleteUserData = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  // Anonimizar em vez de deletar (para relatórios)
  await anonymizeUserData(uid);
  await admin.auth().deleteUser(uid);
  return { ok: true };
});
```

### 4. DPO (Data Protection Officer)
- Nomear DPO
- Canal de contato: dpo@barberpro.com.br
- Comunicar à ANPD

### 5. Notificação de Violação
- Prazo: 72 horas para ANPD
- Comunicação aos titulares afetados

---

## 🇪🇺 União Europeia - GDPR

### General Data Protection Regulation

**Principais Requisitos:**

### 1. Bases Legais (Art. 6)
- ✅ Consentimento explícito
- ✅ Contrato
- ✅ Obrigação legal
- ✅ Interesses vitais
- ✅ Interesse público
- ✅ Legítimo interesse

### 2. Direitos do Titular (Art. 15-22)
- ✅ **Acesso** (Art. 15)
- ✅ **Retificação** (Art. 16)
- ✅ **Apagamento** ("Direito ao esquecimento") (Art. 17)
- ✅ **Limitação do tratamento** (Art. 18)
- ✅ **Portabilidade** (Art. 20)
- ✅ **Oposição** (Art. 21)
- ✅ **Decisões automatizadas** (Art. 22)

### 3. Privacy by Design
```typescript
// Implementação Privacy by Design
const userProfile = {
  // Dados mínimos necessários
  uid: string,           // ID anônimo
  role: UserRole,        // Necessário para funcionalidade
  name?: string,         // Opcional
  phone?: string,        // Opcional
  // Nunca armazenar:
  // - CPF sem necessidade
  // - Endereço completo
  // - Dados sensíveis
};
```

### 4. Registro de Atividades (Art. 30)
| Atividade | Finalidade | Base Legal | Retenção |
|-----------|------------|------------|----------|
| Cadastro | Prestação de serviço | Contrato | 5 anos |
| Agendamentos | Histórico | Legítimo interesse | 2 anos |
| Chat | Comunicação | Consentimento | 1 ano |
| Fotos | Portfólio | Consentimento | Até revogação |

### 5. Transferência Internacional (Art. 44-49)
- ✅ Firebase (EUA) - Privacy Shield/Standard Contractual Clauses
- ✅ Stripe (EUA) - GDPR compliance
- ✅ Uso de servidores na UE quando possível

---

## 🇺🇸 Estados Unidos - CCPA/CPRA

### California Consumer Privacy Act / California Privacy Rights Act

**Principais Requisitos:**

### 1. Direitos dos Consumidores
- ✅ **Saber** - Quais dados são coletados
- ✅ **Deletar** - Solicitar exclusão
- ✅ **Opt-out** - Venda de dados (não vendemos)
- ✅ **Não discriminação** - Igual tratamento

### 2. Requisitos de Transparência
```typescript
// CCPA Privacy Notice
const privacyNotice = {
  categoriesCollected: [
    'Identificadores (nome, email, telefone)',
    'Dados comerciais (agendamentos, compras)',
    'Dados de internet (IP, cookies)',
    'Dados geolocalização',
  ],
  purposes: [
    'Prestação de serviços',
    'Análises e melhorias',
    'Comunicações',
  ],
  thirdParties: [
    'Firebase (Google)',
    'Stripe (pagamentos)',
    'Twilio (SMS/WhatsApp)',
  ],
  retentionPeriods: {
    account: 'Até exclusão',
    appointments: '2 anos',
    payments: '7 anos (obrigação fiscal)',
  },
};
```

### 3. "Do Not Sell My Personal Information"
- ✅ BarberPro NÃO vende dados pessoais
- ✅ Link "Não vender meus dados" no footer

---

## 🇦🇷 Argentina - Ley de Protección de Datos

### Ley 25.326

**Principais Requisitos:**

### 1. Consentimento
- Deve ser expresso, previamente informado e documentado
- Finalidade específica

### 2. Direitos del Titular
- Acceso, rectificación, supresión
- Bloqueio temporário

### 3. Agencia de Acceso a la Información Pública (AAIP)
- Registro de banco de dados
- Notificação de violações

---

## 🇲🇽 México - LFPDPPP

### Ley Federal de Protección de Datos Personales en Posesión de los Particulares

**Principais Requisitos:**

### 1. Consentimento
- Escrito, eletrônico ou por opt-out
- Finalidades primárias e secundárias

### 2. AVISO DE PRIVACIDAD
- Deve ser integral ou resumido
- Em português/espanhol

### 3. IFAI (Instituto Federal de Acceso a la Información)
- Registro obrigatório
- Notificação de violações

---

## 🔧 Implementação Técnica

### 1. Detecção de País

```typescript
// Detectar país do usuário
const detectUserCountry = (): string => {
  // Prioridade 1: Perfil do usuário
  const userCountry = getUserProfile().country;
  if (userCountry) return userCountry;
  
  // Prioridade 2: Device locale
  const deviceLocale = Localization.locale; // 'pt-BR', 'en-US'
  const country = deviceLocale.split('-')[1];
  if (country) return country;
  
  // Prioridade 3: IP geolocation (Cloud Function)
  return 'BR'; // Default
};
```

### 2. Políticas por País

```typescript
const PRIVACY_CONFIG = {
  BR: {
    law: 'LGPD',
    cookieConsent: true,
    dataRetentionYears: 5,
    dpoRequired: true,
    breachNotificationHours: 72,
    requiredFields: ['email', 'phone'],
  },
  EU: {
    law: 'GDPR',
    cookieConsent: true,
    dataRetentionYears: 3,
    dpoRequired: true,
    breachNotificationHours: 72,
    requiredFields: ['email'],
  },
  US: {
    law: 'CCPA',
    cookieConsent: false,
    dataRetentionYears: 7,
    dpoRequired: false,
    breachNotificationHours: 72,
    requiredFields: [],
  },
  // ... outros países
};
```

### 3. Consentimento Dinâmico

```typescript
const getPrivacyConsent = (country: string) => {
  const config = PRIVACY_CONFIG[country] || PRIVACY_CONFIG.BR;
  
  return {
    marketing: config.requiresMarketingConsent,
    analytics: config.requiresAnalyticsConsent,
    thirdParty: config.requiresThirdPartyConsent,
    cookies: config.cookieConsent,
  };
};
```

### 4. Termos de Uso por País

```typescript
const TermsOfService = ({ country }) => {
  const terms = {
    BR: '/terms/br-lgpd.html',
    EU: '/terms/eu-gdpr.html',
    US: '/terms/us-ccpa.html',
    // ...
  };
  
  return <WebView source={{ uri: terms[country] || terms.BR }} />;
};
```

---

## 🛡️ Medidas de Segurança

### 1. Criptografia
```typescript
// Dados sensíveis sempre criptografados
const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};
```

### 2. Anonimização
```typescript
// Anonimizar dados para analytics
const anonymizeForAnalytics = (userData: UserData) => {
  return {
    ...userData,
    uid: hash(userData.uid), // Hash irreversível
    name: null,
    email: null,
    phone: null,
  };
};
```

### 3. Logs de Auditoria
```typescript
// Registrar todas as operações de dados
const auditLog = {
  timestamp: new Date(),
  userId: uid,
  action: 'data_export',
  dataTypes: ['profile', 'appointments'],
  ipAddress: context.ip,
  userAgent: context.userAgent,
};
```

---

## 📞 Contato DPO/Privacidade

### Por País:

| País | Email | Telefone |
|------|-------|----------|
| 🇧🇷 Brasil | dpo-br@barberpro.com | +55 11 4000-0000 |
| 🇪🇺 Europa | dpo-eu@barberpro.com | +351 21 0000 000 |
| 🇺🇸 EUA | privacy@barberpro.com | +1 800 000 0000 |
| 🇦🇷 Argentina | dpo-ar@barberpro.com | +54 11 0000 0000 |
| 🇲🇽 México | dpo-mx@barberpro.com | +52 55 0000 0000 |

---

## ✅ Checklist de Conformidade

- [ ] Privacy Policy por país
- [ ] Termos de Uso por país
- [ ] Cookie consent configurado
- [ ] DPO nomeado (onde obrigatório)
- [ ] Registro em autoridades locais
- [ ] Processo de exportação de dados
- [ ] Processo de exclusão de dados
- [ ] Notificação de violações
- [ ] Treinamento da equipe
- [ ] Auditoria trimestral

---

## 📚 Referências

- [LGPD - Brasil](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR - União Europeia](https://gdpr.eu/)
- [CCPA - Califórnia](https://oag.ca.gov/privacy/ccpa)
- [LFPDPPP - México](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf)

---

**Última atualização:** 05/03/2026
**Versão:** 1.0
**Responsável:** DPO BarberPro
