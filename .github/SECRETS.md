# GitHub Secrets

Este documento lista os secrets necessários para os GitHub Actions funcionarem.

## Configuração

Vá em: `Settings > Secrets and variables > Actions > New repository secret`

## Secrets Necessários

### Para Deploy do Firebase

| Secret | Descrição | Como Obter |
|--------|-----------|------------|
| `GCP_SA_KEY` | Service Account Key do Firebase | Firebase Console > Project Settings > Service Accounts |

### Como gerar o GCP_SA_KEY

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em: Project Settings > Service Accounts
3. Clique em "Generate new private key"
4. O arquivo JSON baixado deve ser convertido para base64:
   ```bash
   base64 -i path/to/serviceAccountKey.json | pbcopy
   ```
5. Cole o conteúdo no secret `GCP_SA_KEY`

### Opcionais (para notificações)

| Secret | Descrição | Uso |
|--------|-----------|-----|
| `SLACK_WEBHOOK_URL` | Webhook do Slack | Notificações de deploy |
| `DISCORD_WEBHOOK_URL` | Webhook do Discord | Notificações de deploy |

## Variáveis de Ambiente (não secrets)

Vá em: `Settings > Secrets and variables > Actions > Variables`

| Variable | Valor | Descrição |
|----------|-------|-----------|
| `FIREBASE_PROJECT_ID` | seu-project-id | ID do projeto Firebase |

## ⚠️ Atenção

- NUNCA commite arquivos de service account no repositório
- Gire as chaves periodicamente
- Use secrets apenas para dados realmente sensíveis
