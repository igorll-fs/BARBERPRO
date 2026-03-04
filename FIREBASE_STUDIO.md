# 🔥 Firebase Studio - BarberPro

Guia para importar e trabalhar com o BarberPro no **Firebase Studio**.

## 📥 Importando do GitHub

### 1. Abrir Firebase Studio

Acesse: [firebase.studio](https://firebase.studio)

### 2. Importar Repositório

1. Clique em **"Import Project"**
2. Cole a URL do seu repositório GitHub: `https://github.com/seu-usuario/barberpro`
3. Selecione a branch `main`
4. Aguarde a importação

### 3. Configurar Projeto Firebase

O Firebase Studio detectará automaticamente a configuração em `firebase/firebase.json`.

Se precisar configurar manualmente:
1. Vá em **Project Settings**
2. Configure o **Firebase Project ID**
3. Salve as configurações

## 🚀 Executando no Firebase Studio

### Start Emuladores

No terminal integrado:

```bash
cd firebase
firebase emulators:start --import=./seed
```

Isso inicia:
- **Firestore Emulator**: Porta 8080
- **Auth Emulator**: Porta 9099
- **Functions Emulator**: Porta 5001
- **Storage Emulator**: Porta 9199
- **Emulator UI**: Porta 4000

### Preview do App

O Firebase Studio criará URLs de preview para:
- Emulator UI: `http://localhost:4000`
- Functions: `http://localhost:5001`

## 🧪 Dados de Exemplo (Seed)

O projeto inclui dados de exemplo em `firebase/seed/`:

| Usuário | Role | Telefone |
|---------|------|----------|
| Dono Demo | dono | +5511999999999 |
| Barbeiro Demo | funcionario | +5511888888888 |
| Cliente Demo | cliente | +5511777777777 |

### Resetar Dados

```bash
# Parar emuladores (Ctrl+C)
# Limpar dados
rm -rf firebase/seed/firestore_export/*

# Iniciar emuladores sem import
firebase emulators:start
```

## 🔧 Desenvolvimento com IA

### Gerar Cloud Functions

Prompts úteis para o assistente de IA:

```
"Crie uma Cloud Function para enviar lembrete de agendamento 24h antes"
```

```
"Adicione validação de CNPJ na função de criar barbearia"
```

```
"Crie uma trigger Firestore que notifica o dono quando um novo agendamento é criado"
```

### Modificar Firestore Rules

```
"Adicione regra para permitir que funcionários editem apenas seus próprios agendamentos"
```

## 📋 Estrutura do Projeto

O Firebase Studio reconhece automaticamente:

```
firebase/
├── functions/          ✅ Cloud Functions
├── firestore.rules     ✅ Security Rules
├── firestore.indexes.json  ✅ Índices
├── storage.rules       ✅ Storage Rules
└── firebase.json       ✅ Configuração
```

## 🔒 Variáveis de Ambiente

Para configurar secrets (Twilio, Stripe):

```bash
# No terminal do Firebase Studio
firebase functions:config:set twilio.account_sid="AC..."
firebase functions:config:set stripe.secret_key="sk_..."
```

> ⚠️ **Nota**: Secrets não são sincronizados com o GitHub por segurança.

## 🐛 Debug

### Logs das Functions

```bash
# Ver logs em tempo real
firebase functions:log
```

### Testar Functions Localmente

```bash
# Usando curl
curl http://localhost:5001/seu-projeto/us-central1/startOtpWhatsApp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5511999999999"}'
```

## 📱 Conectar App Mobile aos Emuladores

Quando executar o app mobile no Firebase Studio, configure:

```env
# No arquivo .env do mobile
FIREBASE_PROJECT_ID=seu-projeto-demo
```

O app detectará automaticamente `__DEV__` e conectará aos emuladores.

## 🚀 Deploy

Quando pronto para deploy:

```bash
# Deploy de tudo
firebase deploy

# Ou apenas functions
firebase deploy --only functions
```

## 💡 Dicas

1. **Auto-complete**: O Firebase Studio tem auto-complete para todas as APIs Firebase
2. **Type Checking**: As Functions usam TypeScript para type safety
3. **Hot Reload**: Alterações nas Functions são recarregadas automaticamente
4. **Emulator UI**: Use a UI em `localhost:4000` para inspecionar dados

## 📚 Recursos

- [Documentação Firebase Studio](https://firebase.google.com/docs/studio)
- [Guia Cloud Functions](https://firebase.google.com/docs/functions)
- [Exemplos de Functions](https://github.com/firebase/functions-samples)

## ❓ Troubleshooting

### Erro: "Project not found"
- Verifique se `.firebaserc` tem o ID correto do projeto
- Execute `firebase use --add` para selecionar o projeto

### Erro: "Functions not deploying"
- Verifique se `firebase.json` aponta para a pasta `functions` correta
- Certifique-se de que `npm install` foi executado em `firebase/functions/`

### Erro: "Emulators not starting"
- Verifique se as portas 4000, 5001, 8080, 9099 estão livres
- Execute `firebase emulators:start --debug` para mais detalhes
