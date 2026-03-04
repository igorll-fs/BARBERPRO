# 🚀 Push para GitHub - Passo a Passo

Guia completo para subir o BarberPro no GitHub e importar no Firebase Studio.

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado localmente
- Credenciais do Firebase **não commitadas** ✅ (já verificamos!)

---

## 1️⃣ Inicializar Repositório Git

```bash
# Na raiz do projeto barberpro
git init
```

## 2️⃣ Verificar Arquivos Sensíveis (IMPORTANTE!)

```bash
# Liste todos os arquivos que serão commitados
git status

# Verifique se algum arquivo sensível aparece:
# ❌ apps/mobile/.env
# ❌ firebase/functions/.env
# ❌ apps/mobile/.secrets/
# ❌ google-services.json
# ❌ *.key, *.pem
```

Se algum arquivo sensível aparecer:
```bash
git reset HEAD <arquivo-sensivel>
echo "<arquivo-sensivel>" >> .gitignore
```

## 3️⃣ Configurar Git

```bash
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
```

## 4️⃣ Primeiro Commit

```bash
# Adicionar todos os arquivos (que não estão no .gitignore)
git add .

# Commit inicial
git commit -m "feat: initial commit - BarberPro v0.1.0

- React Native + Expo SDK 54 app
- Firebase Cloud Functions
- Firestore security rules
- 3 perfis: cliente, dono, funcionario
- Sistema de agendamentos
- Chat em tempo real
- Avaliacoes e reviews
- Promocoes e notificacoes
- CI/CD com GitHub Actions
- Testes iniciais configurados"
```

## 5️⃣ Criar Repositório no GitHub

### Opção A: Via Interface Web

1. Acesse [github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name**: `barberpro`
   - **Description**: `Aplicativo de gestão para barbearias - React Native + Firebase`
   - **Visibility**: Público ou Privado
   - ✅ **Initialize this repository with**: NENHUM (não marque README, .gitignore, license)
3. Clique **Create repository**

### Opção B: Via CLI (GitHub CLI)

```bash
# Instalar gh CLI se não tiver: https://cli.github.com/

# Criar repositório público
gh repo create barberpro --public --source=. --remote=origin --push

# Ou privado
gh repo create barberpro --private --source=. --remote=origin --push
```

## 6️⃣ Conectar Repositório Remoto

Se criou via interface web, conecte:

```bash
# Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/barberpro.git

# Ou via SSH
git remote add origin git@github.com:SEU_USUARIO/barberpro.git
```

## 7️⃣ Push para GitHub

```bash
# Push da branch main
git branch -M main
git push -u origin main
```

## 8️⃣ Verificar no GitHub

1. Acesse `https://github.com/SEU_USUARIO/barberpro`
2. Verifique:
   - ✅ Todos os arquivos estão lá (exceto .env, node_modules, etc.)
   - ✅ README.md renderizado corretamente
   - ✅ Actions aparecem em "Actions" tab
   - ✅ LICENSE mostra MIT

---

## 🔥 Importar no Firebase Studio

Agora que está no GitHub, importe no Firebase Studio:

### 1. Abrir Firebase Studio

Acesse: [firebase.studio](https://firebase.studio)

### 2. Importar Projeto

1. Clique **"Import Project"**
2. Cole: `https://github.com/SEU_USUARIO/barberpro`
3. Aguarde a importação

### 3. Configurar Firebase

1. Vá em **Project Settings**
2. Configure seu **Firebase Project ID**
3. Salve

### 4. Executar Emuladores

```bash
cd firebase
firebase emulators:start --import=./seed
```

---

## 🔧 Configurações Opcionais no GitHub

### 1. Branch Protection (Recomendado)

1. GitHub > Settings > Branches
2. Add rule para `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass (CI)
   - ✅ Include administrators

### 2. Secrets para Deploy Automático

1. Settings > Secrets and variables > Actions
2. Adicione:
   - `GCP_SA_KEY`: Service Account do Firebase (base64)

### 3. GitHub Pages (Docs)

1. Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs`

---

## ✅ Checklist Final

```
□ Repositório criado no GitHub
□ Código pushado com sucesso
□ Sem arquivos sensíveis expostos
□ README renderizando corretamente
□ Actions configuradas
□ Importado no Firebase Studio
□ Emuladores rodando
□ Seed data carregada
```

---

## 🐛 Troubleshooting

### Erro: "remote: Repository not found"
```bash
# Verifique o remote
git remote -v

# Corrija se necessário
git remote set-url origin https://github.com/SEU_USUARIO/barberpro.git
```

### Erro: "fatal: refusing to merge unrelated histories"
```bash
git pull origin main --allow-unrelated-histories
```

### Erro: "Permission denied"
```bash
# Use token de acesso pessoal ou configure SSH
# https://docs.github.com/en/authentication
```

---

## 🎉 Próximos Passos

Após o push:

1. **Convidar colaboradores**: Settings > Manage access
2. **Configurar Projects**: Projetos Kanban
3. **Discussions**: Habilitar em Settings
4. **Wikis**: Documentação adicional
5. **Releases**: Criar release v0.1.0

**Pronto para desenvolver com Firebase Studio! 🚀**
