# LGPD no BarberPro

- Bases legais: execução de contrato (agendamentos), legítimo interesse (notificações de lembrete), consentimento (marketing).
- Minimização de dados: coletamos nome, telefone (obrigatório p/ clientes), email (opcional p/ clientes), fotos (opcional), localização (somente busca).
- Direitos do titular: exportar dados, excluir conta, correção de dados.
- Segurança: criptografia em trânsito (HTTPS), em repouso (Firebase por padrão), regras de acesso Firestore/Storage restritas a papéis.
- Retenção: excluir OTP após 24h; logs de agendamento por 12 meses; fotos sob controle do dono.
- Encarregado (DPO): definir contato na política.
- Registro de consentimento: armazenar versão da política e timestamp por usuário.
