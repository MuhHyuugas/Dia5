# Plano de Desenvolvimento Mapeado por Issues (Fase 1 e 2)

Este plano alinha a execução com as 10 issues definidas para o desenvolvimento do **Dia5**. Ele divide as tarefas em fases e mapeia o status de cada item para termos total controle e rastreabilidade.

---

## User Review Required

> [!IMPORTANT]
> **Fluxo de Trabalho:**
> 1. Concluiremos as tarefas pendentes do backend (testes de unidade de domínio das Issues 3 e 4).
> 2. Inicializaremos o frontend mobile com Expo na pasta raiz (`mobile` ou `frontend`) seguindo a arquitetura FSD (Issue 2).
> 3. Desenvolveremos a navegação e as telas do app móvel conforme as Issues 5 a 10.
>
> **Linguagem e Frameworks:**
> - Backend: .NET 10.
> - Frontend: React Native com Expo (TypeScript), Expo Router e estrutura de pastas FSD.

---

## Proposed Changes

Abaixo está o mapeamento detalhado por issues e seus arquivos correspondentes.

### 🏛️ Fase 1: Setup e Regras de Domínio (Backend & Mobile Inicial)

#### Issue 1: [Setup] Inicialização do Back-end e Banco de Dados
- **Status:** **100% Concluído**
- **Arquivos:**
  - Solução: [Dia5.slnx](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/Dia5.slnx)
  - Projetos e camadas em [backend/](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend)
  - Docker Compose: [docker-compose.yml](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/docker-compose.yml)
  - Documentação atualizada no [README.md](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/README.md)

#### Issue 2: [Setup] Estruturação do Front-end Mobile com Expo
- **Status:** **Pendente**
- **Ações:**
  - Criar o projeto Expo na raiz como `mobile`.
  - Configurar Expo Router e estrutura de pastas FSD (`src/features`, `src/components`, `src/services`, `src/utils`).
  - Adicionar o `.gitignore` adequado e tela "Hello World".

#### Issue 3: [Domain] Criar entidade Despesa e regra de partilha (TDD)
- **Status:** **100% Concluído**
- **Arquivos e Ações:**
  - xUnit configurado em [Dia5.Domain.Tests.csproj](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/Dia5.Domain.Tests/Dia5.Domain.Tests.csproj).
  - Testes de falha e de caminho feliz implementados em [DespesaTests.cs](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/Dia5.Domain.Tests/DespesaTests.cs).
  - Método de validação implementado na entidade [Despesa.cs](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/Dia5.Domain/Entities/Despesa.cs).
  - Todos os testes validados com `dotnet test` (2/2 Aprovados).

#### Issue 4: [Domain] Modelagem de Usuários e Shadow Users
- **Status:** **Em Execução (80% Concluído)**
- **Ações:**
  - Entidade [Usuario.cs](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/Dia5.Domain/Entities/Usuario.cs) criada com `IsGuest` e `CriadoPorId`.
  - **Pendente:** Escrever os testes unitários garantindo os estados corretos da entidade `Usuario` de acordo com o tipo (usuário comum vs. convidado).

---

### 📱 Fase 2: Telas do Front-end (React Native / Expo)

#### Issue 5: [UI/Infra] Criar Navegação Global (Bottom Tab Bar)
- **Status:** **Pendente**
- **Ações:** Configurar `_layout.tsx` e rotas principais (Dashboard, Groups, Activity, Account) em Dark Mode.

#### Issue 6: [UI/Feature] Tela Inicial (Dashboard)
- **Status:** **Pendente**
- **Ações:** Componentes `GlobalBalanceCard`, `InsightCard`, `GroupListItem` e renderização da tela principal.

#### Issue 7: [UI/Feature] Tela de Detalhes do Grupo
- **Status:** **Pendente**
- **Ações:** Cabeçalho com lista de membros, `GroupSummaryCard`, feed de despesas agrupadas por data e botão flutuante.

#### Issue 8: [UI/Feature] Tela de Nova Despesa (Formulário e Partilha)
- **Status:** **Pendente**
- **Ações:** Inputs de valor e descrição, seletor de pagador, lista "Dividido entre" destacando `[GUEST]` e lógica de divisão igualitária local.

#### Issue 9: [UI/Feature] Tela de Atividades (Notificações)
- **Status:** **Pendente**
- **Ações:** Feed cronológico tipo timeline com ícones dinâmicos de cor para transações.

#### Issue 10: [UI/Feature] Tela de Perfil e Vinculação (Account)
- **Status:** **Pendente**
- **Ações:** Exibição do código de perfil de 6 dígitos, botão "Copiar" e lista de opções adicionais.

---

## Verification Plan

### Automated Tests
- Executar `dotnet test` no backend para validar todos os testes das Issues 3 e 4.

### Manual Verification
- Iniciar o app Expo para verificar a navegação inicial e layout básico (Issue 2).
