# SIGEI - Sistema de Gerenciamento Interno Escolar

Plataforma web full-stack para gerenciamento pedagogico e escolar, permitindo o cadastro de instituicoes de ensino, coordenadores e professores, o controle de carga horaria docente e a montagem de grades semanais por turma com deteccao automatica de conflitos de horario.

---

## Arquitetura e Tecnologias

### Backend (`backend/`)
- **.NET 10 / ASP.NET Core** com **Clean Architecture** em 4 camadas (`Domain`, `Application`, `Infrastructure`, `WebApi`) + projeto de testes (`UnitTests`)
- **CQRS** com **MediatR** e validacao via **FluentValidation** (`ValidationBehavior`)
- **Entity Framework Core** + **SQLite** com mapeamento Fluent API (`IEntityTypeConfiguration<T>`) e queries `AsNoTracking()`
- Tratamento global de erros via `IExceptionHandler` retornando RFC 7807 `ProblemDetails`
- **Testes:** `xUnit` + `Moq`

### Frontend (`src/`)
- **React 18** + **TypeScript** (strict mode)
- **MUI v7** (`@mui/material`) com tema customizado e acessibilidade (contraste >= 4.5:1, foco visivel, alvos de toque >= 44px, `prefers-reduced-motion`)
- **TanStack Query v5** (`useSuspenseQuery` + `useMutation`) com `React.lazy` e `<SuspenseLoader>`
- **React Hook Form** + **Zod** para validacao de formularios e notificacoes via `useMuiSnackbar`

### Seguranca
- Autenticacao baseada em **JWT** emitido exclusivamente em cookie `HttpOnly; SameSite=Strict`
- Autorizacao por perfil (`[Authorize(Roles = "Coordenador")]`) e isolamento multi-tenant por `escolaId`
- **Rate Limiting** (`FixedWindowLimiter`: 5 tentativas/minuto por IP) no endpoint de login
- Segredos gerenciados via `dotnet user-secrets` (desenvolvimento) ou variaveis de ambiente (producao)
- Cabecalhos de seguranca HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) e `Dockerfile` multi-stage executando como usuario non-root

---

## Estrutura do Projeto

```text
SIGEI---Sistema-de-Gerenciamento/
├── backend/
│   ├── Sigei.sln
│   ├── Dockerfile
│   ├── src/
│   │   ├── Sigei.Domain/           # Entidades, enums, excecoes e interfaces de repositorio
│   │   ├── Sigei.Application/      # Casos de uso CQRS (MediatR), DTOs e FluentValidation
│   │   ├── Sigei.Infrastructure/   # EF Core DbContext, repositorios, seguranca e DataSeeder
│   │   └── Sigei.WebApi/           # Controllers, Program.cs, GlobalExceptionHandler
│   └── tests/
│       └── Sigei.UnitTests/        # Testes unitarios (xUnit + Moq)
├── public/                         # HTML base e icone
├── src/
│   ├── components/                 # AppHeader, SuspenseLoader, SnackbarProvider
│   ├── features/                   # Servicos de API e componentes por dominio
│   ├── lib/                        # apiClient (fetch com credentials) e queryClient
│   ├── pages/                      # Paginas lazy-loaded (Landing, Login, Cadastros, Turmas, Professores)
│   ├── theme/                      # Tema MUI v7
│   └── types/                      # Contratos TypeScript
└── package.json
```

---

## Pre-requisitos

- **.NET SDK 10.0+**
- **Node.js 20+** e **npm**

---

## Como Executar Localmente

### 1. Configurar segredo JWT de desenvolvimento e subir o Backend

```bash
cd backend/src/Sigei.WebApi
dotnet user-secrets init
dotnet user-secrets set "Jwt:SecretKey" "CHAVE_SECRETA_LOCAL_COM_NO_MINIMO_32_CARACTERES"

cd ../..
dotnet run --project src/Sigei.WebApi
```

A API sera iniciada em `http://localhost:5000` (Swagger disponivel em `http://localhost:5000/swagger` no ambiente `Development`).

### 2. Instalar dependencias e subir o Frontend

Em outro terminal, na raiz do repositorio:

```bash
npm install --legacy-peer-deps
npm start
```

O frontend ficara disponivel em `http://localhost:3000`.

### 3. Dados de Demonstracao (Ambiente `Development`)

Ao iniciar a API em modo `Development`, o `DataSeeder` popula automaticamente uma escola modelo, turmas, grades e usuarios para testes:

- **E-mail do Coordenador:** `coord@sigei.com`
- **Senha padrao:** `Sigei@123`
- **Codigo de verificacao da escola (para novos cadastros):** `SIGEI-2026`

---

## Testes e Build

### Backend
```bash
cd backend
dotnet test
dotnet list package --vulnerable --include-transitive
```

### Frontend
```bash
npx tsc --noEmit
npm run build
```

### Docker (Backend)
```bash
cd backend
docker build -t sigei-api .
docker run -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=Production -e Jwt__SecretKey="SUA_CHAVE_SEGURA_MIN_32_CHARS" sigei-api
```
