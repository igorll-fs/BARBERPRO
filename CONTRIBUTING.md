# Contribuindo com o BarberPro

Obrigado pelo interesse em contribuir com o BarberPro! 🎉

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado em [Issues](../../issues)
2. Abra uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Versão do app e SO (iOS/Android)

### Sugerindo Features

1. Abra uma issue com o label `enhancement`
2. Descreva a feature e o problema que resolve
3. Discuta a implementação com os mantenedores

### Pull Requests

1. **Fork** o repositório
2. Crie uma **branch** descritiva: `git checkout -b feature/nome-da-feature` ou `fix/nome-do-bug`
3. Faça seus commits com mensagens claras
4. **Teste** suas alterações
5. Abra um **Pull Request** preenchendo o template

## Padrões de Código

### TypeScript / React Native

- Use **TypeScript** para todo código novo
- Nomeie arquivos de componentes: `PascalCase.tsx` (ex: `HomeScreen.tsx`)
- Nomeie arquivos de utilitários: `camelCase.ts` (ex: `formatDate.ts`)
- Use **functional components** com hooks
- Prefira `const` ao invés de `let`

```typescript
// ✅ Bom
interface UserProps {
  name: string;
  age: number;
}

export const UserCard: React.FC<UserProps> = ({ name, age }) => {
  const displayAge = useMemo(() => `${age} anos`, [age]);
  
  return (
    <View>
      <Text>{name}</Text>
      <Text>{displayAge}</Text>
    </View>
  );
};

// ❌ Evite
function UserCard(props) {
  var age = props.age + " anos";
  return <View>...</View>;
}
```

### Estilo de Código

```bash
# Formate antes de commitar
cd apps/mobile
npx eslint . --fix
```

### Commits

Use commits semânticos:

```
feat: adiciona tela de histórico de agendamentos
fix: corrige crash ao carregar serviços
refactor: simplifica lógica de autenticação
docs: atualiza README com novas instruções
test: adiciona testes para useAuth hook
chore: atualiza dependências do Firebase
```

### Estrutura de Arquivos

```
apps/mobile/src/
├── components/      # Componentes reutilizáveis
├── screens/         # Telas (uma por arquivo)
├── hooks/           # Custom hooks
├── services/        # APIs e integrações externas
├── store/           # Estado global (Zustand)
├── types/           # Interfaces e tipos TypeScript
├── theme.ts         # Cores, espaçamentos, tipografia
└── config.ts        # Variáveis de ambiente
```

## Testes

```bash
# Mobile
cd apps/mobile
npm test

# Functions
cd firebase/functions
npm test
```

- Escreva testes para novas features
- Mantenha cobertura > 70%
- Testes de integração para Cloud Functions

## Revisão de Código

Todo PR precisa de:
- ✅ CI passando (lint + testes)
- ✅ Revisão de pelo menos 1 mantenedor
- ✅ Sem conflitos com `main`

## Ambiente de Desenvolvimento

Veja [SETUP.md](./SETUP.md) para configurar o ambiente local.

## Dúvidas?

Abra uma issue com o label `question` ou entre em contato.

## Código de Conduta

Seja respeitoso e inclusivo. Não toleramos:
- Assédio ou discriminação
- Comportamento tóxico
- Spam ou publicidade

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](./LICENSE).
