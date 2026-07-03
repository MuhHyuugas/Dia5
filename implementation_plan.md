# Roteiro de Implementação - Dia5

Este documento apresenta o plano passo a passo para o desenvolvimento completo do **Dia5**, abrangendo a configuração do ambiente, o desenvolvimento do backend (.NET 10), regras de negócio críticas e a criação do frontend (React Native).

---

## 🏗️ Visão Geral da Arquitetura

O sistema é dividido em duas partes principais:
1. **Backend (.NET 10 API)** utilizando **Clean Architecture** (Domain, Application, Infrastructure, API) com banco PostgreSQL via Entity Framework Core.
2. **Frontend (React Native)** utilizando Expo ou CLI, consumindo a API REST do backend.

```mermaid
graph TD
    subgraph Frontend (React Native)
        UI[Telas / Componentes] --> State[Gerenciador de Estado / Contexts]
        State --> Services[API Services / Axios]
    end

    subgraph Backend (.NET 10 API)
        Services --> API[API Layer / Controllers]
        API --> App[Application Layer / Services]
        App --> Domain[Domain Layer / Entities & Rules]
        App --> Infra[Infrastructure Layer / EF Core]
        Infra --> PostgreSQL[(PostgreSQL Database)]
    end
```

---

## 📅 Roteiro de Desenvolvimento (Fases)

### Fase 1: Setup do Ambiente e Banco de Dados (Infraestrutura)
- [x ] **Instalação do SDK:** Concluir a instalação do .NET SDK 10.0.
- [ ] **Banco de Dados (Docker):** Subir o banco de dados PostgreSQL e o pgAdmin através do Docker Compose disponível em [docker-compose.yml](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/docs/docker-compose.yml).
- [ ] **Restaurar Dependências:** Executar o comando `dotnet restore` no diretório do backend para validar a instalação dos pacotes NuGet do C#.
- [ ] **Configuração do Projeto:** Ajustar a Connection String no arquivo `appsettings.Development.json` na API do backend para apontar para o PostgreSQL do Docker.

---

### Fase 2: Modelagem e Persistência do Domínio (Backend)
- [ ] **Entidades do Domínio (Domain):**
  - Implementar as classes em `Dia5.Domain`: `Usuario`, `Grupo`, `Despesa`, `ParticipanteDespesa`, `Pagamento`.
  - Garantir o tratamento correto do tipo `is_guest` (Shadow Users) e relacionamentos autorreferenciados (como o criador do Shadow User e a tabela de amizades).
- [ ] **Banco de Dados e Contexto (Infrastructure):**
  - Configurar o `AppDbContext` em `Dia5.Infrastructure`.
  - Definir mapeamentos com **Fluent API** para chaves primárias compostas (`MembrosGrupo`, `Amizades`, `ParticipantesDespesa`) e configurações de chaves estrangeiras.
  - Habilitar o comportamento de exclusão lógica (**Soft Delete**) global para a entidade `Despesa` (usando filtros de consulta do EF Core para ignorar deletados automaticamente).
- [ ] **Migrações:** Gerar e aplicar a primeira migração com o comando `dotnet ef database update`.

---

### Fase 3: Casos de Uso e Regras de Negócio (Application / API)
- [ ] **Autenticação e Perfis (UC01 / UC06 / UC07):**
  - Cadastro de usuários reais com hash criptográfico de senha (BCrypt ou similar).
  - Geração de códigos de perfil exclusivos (alfanumérico de 6 dígitos) para amizades.
  - Implementação de JWT para proteger as rotas da API.
- [ ] **Gestão de Grupos e Participantes (UC04 / UC05):**
  - Criação de grupos e geração de código de convite de 6 caracteres.
  - Entrada de usuários em grupos por código de convite.
  - Criação de "Shadow Users" (convidados sem senha ou e-mail, vinculados ao criador).
