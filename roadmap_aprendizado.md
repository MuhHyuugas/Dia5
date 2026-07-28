# 🗺️ Seu Roadmap de Aprendizado — TypeScript & NestJS

> **Objetivo:** Aprender TypeScript e os conceitos de backend moderno através do projeto real **Dia5** que já criamos juntos.
> 
> A melhor forma de aprender é **lendo o código que você já tem** e depois **modificando ele**. Por isso, cada fase abaixo tem links para os arquivos do projeto como referência prática.

---

## 🟢 Fase 1 — Fundamentos do TypeScript
*Tempo estimado: 1–2 semanas*

Antes de entender o NestJS, você precisa dominar a linguagem em si. TypeScript é essencialmente JavaScript com **tipagem estática**, o que significa que você declara o "formato" dos seus dados com antecedência.

### O que estudar:

#### 1.1 — Tipos Primitivos e Básicos
```typescript
// Tipos que você já usa no projeto:
const nome: string = 'João';
const idade: number = 25;
const isGuest: boolean = false;
const deletedAt: Date | null = null;  // Union type!
```
**Onde ver no projeto:** [user.entity.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/domain/entities/user.entity.ts) — repare como cada propriedade tem um tipo declarado ao lado.

#### 1.2 — Interfaces e Classes
TypeScript permite descrever "contratos" de dados.
```typescript
// Interface = molde/contrato de dados
interface Pessoa {
  nome: string;
  email: string | null;
}

// Classe = molde + comportamento (métodos)
class Usuario implements Pessoa {
  nome: string;
  email: string | null;
  
  validar() { /* ... */ }
}
```
**Onde ver no projeto:** As entidades são **classes** — veja como `User` tem propriedades e o método `validar()` em [user.entity.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/domain/entities/user.entity.ts).

#### 1.3 — Decorators (`@`)
Esse é o conceito mais "mágico" do NestJS. Decorators são funções que **anotam** classes e propriedades com metadados.
```typescript
@Entity('usuarios')      // Diz ao TypeORM: "Esta classe é uma tabela"
@Column({ type: 'varchar' })  // Diz ao TypeORM: "Esta propriedade é uma coluna"
```
**Onde ver no projeto:** Todos os arquivos `*.entity.ts` são exemplos disso. Cada `@Entity`, `@Column`, `@PrimaryColumn` é um decorator.

#### 1.4 — Funções Assíncronas (`async/await`)
```typescript
// async = a função pode esperar por coisas demoradas (ex: banco de dados)
// await = aguarde esse resultado antes de continuar
async function buscarUsuario(id: string): Promise<User> {
  const user = await userRepository.findOne({ where: { id } }); // espera o DB
  return user;
}
```
**Onde ver no projeto:** Todo método do [auth.service.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.service.ts) é `async`.

