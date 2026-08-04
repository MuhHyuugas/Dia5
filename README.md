<div align="center">
  
# 💸 Dia 5 - Divisão Inteligente de Despesas

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)

*Aplicativo moderno para divisão de despesas, gestão de repúblicas e acertos de contas entre amigos, desenhado com arquitetura limpa e sincronização em tempo real.*

</div>

---

## 📌 Sobre o Projeto

O **Dia 5** é uma solução completa (Mobile e Web) projetada para resolver o problema de "quem deve quanto a quem" em viagens, repúblicas e encontros de amigos. 

Diferente de soluções genéricas, o **Dia 5** conta com suporte nativo a **Shadow Users (Convidados sem App)**: você pode adicionar participantes que ainda não baixaram o aplicativo, controlar os gastos deles e, quando eles criarem uma conta, migrar todo o histórico através de um **Código de Perfil Único**.

---

## 🚀 Funcionalidades Principais

* **Grupos de Despesas:** Crie e gerencie grupos personalizados com código de convite único.
* **Shadow Users (Sem App):** Adicione convidados sem aplicativo nas despesas e dê baixa em pagamentos por eles.
* **Vincular Perfil Fantasma:** Transfira todo o histórico do convidado quando ele instalar o app usando o Código de Perfil de 6 dígitos.
* **Balanço Geral Consolidado:** Acompanhe em tempo real na tela inicial quanto você tem a receber ou deve somando todos os seus grupos.
* **Acerto Inteligente de Contas (Liquidar Dívida):** Transações direcionadas entre devedores e credores com aviso claro de quem pagou quem.
* **Input de Valores Estilo Banco:** Digitação simplificada e sem bugs iniciada em `0,00` com deslize/toque fora para dispensar o teclado.
* **Personalização de Perfil:** Escolha entre uma coleção de avatares modernos ou informe a URL da sua foto.
* **Interface Responsiva e Safe Area:** Otimizada para iPhone, iPad e telas Android.

---

## 🏗️ Arquitetura e Stack Tecnológica

* **Backend:** Node.js (NestJS + TypeORM + JWT + PostgreSQL)
* **Mobile:** React Native (Expo SDK 52 + React Navigation + Lucide Icons)
* **Frontend Web:** React (Vite + Tailwind CSS + Lucide Icons)
* **Banco de Dados:** PostgreSQL 16 (via Docker Compose)

---

## 🛠️ Como Instalar e Rodar o Projeto (Guia Passo a Passo)

### 1. Clonar o Repositório
```bash
git clone https://github.com/MuhHyuugas/Dia5.git
cd Dia5
```

---

### 2. Iniciar o Banco de Dados (PostgreSQL + Docker)
Certifique-se de ter o Docker/Docker Desktop rodando em sua máquina e execute:
```bash
docker compose up -d
```
> O banco estará rodando na porta `5432` com usuário `dia5_user` e banco `dia5_db`. OpgAdmin ficará disponível em `http://localhost:5050` (`admin@dia5.com` / `admin`).

---

### 3. Backend (NestJS API)
Abra um terminal na raiz do repositório:
```bash
# Entrar na pasta do backend
cd backend

# Instalar as dependências
npm install

# Iniciar o servidor em modo de desenvolvimento (Watch Mode)
npm run start:dev
```
> A API estará rodando em `http://localhost:3000/api`.

---

### 4. Aplicativo Mobile (React Native + Expo)
Abra um novo terminal na raiz do repositório:
```bash
# Entrar na pasta do aplicativo mobile
cd mobile

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento Expo
npx expo start
```
> **Como testar:**
> - **Celular Físico:** Abra o aplicativo **Expo Go** (iOS/Android) e escaneie o código QR exibido no terminal.
> - **Emulador Android / iOS Simulator:** Pressione `a` para Android ou `i` para iOS no terminal do Expo.

---

### 5. Frontend Web (React + Vite)
Abra um novo terminal na raiz do repositório:
```bash
# Entrar na pasta do frontend web
cd frontend

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
> A aplicação Web estará acessível em `http://localhost:5173`.

---

## 📄 Licença e Contribuição

Projeto desenvolvido para gestão inteligente de contas em grupo. Fique à vontade para testar, abrir issues e enviar pull requests com melhorias! 🚀
