# Microsserviço de Candidatura — Projeto Integrador V

CRUD em **NestJS + Prisma (MySQL)** para o fluxo de candidaturas de um app de vagas de estágio:
candidatura → etapas de avaliação (triagem etc.) → avaliação com nota/feedback → atividades.

## Como rodar

```bash
npm install                      # também roda `prisma generate`
cp .env.example .env             # edite a DATABASE_URL
npx prisma generate              # as tabelas já existem no servidor (NÃO use db push/migrate)
npm run start:dev                # http://localhost:3000
```

## Swagger

Com o servidor rodando, abra http://localhost:3000/docs para testar os endpoints pelo navegador.

## Integração com os outros microsserviços

`vagaId` e `usuarioId` são apenas **números inteiros** (sem chave estrangeira), pois as tabelas
de Vagas e Usuários ficam em outros microsserviços. Este serviço não valida se esses ids existem.

## Endpoints

Todos os recursos têm `POST /`, `GET /`, `GET /:id`, `PATCH /:id` e `DELETE /:id`.

| Recurso | Rota base | Filtros (query string) |
|---|---|---|
| Etapas de avaliação | `/etapas-avaliacao` | `vagaId` |
| Candidaturas | `/candidaturas` | `vagaId`, `usuarioId`, `situacao` |
| Avaliações | `/avaliacoes` | `candidaturaId`, `etapaAvaliacaoId`, `situacao` |
| Atividades | `/atividades` | `avaliacaoId` |

Exemplos:

```bash
# Candidato se candidata à vaga 5
curl -X POST localhost:3000/candidaturas -H "Content-Type: application/json" \
  -d '{"usuarioId": 10, "vagaId": 5}'

# Recrutador vê os candidatos da vaga 5
curl "localhost:3000/candidaturas?vagaId=5"

# Recrutador aprova a avaliação e deixa feedback
curl -X PATCH localhost:3000/avaliacoes/1 -H "Content-Type: application/json" \
  -d '{"situacao": "Aprovado", "nota": 8, "feedback": "Bom desempenho na triagem.", "usuarioId": 2}'
```

## Autenticação

Todas as rotas (exceto o Swagger em `/docs`) exigem **um** dos dois:

- `Authorization: Bearer <JWT>` — token assinado com o mesmo `JWT_SECRET` do serviço que faz o login;
- `x-api-key: <API_KEY>` — para chamadas de outro microsserviço.

Sem nenhum dos dois: `401`. Variáveis necessárias (`.env` local; depois, Infisical): `DATABASE_URL`, `JWT_SECRET`, `API_KEY`.
Para gerar um token de teste: `npm run token:teste` (ou `npm run token:teste recrutador`).
No Swagger, clique em **Authorize** e cole o token (ou a API key).

## Fluxo (regras de negócio)

- **Candidato** cria a candidatura (`POST /candidaturas`, `usuarioId` = candidato) e já entra na
  **primeira etapa** da vaga: é criada uma avaliação `Pendente`. Acompanha em `GET /candidaturas?usuarioId=...`
  (candidatura → avaliações → etapa + atividades).
- **Recrutador** cadastra as etapas da vaga (`POST /etapas-avaliacao`). Cada vaga pode ter um número diferente
  de etapas. Se for a primeira etapa, quem já se candidatou entra nela.
- Recrutador vê tudo de uma vaga em `GET /etapas-avaliacao?vagaId=...` (etapa → avaliações de todos → candidatura + atividades).
- Recrutador avalia com `PATCH /avaliacoes/:id` (`usuarioId` = recrutador):
  - `Aprovado` → abre a avaliação da **próxima etapa**; se não houver, a candidatura fica `Aprovado`;
  - `Reprovado` → a candidatura fica `Reprovado`.
- A ordem das etapas é a ordem de criação (menor id primeiro), pois o banco não tem coluna de ordem.
- Este serviço não controla quem é candidato ou recrutador (autenticação/perfil fica nos outros serviços).

## Erros

- `400` dados inválidos (validação) ou referência inexistente (chave estrangeira)
- `404` registro não encontrado
- `409` registro duplicado (o mesmo candidato não pode se candidatar duas vezes à mesma vaga — checado no service)

## Observações sobre o banco

- As tabelas já existem no servidor e o usuário não tem permissão de `ALTER`; por isso o `schema.prisma`
  espelha o banco e **não** se usa `prisma db push` nem `prisma migrate`.
- Valores dos enums na API: candidatura `Em_Analise | Aprovado | Reprovado`;
  avaliação `Pendente | Em_Andamento | Aprovado | Reprovado`.
- Todos os ids (`*_id`) são AUTO_INCREMENT no banco, inclusive `avaliacao_id`.
