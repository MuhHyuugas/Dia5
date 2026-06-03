# Documentação de Casos de Uso (Use Cases)

## UC01: Registrar Nova Despesa
* **Descrição:** Permite que um usuário registre um gasto e defina como ele será dividido entre os participantes.
* **Ator Principal:** Usuário Autenticado (Membro do Grupo).
* **Pré-condições:** O usuário deve estar logado e acessar a tela de um Grupo específico (ex: "Casa").

**Fluxo Principal (Caminho Feliz):**
1. O usuário clica no botão "Adicionar Despesa".
2. O sistema exibe um formulário solicitando: Descrição, Valor Total, Data/Hora, Pagador e Participantes da divisão.
3. O usuário preenche os dados (ex: "Conta de Luz", R$ 100,00).
4. O usuário seleciona o Pagador (ex: Brennda) e os envolvidos na divisão (ex: Brennda e Murilo).
5. O sistema sugere uma divisão igualitária automaticamente (R$ 50,00 para cada).
6. O usuário confirma a divisão e clica em "Salvar".
7. O sistema valida se a soma das partes equivale ao total.
8. O sistema salva o registro no banco de dados e atualiza os saldos do grupo em tempo real.

**Fluxos de Exceção:**
* **FE01 - Divisão Inconsistente:** No passo 7, se a soma das frações não bater com o valor total (ex: R$ 50,00 + R$ 40,00 para uma conta de R$ 100,00), o sistema bloqueia a ação, exibe um alerta de "Valores divergentes" e impede o salvamento.

---

## UC02: Liquidar Dívida (Acerto de Contas)
* **Descrição:** Permite que um usuário registre que pagou (ou recebeu) um valor pendente, abatendo a dívida no balanço.
* **Ator Principal:** Usuário Autenticado (Devedor ou Credor).
* **Pré-condições:** Deve existir um saldo diferente de zero entre os dois usuários.

**Fluxo Principal (Caminho Feliz):**
1. Murilo acessa o painel de "Balanço Global" e visualiza que deve R$ 40,00 a Brennda.
2. Murilo clica no botão "Liquidar Dívida".
3. O sistema exibe a opção de quitar o valor total ou um valor parcial.
4. Murilo opta por quitar o valor total (R$ 40,00) e confirma a ação.
5. O sistema registra um evento de "Pagamento" no banco de dados com a data e hora atuais.
6. O sistema recalcula o balanço global de ambos, zerando a pendência, e envia uma notificação visual.

**Fluxos Alternativos:**
* **FA01 - Pagamento Parcial:** No passo 4, Murilo informa que pagou apenas R$ 20,00. O sistema aceita, registra o evento parcial e atualiza o saldo restante para R$ 20,00 negativos.
* **FE02 - Pagamento Superior ao Saldo Devedor:** No passo 3, se o usuário tentar registrar um valor de pagamento maior do que a dívida total existente (ex: informar R$ 50,00 para quitar uma dívida de R$ 40,00), o sistema bloqueia a ação, exibe a mensagem de erro *"O valor do acerto não pode ser maior que a dívida atual"* e impede o registro no banco de dados.

---

## UC03: Vincular Perfil Fantasma (Shadow User)
* **Descrição:** Permite que o criador de um Usuário Convidado migre todo o histórico desse convidado para uma conta real recém-criada.
* **Ator Principal:** Usuário Autenticado (Criador do Shadow User).
* **Pré-condições:** O sistema deve ter um Usuário Convidado registrado e o novo usuário real já deve ter criado sua conta e gerado seu "Código de Perfil".

**Fluxo Principal (Caminho Feliz):**
1. O usuário (ex: Brennda) acessa a tela de "Gerenciar Participantes" do grupo.
2. Seleciona o perfil do "Murilo (Convidado)" e clica em "Vincular a Conta Real".
3. O sistema solicita a inserção do Código de Perfil.
4. Brennda insere o código fornecido pelo Murilo real (ex: `MUR-9988`).
5. O sistema busca o código e exibe a mensagem: *"Deseja transferir todo o histórico para Murilo Santos?"*
6. Brennda confirma.
7. O sistema executa a transação atômica no banco de dados: atualiza todos os IDs das despesas antigas para o ID do Murilo real e exclui o perfil fantasma.
8. Murilo real passa a enxergar todo o histórico no app dele.

**Fluxos de Exceção:**
* **FE01 - Código Inválido:** No passo 5, se o código não existir, o sistema exibe erro e interrompe o fluxo.

## UC04: Criar e Gerenciar Grupo
* **Descrição:** Permite que o usuário crie um novo espaço para dividir contas e gerencie suas propriedades básicas.
* **Ator Principal:** Usuário Autenticado (Criador/Administrador).
* **Pré-condições:** O usuário deve estar logado no aplicativo.