- [ ] **Gestão Financeira e Divisão de Despesas (UC01 / UC02 / UC08):**
  - **Lógica de Divisão Matemática:** Validação rigorosa na criação de despesa para garantir que a soma das frações devidas pelos participantes seja igual ao valor total do cabeçalho.
  - **Soft Delete de Despesa:** Lógica no serviço para marcar `deleted_at` em vez de remover fisicamente, recalculando os saldos devidos.
  - **Motor de Balanço e Ledger:** Queries eficientes no banco para cruzar e liquidar as despesas e pagamentos, retornando:
    - O saldo consolidado de um grupo específico.
    - O balanço global cruzado entre dois amigos (cobrindo múltiplos grupos).
- [ ] **Vinculação Atômica do Shadow User (UC03):**
  - Implementar uma transação de banco de dados (`IDbContextTransaction`) que substitua o ID do Shadow User pelo ID do Usuário Real em todos os registros financeiros pendentes, invalidando o Shadow User ao final de forma atômica.

---

### Fase 4: Desenvolvimento do Frontend (React Native + Expo)
- [ ] **Setup do Projeto com Expo e FSD:**
  - Inicializar o projeto React Native com **Expo** (utilizando TypeScript).
  - Estruturar a pasta `src/` seguindo a arquitetura **Feature-Sliced Design (FSD)**:
    - `src/app/`: Provedores globais, estilos globais e inicialização.
    - `src/pages/`: Telas da aplicação (ex: Login, Dashboard, Detalhe do Grupo, Amigos).
    - `src/widgets/`: Blocos compostos de UI (ex: Feed de Despesas, Painel de Balanço).
    - `src/features/`: Ações interativas do usuário (ex: criar despesa, entrar em grupo com código, vincular shadow user).
    - `src/entities/`: Estado, hooks e tipos das entidades de negócio (`user`, `group`, `expense`, `payment`).
    - `src/shared/`: Componentes base (Botões, Inputs), utilitários e cliente da API (Axios).
  - Configurar caminhos absolutos (`tsconfig.json` e `babel.config.js`) para importar usando aliases como `@/shared`, `@/entities`, etc.
- [ ] **Navegação (Expo Router):**
  - Configurar a pasta `app/` nativa do Expo Router como uma camada de roteamento limpa que apenas importa e renderiza as telas definidas em `src/pages/`.
  - Definir fluxos de autenticação (Login/Cadastro) e rotas protegidas (Tab Navigation para Dashboard, Grupos, Amigos e Perfil).
- [ ] **Telas Core (Implementadas em `src/pages` e compostas por `widgets`/`features`):**
  - **Login / Cadastro:** Autenticação JWT e exibição do código de perfil exclusivo de 6 dígitos.
  - **Lista de Grupos:** Listagem de grupos e ações de criação/entrada via código.
  - **Detalhe do Grupo (Feed):** Linha do tempo de despesas, saldos internos e atalhos de gerenciamento.
  - **Adicionar Despesa:** Formulário interativo de lançamento e divisão de gastos com cálculo dinâmico.
  - **Balanço Global & Amigos:** Controle de dívidas cruzadas e liquidação de pendências.
  - **Vincular Usuário Convidado:** Interface para o criador do Shadow User realizar a fusão de históricos inserindo o código de perfil real.
- [ ] **Integração de APIs (Axios em `src/shared/api`):**
  - Configuração do Axios com interceptor para renovação/envio de tokens JWT e tratamento global de erros.

---

### Fase 5: Validação e Testes
- [ ] **Testes de Unidade:** Validar a engine matemática de divisão de contas e a lógica de consolidação de saldos no backend.
- [ ] **Testes de Integração:** Simular o fluxo completo de vincular um Shadow User e garantir que todos os saldos migraram corretamente de forma atômica.
- [ ] **Verificação Manual:** Testar as requisições via arquivo `.http` ou Swagger (OpenAPI) e posteriormente a integração do app móvel.

---

## ❓ Perguntas Abertas e Decisões

> [!IMPORTANT]
> 1. **Lógica de Divisão Inicial:** Desejamos suportar inicialmente apenas divisões **iguais** (ex: dividir em partes iguais para todos os selecionados) ou já implementar divisões customizadas (onde cada um paga um valor arbitrário diferente)?
> 2. **Docker Desktop:** Você conseguiu iniciar o Docker Desktop para podermos subir o container do banco?