#### 📚 Recursos:
- [TypeScript Handbook Oficial](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Execute Programs — TypeScript](https://www.executeprogram.com/courses/typescript) (interativo, recomendado)

---

## 🔵 Fase 2 — Arquitetura NestJS
*Tempo estimado: 2–3 semanas*

O NestJS organiza o código em **3 pilares**: **Módulos**, **Controllers** e **Services**. Tudo que você precisa entender é como eles se comunicam.

### O que estudar:

#### 2.1 — O Triângulo Module → Controller → Service

```
[ AuthModule ]        ← agrupa tudo relacionado à autenticação
     |
     ├── [ AuthController ]   ← recebe a requisição HTTP e chama o service
     |         POST /register
     |         POST /login
     |
     └── [ AuthService ]      ← contém a lógica de negócio real
               bcrypt, JWT, DB
```

**Arquivos do projeto para estudar juntos:**
1. [auth.module.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.module.ts) — como o módulo registra seus componentes
2. [auth.controller.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.controller.ts) — como o controller recebe e delega
3. [auth.service.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.service.ts) — onde mora a lógica de verdade

#### 2.2 — Injeção de Dependência (DI)
É o conceito mais importante do NestJS. Em vez de criar instâncias na mão (`new AuthService()`), você **declara que precisa** de algo e o NestJS cuida do resto.
```typescript
@Controller('auth')
export class AuthController {
  // NestJS injeta o AuthService automaticamente!
  constructor(private readonly authService: AuthService) {}
}
```
**Onde ver no projeto:** O `constructor` em [auth.controller.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.controller.ts) e [auth.service.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.service.ts).

#### 2.3 — DTOs e Validação (`class-validator`)
DTOs (Data Transfer Objects) são classes que definem o "formato" dos dados que chegam nas requisições HTTP, com validação automática.
```typescript
// Quando o usuário manda um POST /register:
// NestJS valida os campos ANTES de chegar no controller
export class RegisterUserDto {
  @IsEmail()   // valida que é um e-mail válido
  email: string;
  
  @MinLength(6) // valida tamanho mínimo
  senha: string;
}
```
**Onde ver no projeto:** [register.dto.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/dto/register.dto.ts) e [login.dto.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/dto/login.dto.ts).

#### 📚 Recursos:
- [Documentação Oficial do NestJS](https://docs.nestjs.com/) — começa pelos Fundamentals
- [NestJS - Do Zero à Produção (YouTube)](https://www.youtube.com/watch?v=BNGYFaExEhY)

---

## 🟣 Fase 3 — Banco de Dados com TypeORM
*Tempo estimado: 2 semanas*

O TypeORM é o nosso "tradutor" entre o código TypeScript e as tabelas SQL do PostgreSQL.

### O que estudar:

#### 3.1 — Entidades e Mapeamento de Tabelas
Cada entidade TypeScript = Uma tabela no banco. Os decorators `@Column`, `@ManyToOne`, `@OneToMany` etc. definem como as colunas e relacionamentos são criados.

**Exercício prático:** Abra o pgAdmin em `http://localhost:5050` (login: `admin@dia5.com` / `admin`), conecte ao banco `dia5_db` e veja as tabelas criadas automaticamente pelo nosso código!

#### 3.2 — Repositórios e Queries
```typescript
// O Repository é a interface para fazer queries no banco:
const user = await this.userRepository.findOne({
  where: { email: 'joao@exemplo.com' }  // SELECT * FROM usuarios WHERE email = ...
});

await this.userRepository.save(user);   // INSERT ou UPDATE
```
**Onde ver no projeto:** [auth.service.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.service.ts) — todos os métodos fazem queries assim.

#### 3.3 — Relacionamentos (ManyToOne, OneToMany)
```typescript
// "Um grupo tem MUITOS membros"
@OneToMany(() => GroupMember, (member) => member.grupo)
membros: GroupMember[];

// "Muitos membros pertencem a UM grupo"
@ManyToOne(() => Group)
grupo: Group;
```
**Onde ver no projeto:** [group-member.entity.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/domain/entities/group-member.entity.ts) e [expense.entity.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/domain/entities/expense.entity.ts).

---

## 🟡 Fase 4 — Segurança (JWT + Autenticação)
*Tempo estimado: 1 semana*

Esse fluxo já está implementado no projeto. Entender como ele funciona é o seu objetivo nessa fase.

### O que estudar:

#### 4.1 — Como o JWT funciona
```
[Usuário faz login] → [Server gera um token assinado] → [Usuário guarda o token]
[Usuário acessa rota protegida] → [Manda token no header] → [Server verifica assinatura]
```

#### 4.2 — O fluxo Passport + Strategy
1. Requisição chega com `Authorization: Bearer <token>`
2. O `JwtAuthGuard` intercepta e aciona a `JwtStrategy`
3. A `JwtStrategy` valida e decodifica o token
4. O resultado fica disponível no controller via `@Request()` decorator

**Onde ver no projeto:**
- [jwt.strategy.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/strategies/jwt.strategy.ts) — como o token é validado
- [jwt-auth.guard.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/guards/jwt-auth.guard.ts) — como proteger rotas

---

## 🔴 Fase 5 — Missão: Implementar os Outros Módulos do Dia5!
*Tempo estimado: 3–4 semanas (mão na massa!)*

Agora que você entende a base, o melhor aprendizado é **criar os próximos módulos do projeto do zero**. Siga o mesmo padrão do `AuthModule`:

### Desafios em ordem crescente de dificuldade:

| # | Módulo | O que fazer |
|---|--------|-------------|
| 1 | `UsersModule` | CRUD de Shadow Users (RF02) |
| 2 | `GroupsModule` | Criar/entrar em grupos com código (RF05, RF06) |
| 3 | `ExpensesModule` | Registrar despesas com validação de partilha (RF09, RF10) |
| 4 | `FriendshipsModule` | Conexão entre amigos via código de perfil (RF03) |
| 5 | `PaymentsModule` | Liquidação de dívidas e cálculo de balanço (RF11, RF12, RF13) |

Para cada módulo, você vai precisar criar:
```
src/modules/<nome>/
├── <nome>.module.ts       ← registra tudo
├── <nome>.controller.ts   ← define as rotas HTTP
├── <nome>.service.ts      ← implementa a lógica
└── dto/
    ├── create-<nome>.dto.ts
    └── update-<nome>.dto.ts
```

---

## 📊 Visão Geral do Roadmap

```
Semana 1-2:   🟢 TypeScript Básico (tipos, classes, async/await)
Semana 3-4:   🔵 Arquitetura NestJS (Módulos, Controllers, Services)
Semana 5-6:   🟣 TypeORM e Banco de Dados (entidades, queries, relacionamentos)
Semana 7:     🟡 Segurança (JWT, Guards, Strategies)
Semana 8-12:  🔴 Mão na massa — implementar os demais módulos do Dia5!
```

> [!TIP]
> **Dica de ouro:** Ao invés de ler tutoriais do zero, **leia os arquivos do projeto** e tente responder: "por que esse código está aqui?". Quando não souber, pesquise o conceito específico. Aprender de fora pra dentro é sempre mais rápido do que aprender de dentro pra fora.

> [!NOTE]
> **Por onde começar agora?** Abra o [auth.service.ts](file:///c:/Users/bcaet/OneDrive/Desktop/dev/dia5/backend/src/modules/auth/auth.service.ts) e leia **linha por linha**. Você já entende o que o código faz (registrar e logar usuários). Agora a missão é entender **como** ele faz.
