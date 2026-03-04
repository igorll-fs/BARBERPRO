# Changelog

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Estrutura inicial do monorepo
- Configuração do Firebase (Auth, Firestore, Functions, Storage)
- Sistema de autenticação com WhatsApp OTP (Twilio)
- App mobile em React Native com Expo SDK 54
- Três perfis de usuário: cliente, dono, funcionário
- CRUD de serviços para barbearias
- Sistema de agendamentos com confirmação/recusa
- Chat em tempo real entre cliente e barbearia
- Sistema de avaliações (reviews)
- Gestão de promoções e descontos
- Notificações in-app
- Onboarding para novos donos de barbearia
- Histórico de agendamentos para clientes
- Configuração de horários da barbearia

### Changed
- Migração para React Native 0.81
- Refatoração da navegação para React Navigation v7

### Security
- Implementação de rate limiting no OTP
- Validação de permissões com Custom Claims
- Sanitização de inputs de telefone

## [0.1.0] - 2026-03-04

### Added
- Primeira versão beta
- Setup inicial do projeto

---

## Legenda

- `Added` - Novas funcionalidades
- `Changed` - Alterações em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Melhorias de segurança

## Tags

- `[Unreleased]` - Mudanças que ainda não foram lançadas
- `[YANKED]` - Versões removidas por problemas críticos
