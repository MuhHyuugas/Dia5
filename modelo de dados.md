# Modelo de Dados (DER) - PostgreSQL

## 1. Tabela `usuarios`
Armazena tanto usuários reais quanto perfis fantasmas (Shadow Users).
* `id` (UUID) - Chave Primária (PK)
* `nome` (VARCHAR) - Obrigatório
* `email` (VARCHAR) - Nulo para Shadow Users
* `senha_hash` (VARCHAR) - Nulo para Shadow Users
* `codigo_perfil` (VARCHAR(6)) - Único (UK). Nulo para Shadow Users.
* `is_guest` (BOOLEAN) - Default: false
* `criado_por` (UUID) - Chave Estrangeira (FK) -> `usuarios(id)`. Nulo se for usuário real.
* `created_at` (TIMESTAMP) - Data de criação

## 2. Tabela `amizades`
Relacionamento N:N para conectar dois usuários que compartilham saldos globais.
* `usuario_id_1` (UUID) - PK/FK -> `usuarios(id)`
* `usuario_id_2` (UUID) - PK/FK -> `usuarios(id)`
* `created_at` (TIMESTAMP)

## 3. Tabela `grupos`
* `id` (UUID) - PK
* `nome` (VARCHAR) - Obrigatório
* `codigo_convite` (VARCHAR(6)) - Único (UK)
* `criado_por` (UUID) - FK -> `usuarios(id)`
* `created_at` (TIMESTAMP)

## 4. Tabela `membros_grupo`
Relacionamento N:N entre Usuários e Grupos.
* `grupo_id` (UUID) - PK/FK -> `grupos(id)`
* `usuario_id` (UUID) - PK/FK -> `usuarios(id)`
* `joined_at` (TIMESTAMP)

## 5. Tabela `despesas`
O cabeçalho do gasto. Define o valor total e quem pagou a conta.
* `id` (UUID) - PK
* `grupo_id` (UUID) - FK -> `grupos(id)`
* `pagador_id` (UUID) - FK -> `usuarios(id)`
* `descricao` (VARCHAR) - Ex: "Conta de luz"
* `valor_total` (DECIMAL(10,2)) - Valor exato pago
* `data_compra` (TIMESTAMP) - Quando o gasto ocorreu
* `created_at` (TIMESTAMP) - Quando foi registrado no sistema
* `deleted_at` (TIMESTAMP) - Nulo por padrão (Soft Delete)

## 6. Tabela `participantes_despesa`
O detalhamento lógico. Define quem participou da despesa e quanto exatamente consome do total.
* `despesa_id` (UUID) - PK/FK -> `despesas(id)`
* `usuario_id` (UUID) - PK/FK -> `usuarios(id)`
* `valor_devido` (DECIMAL(10,2)) - A fração que essa pessoa deve (A soma de todos dessa despesa deve bater com o `valor_total`)

## 7. Tabela `pagamentos` (Liquidações)
Registra o acerto de contas para abater os saldos devedores.
* `id` (UUID) - PK
* `pagador_id` (UUID) - FK -> `usuarios(id)`
* `recebedor_id` (UUID) - FK -> `usuarios(id)`
* `grupo_id` (UUID) - FK -> `grupos(id)` (Opcional, caso o pagamento seja apenas do contexto do grupo)
* `valor_pago` (DECIMAL(10,2))
* `data_pagamento` (TIMESTAMP)
* `created_at` (TIMESTAMP)