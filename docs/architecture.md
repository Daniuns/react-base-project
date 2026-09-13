# Arquitetura e decisões

## Clientes HTTP

Há quatro clientes para impedir o acoplamento acidental de políticas diferentes:

| Cliente        | Uso                                          | Autenticação                |
| -------------- | -------------------------------------------- | --------------------------- |
| `noAuthApi`    | login e endpoints públicos do backend        | não                         |
| `api`          | endpoints privados do backend                | Bearer + refresh automático |
| `exampleApi`   | demonstração pública do GitHub               | não                         |
| `tibiaWikiApi` | demonstração de lista e detalhe de criaturas | não                         |

Use `api` somente para rotas que exigem sessão. Seu interceptor de request precisa obter um access token antes de enviar qualquer chamada.

Como o TibiaWiki não libera CORS, `tibiaWikiApi` usa o caminho local `/tibiawiki-api`. O Vite o encaminha durante o desenvolvimento; o ambiente de produção deve oferecer uma regra equivalente no servidor ou na plataforma de hospedagem.

## Fluxo de refresh concorrente

```text
requests autenticadas ──► ensureAccessToken()
                              │
                    token válido? ── sim ──► enviar
                              │ não
                              ▼
                    refreshPromise existente?
                       │ sim          │ não
                       ▼              ▼
                    aguardar      criar refresh único
                       └──────┬───────┘
                              ▼
                    salvar tokens e liberar requests
                              │
                         falhou?
                              ▼
                   limpar sessão e redirecionar
```

Uma resposta `401` também inicia esse fluxo. A configuração `_retry` evita loops e a comparação do token enviado com o token atual impede que respostas `401` simultâneas disparem renovações sucessivas.

## Estado do servidor

- Arquivos `*.queries.ts` definem chaves, `queryOptions` reutilizáveis e hooks de leitura.
- Arquivos em `mutations/` contêm alterações e sincronizam o cache.
- A camada `api/` é React-agnostic: chama HTTP, valida e normaliza respostas com Zod.
- Componentes consomem hooks e cuidam apenas de renderização e interação.

Separar queries de mutations evita hooks “Deus”, melhora testes e permite reutilizar opções em prefetch, loaders ou SSR. Agrupe por feature, não pelo verbo HTTP globalmente: uma mudança de domínio continua próxima da leitura que ela invalida.

## Rotas e sessão

As páginas são carregadas com `lazy`. `ProtectedRoute` aguarda a restauração inicial da sessão e preserva a localização desejada antes de redirecionar para o login. `AuthProvider` é responsável pelo estado da sessão e limpa o cache do TanStack Query ao sair ou ao expirar.

## Erros e validação

- Variáveis de ambiente e payloads externos são validados com Zod.
- Erros inesperados de renderização chegam ao `AppErrorBoundary`.
- Estados de carregamento, erro e ausência de dados ficam explícitos nas páginas.
- AbortSignal do TanStack Query é encaminhado ao Axios para cancelar leituras obsoletas.

## Testes

- Vitest + Testing Library: hooks, componentes e integração leve.
- MSW: respostas HTTP determinísticas sem mockar internals do Axios.
- Testes de autenticação cobrem expiração antecipada, refresh concorrente, rotação, falha, logout e limite de retry.
- Playwright: smoke tests da rota protegida e do fluxo de seleção de criaturas.

O workflow em `.github/workflows/ci.yml` executa instalação reproduzível, quality gates e E2E em cada push e pull request.
