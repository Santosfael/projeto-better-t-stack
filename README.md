# API Proffy

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)](https://orm.drizzle.team/)
[![Biome](https://img.shields.io/badge/Biome-Code%20Quality-60A5FA)](https://biomejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#licenca)

Backend da plataforma Proffy, desenvolvido com foco em performance, organizacao de codigo e autenticacao segura. A aplicacao expoe uma API REST construida com Fastify, utiliza PostgreSQL como banco de dados e segue uma estrutura modular em monorepo com `npm workspaces`.

## Visao geral

Este projeto centraliza a camada de servidor da aplicacao, incluindo:

- cadastro de usuarios
- autenticacao com `email` e `senha`
- geracao de token JWT
- persistencia do token em cookie HTTP assinado
- documentacao interativa da API
- validacao tipada de ambiente e payloads

## Objetivos do projeto

- construir uma base backend solida para a plataforma Proffy
- manter uma arquitetura simples de evoluir e facil de entender
- garantir seguranca basica de autenticacao com hash de senha e cookies assinados
- centralizar validacoes de entrada e ambiente com tipagem forte
- facilitar manutencao e crescimento do projeto com separacao clara de responsabilidades

## Stack principal

### Backend

- `Node.js`
- `TypeScript`
- `Fastify`
- `Zod`

### Autenticacao e seguranca

- `jsonwebtoken`
- `@fastify/cookie`
- `argon2`

### Banco de dados

- `PostgreSQL`
- `Drizzle ORM`

### Ferramentas de desenvolvimento

- `Biome`
- `tsx`
- `tsdown`
- `Swagger`
- `Scalar`

## Arquitetura do projeto

O repositorio esta organizado como monorepo, separando responsabilidades por pacote:

```text
api-proffy/
|-- apps/
|   `-- server/
|       |-- src/
|       |   |-- controllers/
|       |   |   |-- auth/
|       |   |   `-- users/
|       |   |-- lib/
|       |   |-- routes/
|       |   `-- index.ts
|       |-- .env
|       |-- .env.example
|       `-- package.json
|-- packages/
|   |-- config/
|   |   `-- tsconfig.base.json
|   |-- db/
|   |   |-- src/
|   |   |   |-- migrations/
|   |   |   |-- schema/
|   |   |   `-- index.ts
|   |   |-- drizzle.config.ts
|   |   |-- docker-compose.yml
|   |   `-- package.json
|   `-- env/
|       |-- src/
|       |   `-- server.ts
|       `-- package.json
|-- package.json
`-- README.md
```

## Responsabilidades por pasta

- `apps/server`: aplicacao principal da API, com rotas, controllers e utilitarios do servidor.
- `packages/db`: schema, configuracao do Drizzle, migrations e integracao com PostgreSQL.
- `packages/env`: validacao centralizada das variaveis de ambiente.
- `packages/config`: base compartilhada de configuracao TypeScript.

## Requisitos

Antes de executar o projeto, tenha instalado:

- `Node.js`
- `npm`
- `Docker` e `Docker Compose`, opcionalmente, para subir o PostgreSQL localmente

## Configuracao do ambiente

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `apps/server/.env` com base em `apps/server/.env.example`:

```env
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/api-proffy
JWT_TOKEN=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
HOST=0.0.0.0
PORT=3004
```

## Banco de dados

Para iniciar o banco com Docker:

```bash
npm run db:start
```

Para aplicar o schema atual no banco:

```bash
npm run db:push
```

Comandos auxiliares:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:studio`
- `npm run db:watch`
- `npm run db:stop`
- `npm run db:down`

## Execucao em desenvolvimento

Para iniciar todos os workspaces em desenvolvimento:

```bash
npm run dev
```

Para iniciar apenas a API:

```bash
npm run dev:server
```

Endpoints locais padrao:

- API: `http://localhost:3004`
- documentacao: `http://localhost:3004/docs`

## Endpoints implementados

### Criar usuario

`POST /users`

Exemplo de payload:

```json
{
  "name": "Rafael",
  "email": "rafael@email.com",
  "password": "123456"
}
```

### Login

`POST /login`

Exemplo de payload:

```json
{
  "email": "rafael@email.com",
  "password": "123456"
}
```

Ao autenticar com sucesso, a API:

- valida as credenciais
- gera um JWT
- salva o token em cookie HTTP assinado
- retorna os dados publicos do usuario

## Scripts disponiveis

| Comando | Descricao |
|---|---|
| `npm run dev` | Executa os workspaces em modo desenvolvimento |
| `npm run build` | Gera build dos workspaces |
| `npm run check-types` | Valida os tipos TypeScript |
| `npm run dev:server` | Executa apenas o backend |
| `npm run check` | Executa lint e formatacao com Biome |
| `npm run db:start` | Inicia o banco com Docker |
| `npm run db:push` | Envia o schema atual para o banco |
| `npm run db:generate` | Gera artefatos do Drizzle |
| `npm run db:migrate` | Executa migrations |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:watch` | Observa alteracoes no schema |
| `npm run db:stop` | Para os containers do banco |
| `npm run db:down` | Remove os containers do banco |

## Roadmap

- [x] Cadastro de usuarios
- [x] Login com JWT e cookie de sessao
- [ ] Rota para obter usuario autenticado
- [ ] Middleware para proteger rotas privadas
- [ ] Logout com limpeza do cookie
- [ ] Recuperacao de senha
- [ ] Cadastro e gerenciamento de aulas
- [ ] Busca e filtros de professores
- [ ] Suite inicial de testes automatizados

## Convencoes de commit

Para manter o historico mais claro, prefira commits curtos e descritivos seguindo um padrao inspirado em Conventional Commits:

- `feat:` para novas funcionalidades
- `fix:` para correcao de bugs
- `docs:` para alteracoes em documentacao
- `refactor:` para reorganizacao interna sem mudar comportamento esperado
- `chore:` para tarefas de manutencao
- `test:` para criacao ou ajuste de testes

Exemplos:

```bash
git commit -m "feat: adiciona rota de login com jwt"
git commit -m "docs: atualiza readme com setup do projeto"
git commit -m "fix: corrige validacao de senha no login"
```

## Contribuicao

Contribuicoes sao bem-vindas. Para manter consistencia no projeto:

1. Crie uma branch a partir da branch principal.
2. Faça alteracoes pequenas e objetivas.
3. Rode `npm run check` e `npm run check-types` antes de finalizar.
4. Descreva com clareza o que mudou e por que mudou.
5. Evite misturar refactor grande com nova feature no mesmo commit.

Fluxo sugerido:

```bash
git checkout -b feat/nova-funcionalidade
npm run check
npm run check-types
git commit -m "feat: descricao da alteracao"
```

## Qualidade e manutencao

Para validar lint e formatacao:

```bash
npm run check
```

Para validar a tipagem:

```bash
npm run check-types
```

## Documentacao da API

A documentacao interativa fica disponivel via Scalar, utilizando a especificacao OpenAPI gerada pelo Fastify:

- `http://localhost:3004/docs`

## Status

Projeto em evolucao, com base backend estruturada para expansao de autenticacao, sessao, recursos protegidos e novas entidades da plataforma.

## Licenca

Este projeto esta sob a licenca MIT.