**Fluxo Principal (Caminho Feliz):**
1. O usuário acessa a aba "Grupos" e clica em "Novo Grupo".
2. O sistema solicita o Nome do grupo e, opcionalmente, uma imagem/ícone.
3. O usuário preenche os dados (ex: "República") e salva.
4. O sistema registra o grupo no banco de dados e gera um Código de Convite exclusivo de 6 caracteres alfanuméricos.
5. O sistema exibe a tela do novo grupo com o código visível para compartilhamento.

**Fluxos de Exceção:**
* **FE01 - Nome em Branco:** No passo 3, se o usuário tentar salvar sem um nome, o sistema bloqueia a ação e exibe um alerta de campo obrigatório.

---

## UC05: Entrar em um Grupo (Via Código)
* **Descrição:** Permite que um usuário ingresse em um grupo existente utilizando um código de convite.
* **Ator Principal:** Usuário Autenticado.
* **Pré-condições:** O usuário deve possuir o código de um grupo válido criado por outra pessoa.

**Fluxo Principal (Caminho Feliz):**
1. O usuário acessa a aba "Grupos" e clica em "Entrar com Código".
2. O sistema exibe um campo de texto.
3. O usuário digita o código (ex: `REP-456`) e confirma.
4. O sistema valida o código no banco de dados, identifica o grupo e vincula o ID do usuário ao grupo.
5. O sistema redirecioniona o usuário para a tela principal do grupo recém-adicionado.

**Fluxos de Exceção:**
* **FE01 - Código Inválido/Inexistente:** Se o código não for encontrado, o sistema exibe "Grupo não encontrado. Verifique o código digitado."
* **FE02 - Usuário Já Pertence ao Grupo:** Se o usuário já for membro, o sistema ignora a adição e apenas o redireciona para a tela do grupo.

---

## UC06: Conectar/Desfazer Amizade
* **Descrição:** Permite que dois usuários estabeleçam uma conexão direta para visualizar saldos globais ou que encerrem essa conexão.
* **Ator Principal:** Usuário Autenticado.

**Fluxo Principal (Adicionar Amigo):**
1. O usuário acessa a aba "Amigos" e clica em "Adicionar Amigo".
2. O usuário insere o Código de Perfil de outro usuário (ex: `BRE-1234`).
3. O sistema busca o código e exibe o nome do perfil encontrado para confirmação.
4. O usuário confirma.
5. O sistema cria o relacionamento na tabela de amizades e passa a consolidar os saldos cruzados.

**Fluxo Alternativo (Desfazer Amizade):**
* **FA01 - Remoção de Vínculo:** O usuário acessa o perfil do amigo e clica em "Desfazer Amizade". O sistema exclui o vínculo de amizade direta.

**Fluxos de Exceção:**
* **FE01 - Remoção com Saldo Pendente:** No fluxo FA01, se houver qualquer saldo (positivo ou negativo) entre os dois usuários, o sistema bloqueia a ação de desfazer a amizade e exige que as dívidas sejam liquidadas primeiro.

---

## UC07: Criar Usuário Convidado (Shadow User)
* **Descrição:** Permite cadastrar rapidamente uma pessoa que não tem o app para incluí-la na divisão de uma despesa.
* **Ator Principal:** Usuário Autenticado.
* **Pré-condições:** O usuário deve estar na tela de criação de grupo ou inserindo uma nova despesa.

**Fluxo Principal (Caminho Feliz):**
1. Durante a adição de membros em um grupo, o usuário clica em "Adicionar Pessoa sem App".
2. O sistema solicita um Nome.
3. O usuário digita "João (Convidado)" e salva.
4. O sistema cria um registro na tabela de usuários com a flag `is_guest = true` e o associa ao ID do criador.
5. O sistema retorna à tela anterior com o "João" disponível para ser selecionado nas divisões de contas.

---

## UC08: Consultar Balanço Global
* **Descrição:** Exibe o valor líquido consolidado que um usuário deve ou tem a receber de um amigo específico, somando todos os contextos.
* **Ator Principal:** Usuário Autenticado.
* **Pré-condições:** Os usuários devem ter um vínculo de amizade (UC06) e despesas em comum.

**Fluxo Principal (Caminho Feliz):**
1. O usuário acessa a aba "Amigos" (ou Balanço).
2. O sistema executa a consulta (query) no banco cruzando todos os grupos onde ambos participam.
3. O sistema consolida as frações de dívida de cada grupo e calcula o saldo líquido final.
4. O usuário clica no nome da amiga (ex: Brennda) e o sistema exibe: *"Você deve R$ 40,00 no total para Brennda"* juntamente com uma lista discriminando de onde vem esse valor (ex: R$ 50,00 devidos na Casa, R$ 10,00 a receber no Rolê).