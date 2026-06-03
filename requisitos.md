# Documentação de Requisitos - Dia5

## 📋 Requisitos Funcionais (RF)

### 1. Autenticação e Perfis
* **RF01 (Cadastro e Autenticação):** O sistema deve permitir o cadastro de usuários reais informando nome, e-mail e senha, além de realizar login gerando um token de sessão.
* **RF02 (Shadow Users):** O sistema deve permitir a criação de "Usuários Convidados" (sem credenciais de acesso), que ficarão atrelados exclusivamente à conta do usuário que os criou.
* **RF03 (Conexão por Código de Perfil):** O sistema deve permitir que usuários se conectem e formem vínculo de amizade através de um código de perfil alfanumérico único gerado pelo sistema.
* **RF04 (Vinculação de Perfil):** O sistema deve permitir mesclar todo o histórico financeiro de um "Usuário Convidado" com uma conta de usuário real recém-conectada ao sistema.

### 2. Gestão de Grupos
* **RF05 (Criação de Grupos):** O sistema deve permitir a criação de Grupos de despesas (ex: "Casa", "Viagem"), gerando um código único de convite para cada grupo.
* **RF06 (Entrada em Grupo por Código):** O sistema deve permitir que um usuário entre em um grupo já existente inserindo o código exclusivo do grupo.
* **RF07 (Gestão de Participantes):** O criador do grupo deve ter a capacidade de remover usuários (reais ou convidados) do grupo.
* **RF08 (Extrato do Grupo):** O sistema deve exibir um feed cronológico (histórico) com todas as atividades de um grupo, incluindo despesas criadas, liquidações e entrada/saída de membros.

### 3. Gestão Financeira e Despesas
* **RF09 (Registro de Despesa Detalhada):** O usuário deve ser capaz de registrar uma Despesa dentro de um grupo, informando obrigatoriamente: descrição da compra, valor total, data e hora da transação, pagador e a lógica de divisão exata entre os participantes selecionados.
* **RF10 (Edição e Exclusão de Despesas):** O sistema deve permitir a edição ou exclusão de uma despesa registrada, recalculando os saldos impactados imediatamente.
* **RF11 (Balanço do Grupo):** O sistema deve exibir o balanço financeiro individual dentro do escopo de um grupo específico (detalhando quem deve quanto e para quem).
* **RF12 (Balanço Global Consolidado):** O sistema deve exibir um balanço global entre dois amigos, cruzando e liquidando matematicamente os saldos de todos os grupos que possuem em comum.
* **RF13 (Liquidação de Dívida):** O sistema deve permitir o registro de um pagamento ("Acerto de Contas") entre dois usuários, abatendo o valor correspondente no balanço geral e nos respectivos grupos.

---

## ⚙️ Regras de Negócio (RN)

### 1. Regras de Integridade e Escopo
* **RN01 (Escopo Financeiro):** O sistema atua estritamente como um livro-razão (ledger) para controle de saldos. Não há transações bancárias ou processamento de pagamentos reais.
* **RN02 (Restrição de Convidado):** Um Usuário Convidado não possui acesso ao aplicativo, não faz login e não pode interagir com o sistema. Seus saldos são de gerenciamento visual exclusivo do usuário criador.

### 2. Regras Matemáticas
* **RN03 (Consistência de Partilha):** A soma aritmética das frações ou valores distribuídos entre os participantes de uma despesa deve ser estritamente igual ao valor total informado no registro.

### 3. Regras de Segurança e Banco de Dados
* **RN04 (Segurança de Credenciais):** As senhas dos usuários reais devem ser armazenadas utilizando hash criptográfico (ex: BCrypt/Argon2) e o acesso protegido via JWT (JSON Web Tokens).
* **RN05 (Transação Atômica de Vinculação):** A migração de um *Shadow User* para uma conta real (RF04) deve ser executada como uma transação atômica no banco de dados, atualizando todas as chaves estrangeiras pendentes antes de invalidar o perfil fantasma.
* **RN06 (Restrição de Remoção de Usuário):** Um usuário não pode sair voluntariamente de um grupo, nem ser removido pelo criador, se o seu saldo líquido naquele grupo for diferente de zero (seja na posição de credor ou devedor).
* **RN07 (Permissão de Alteração de Dados):** Apenas o usuário autor da despesa (ou o administrador do grupo) possui permissão sistêmica para editar ou excluir aquele registro.
* **RN08 (Exclusão Segura / Soft Delete):** A exclusão de uma despesa não deve apagá-la fisicamente do banco de dados. O registro deve receber uma marcação temporal temporal de exclusão (`deleted_at`), garantindo a rastreabilidade e possibilitando a reversão de saldos no ledger. 