# React Base Project

Base opinativa para iniciar aplicações React com TypeScript, autenticação, estado de servidor, componentes acessíveis e uma esteira de qualidade pronta.

## Stack

- React 19, TypeScript 6, Vite 8 e React Router 8
- TanStack Query 5 para estado assíncrono
- Axios com clientes separados por responsabilidade
- Zod 4 e React Hook Form
- Tailwind CSS 4 e shadcn (`base-vega`, sobre Base UI)
- Vitest, Testing Library, MSW e Playwright
- ESLint 10, Prettier e CI no GitHub Actions

Os componentes do shadcn ficam no próprio repositório em `src/components/ui`. Isso permite adaptar o design sem ficar preso a uma dependência de componentes fechada.

## Pré-requisitos

- Node.js 24.13.1 (a versão está registrada em `.node-version`)
- pnpm 12.4.1 via Corepack

## Início rápido

```bash
corepack enable
cp .env.example .env
pnpm install
pnpm dev
```

Variáveis disponíveis:

| Variável                  | Finalidade                                                      |
| ------------------------- | --------------------------------------------------------------- |
| `VITE_API_URL`            | API da aplicação, incluindo login, refresh e rotas autenticadas |
| `VITE_EXAMPLE_API_URL`    | API pública usada apenas pelo exemplo de repositório            |
| `VITE_TIBIA_WIKI_API_URL` | Caminho do proxy usado pelo exemplo de criaturas do TibiaWiki   |
| `VITE_AUTH_LOGIN_PATH`    | Caminho de login na API da aplicação                            |
| `VITE_AUTH_REFRESH_PATH`  | Caminho para renovar a sessão                                   |

A configuração é validada no início da aplicação por `src/settings.ts`; valores inválidos falham cedo com uma mensagem legível.

O TibiaWiki não permite chamadas cross-origin diretas do navegador. No desenvolvimento, o Vite encaminha `/tibiawiki-api` para `https://tibiawiki.dev`. Em produção, configure o servidor ou a plataforma de hospedagem para fazer o mesmo encaminhamento.

## Scripts

```bash
pnpm dev             # servidor local
pnpm build           # typecheck e build de produção
pnpm lint            # ESLint sem aceitar warnings
pnpm format          # aplica Prettier
pnpm test            # testes unitários e de integração
pnpm test:coverage   # cobertura Vitest
pnpm e2e             # testes no Chromium com Playwright
pnpm check           # todos os quality gates, exceto E2E
```

No Linux, instale o navegador do E2E com `pnpm exec playwright install chromium`. No macOS, a configuração usa o Google Chrome instalado no sistema.

## Organização

```text
src/
├── Pages/                 páginas e composição de rotas
├── Router/                definição das rotas e proteção de acesso
├── components/ui/         componentes shadcn pertencentes ao projeto
├── features/
│   ├── auth/              sessão, login e armazenamento de tokens
│   ├── creatures/         exemplo de lista e detalhe com queries dependentes
│   └── repositories/      exemplo de API, queries e mutations por domínio
├── lib/                   infraestrutura compartilhada
├── services/              clientes HTTP
└── test/                  configuração comum de testes e MSW
```

Cada feature mantém seu contrato HTTP em `api/`, suas leituras em `queries/` e alterações em `mutations/`. Consulte [a documentação de arquitetura](docs/architecture.md) para as decisões e os fluxos completos.

## Contrato de autenticação

O exemplo espera respostas de login e refresh com o formato:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

`refresh_token` pode ser omitido na renovação; nesse caso, o token de refresh anterior é preservado. A API autenticada:

1. verifica o `exp` de JWTs antes da requisição, com margem de 30 segundos;
2. usa a resposta `401` como fonte de verdade para tokens opacos;
3. compartilha uma única Promise de refresh entre requisições concorrentes;
4. repete cada requisição no máximo uma vez;
5. limpa a sessão e avisa a aplicação uma única vez se a renovação falhar.

O armazenamento em `localStorage` é um adaptador apropriado para uma base puramente SPA, mas tokens acessíveis por JavaScript aumentam o impacto de XSS. Para aplicações com maior exigência de segurança, prefira um BFF e cookies `HttpOnly`, `Secure` e `SameSite`, substituindo o adaptador em `auth-token-storage.ts`.

## Atualizações

O Dependabot abre atualizações semanais para pnpm e GitHub Actions. Atualizações maiores devem passar por `pnpm check` e `pnpm e2e`; não faça upgrade cego de todos os pacotes em projetos derivados.
