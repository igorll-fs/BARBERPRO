# Segurança do BarberPro

## ⚠️ Atenção: Arquivos Sensíveis

Este projeto contém integrações com serviços de terceiros que requerem credenciais. **NUNCA** commit estes arquivos no GitHub.

### Arquivos que DEVEM estar no .gitignore

| Arquivo/Pasta | Descrição | Onde Obter |
|---------------|-----------|------------|
| `apps/mobile/.env` | Config Firebase, Stripe, Maps locais | Criar baseado no .env.example |
| `apps/mobile/.secrets/` | OAuth JSON do Google | Google Cloud Console |
| `firebase/functions/.env` | Secrets Twilio, Stripe prod | firebase functions:config:set |
| `google-services.json` | Config Android Firebase | Firebase Console |
| `GoogleService-Info.plist` | Config iOS Firebase | Firebase Console |

### Checklist antes do primeiro commit

```bash
# 1. Verifique se .env não está sendo trackeado
git status

# 2. Se .env aparecer, adicione ao .gitignore e remova do staging
git reset HEAD apps/mobile/.env
git reset HEAD firebase/functions/.env

# 3. Verifique pasta .secrets
ls apps/mobile/.secrets/
# Deve conter: google-oauth-client.json (NÃO commit!)

# 4. Verifique builds compilados
ls firebase/functions/lib/
# Não deve ser commitado (já está no .gitignore)
```

### Rotação de Credenciais (se expostas)

Se você acidentalmente commitou credenciais:

1. **Revogue imediatamente** no console do serviço:
   - Firebase: Project Settings > General > Web API Key > regenerate
   - Google OAuth: Credentials > OAuth 2.0 > Reset
   - Stripe: Dashboard > Developers > API Keys > Roll key

2. **Limpe o histórico git** (se já foi pushado):
   ```bash
   # Usando BFG Repo-Cleaner (recomendado)
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Ou filter-branch
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch apps/mobile/.env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (cuidado em repos compartilhados):
   ```bash
   git push origin --force --all
   ```

## Reportar Vulnerabilidades

Encontrou alguma vulnerabilidade? Entre em contato: [email do projeto]
