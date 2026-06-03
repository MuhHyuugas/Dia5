# Arquitetura do Sistema

## 1. Visão Geral
O aplicativo utiliza uma **Arquitetura Cliente-Servidor Monolítica** baseada no padrão **N-Tier (Clean Architecture simplificada)**. A separação clara de responsabilidades garante que o código seja testável, escalável e de fácil manutenção, isolando as regras de negócio de detalhes de infraestrutura e interface gráfica.

## 2. Stack Tecnológica
* **Frontend (Mobile):** React Native (Responsável apenas pela UI e consumo da API).
* **Backend (API):** C# com .NET (Responsável pela lógica de negócios e segurança).
* **Banco de Dados:** PostgreSQL (Responsável pela persistência e integridade dos dados transacionais).
* **ORM:** Entity Framework Core (EF Core).

---

## 3. Diagrama de Pacotes (Dependências)

O diagrama abaixo ilustra a estrutura de pacotes (projetos dentro da solução `.sln`) e o fluxo de dependências. A regra fundamental desta arquitetura é que **as dependências sempre apontam para o centro** (o Domínio).

```mermaid
classDiagram
    direction BT

    class MobileApp {
        <<React Native>>
        +Views
        +Components
        +Services (Axios/Fetch)
    }

    class API {
        <<Presentation Layer>>
        +Controllers
        +Middlewares
        +Program.cs (DI Container)
    }

    class Application {
        <<Business Layer>>
        +Services
        +DTOs
        +Interfaces (IRepositories)
    }

    class Infrastructure {
        <<Data Layer>>
        +Repositories
        +AppDbContext (EF Core)
        +Migrations
    }

    class Domain {
        <<Core Layer>>
        +Entities (Despesa, Usuario)
        +Enums
        +Exceptions
    }

    class PostgreSQL {
        <<Database>>
    }

    MobileApp ..> API : HTTP REST / JSON
    API --> Application : Referencia
    Infrastructure --> Application : Implementa Interfaces
    Infrastructure --> Domain : Referencia
    Application --> Domain : Referencia
    API --> Infrastructure : Referencia (Apenas para Injeção de Dependência)
    Infrastructure ..> PostgreSQL : TCP/IP (Npgsql)