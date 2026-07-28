# Walkthrough: Backend NestJS (Dia5) — 100% Concluído 🎉

Finalizamos com sucesso a implementação completa do Backend em **TypeScript + NestJS** para a aplicação **Dia5**, cobrindo 100% dos Requisitos Funcionais, Regras de Negócio e Casos de Uso, além da infraestrutura para **deploy serverless na Vercel**.

---

## 🛠️ O que foi Implementado

### 1. `AuthModule` & Segurança (RF01)
- Cadastro de usuário real (`POST /auth/register`) com senha criptografada em BCrypt.
- Geração automática de `codigoPerfil` alfanumérico único de 6 caracteres (ex: `MUR998`).
- Login com verificação de credenciais e emissão de **JWT (JSON Web Token)** (`POST /auth/login`).
- Proteção global de rotas via `JwtAuthGuard` e `JwtStrategy`.

### 2. `UsersModule` (RF02, RF04 / UC03, UC07)
- **Cadastro de Usuário Convidado/Shadow User** (`POST /users/guests`): cria participantes sem conta no app (`isGuest = true`), vinculados ao criador.
- **Consulta de Perfil** (`GET /users/me`).
- **Vinculação de Perfil Fantasma** (`POST /users/link-shadow`): executa **transação no Banco de Dados (`dataSource.transaction`)** (**RN05**), transferindo todo o histórico de despesas, participações e pagamentos do perfil convidado para a conta real informada pelo `codigoPerfil` e excluindo o perfil fantasma.

### 3. `FriendshipsModule` (RF03 / UC06)
- **Adicionar Amigo por Código** (`POST /friends/add`): localiza usuário pelo `codigoPerfil` de 6 caracteres e cria o vínculo em `Friendship`.
- **Listar Amigos** (`GET /friends`).
- **Desfazer Amizade** (`DELETE /friends/:friendId`): desfaz o vínculo aplicando a **RN06 / FE01 UC06** (calcula o saldo líquido cruzado entre os dois e **bloqueia a remoção caso haja qualquer valor pendente**).

### 4. `GroupsModule` (RF05, RF06, RF07, RF08 / UC04, UC05)
- **Criar Grupo** (`POST /groups`): cria o grupo e gera um `codigoConvite` exclusivo de 6 caracteres, vinculando o criador como membro.
- **Entrar em Grupo por Código** (`POST /groups/join`): associa o usuário logado ao grupo (com tratamento de exceção se o usuário já for membro).
- **Listar Grupos do Usuário** (`GET /groups`).
- **Remover Participante** (`DELETE /groups/:groupId/members/:memberId`): remove membro aplicando a **RN06** (bloqueia remoção se o saldo líquido do participante no grupo for $\neq 0$).
- **Extrato do Grupo / Feed Timeline** (`GET /groups/:groupId/activity`): retorna o feed cronológico de atividades do grupo (**RF08**).

### 5. `ExpensesModule` (RF09, RF10, RF11 / UC01 / RN03, RN07, RN08)
- **Registrar Despesa** (`POST /expenses`): recebe pagador, valor, grupo e participantes com cotas devidas. Aplica a validação estrita da **RN03 / UC01 FE01** (a soma dos valores devidos dos participantes deve ser estritamente igual ao valor total pago).
- **Editar Despesa** (`PUT /expenses/:id`): altera dados e re-valida partilha, respeitando permissões de autor/admin (**RN07**).
- **Excluir Despesa** (`DELETE /expenses/:id`): executa **Soft Delete** (**RN08**: preenche `deletedAt`, preservando o histórico).
- **Balanço Individual do Grupo** (`GET /expenses/group/:groupId/balance`): calcula o saldo líquido individual de cada membro no escopo do grupo (**RF11**).

### 6. `PaymentsModule` (RF12, RF13 / UC02, UC08)
- **Balanço Global Consolidado** (`GET /payments/balance/global/:friendId`): cruza todas as despesas e pagamentos de todos os grupos em comum entre dois amigos para gerar o saldo líquido consolidado (**RF12 / UC08**).
- **Liquidação de Dívida** (`POST /payments`): registra pagamento (parcial ou total), bloqueando caso o valor pago seja superior à dívida atual (**FE02 UC02**).

### 7. Infraestrutura Serverless para Vercel
- **[api/index.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/api/index.ts)**: Handler serverless usando Express Adapter para a Vercel executar a API em ambiente de função sem porta TCP fixa.
- **[vercel.json](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/vercel.json)**: Configuração de rotas redirecionando `/api/(.*)` para a Serverless Function.

---

## 🧪 Validação dos Builds

Todos os módulos foram compilados e validados pelo compilador do NestJS/TypeScript (`nest build`):
- `task-152` (`UsersModule`): **SUCESSO**
- `task-192` (`FriendshipsModule`): **SUCESSO**
- `task-235` (`GroupsModule`): **SUCESSO**
- `task-283` (`ExpensesModule`): **SUCESSO**
- `task-310` (`PaymentsModule` & Vercel Handler): **SUCESSO**
