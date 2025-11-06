# MovieMagic Online

Aplicação web moderna inspirada nas funcionalidades do MovieMagic Scheduling, construída com Next.js 14, React, TypeScript e Supabase. A plataforma oferece landing page pública, autenticação, dashboard, editor de cronogramas com salvamento automático e recursos de compartilhamento via link ou convites por email.

## Recursos principais

- **Landing page responsiva** com destaque das funcionalidades e visual futurista.
- **Autenticação Supabase** com login por email/senha, link mágico e criação de conta.
- **Dashboard protegido** exibindo projetos recentes, criação rápida e status de compartilhamento.
- **Editor de cronogramas** com autosave, gerenciamento de cenas, marcos e departamentos com status.
- **Compartilhamento seguro** por link com permissões ou convites com expiração automática.
- **Visualização pública** de projetos compartilhados em modo somente leitura.

## Requisitos

- Node.js 18+.
- Conta Supabase com projeto configurado.
- (Opcional) Conta Vercel para deploy.

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente em `.env.local` (e na Vercel). Você pode usar o arquivo `.env.example`
   como base – ele já contém a URL, a chave pública e a service role key do Supabase fornecidas:

   ```bash
   cp .env.example .env.local
   ```

3. Crie as tabelas no Supabase (SQL simplificado):

   ```sql
   create table projects (
     id uuid primary key default uuid_generate_v4(),
     owner_id uuid references auth.users not null,
     title text default 'Novo projeto',
     description text,
     schedule jsonb default '{"scenes":[],"milestones":[],"departments":[]}',
     share_token text,
     share_role text check (share_role in ('viewer','editor')),
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   create table project_collaborators (
     id uuid primary key default uuid_generate_v4(),
     project_id uuid references projects on delete cascade,
     user_id uuid references auth.users,
     role text check (role in ('viewer','editor')) default 'viewer',
     created_at timestamptz default now()
   );

   create table project_invites (
     id uuid primary key default uuid_generate_v4(),
     project_id uuid references projects on delete cascade,
     email text not null,
     role text check (role in ('viewer','editor')) default 'viewer',
     token text not null,
     expires_at timestamptz not null,
     accepted_at timestamptz,
     created_at timestamptz default now()
   );

   create trigger set_timestamp
     before update on projects
     for each row
     execute procedure trigger_set_timestamp();
   ```

4. Configure políticas RLS conforme necessário (ex.: proprietários podem atualizar, colaboradores com papel `editor` podem editar, link público somente leitura, etc.).

## Scripts disponíveis

- `npm run dev` – executa o servidor de desenvolvimento.
- `npm run build` – gera a build de produção.
- `npm run start` – inicia a aplicação em modo produção.
- `npm run lint` – executa a verificação de lint.

## Fluxo de compartilhamento

- Proprietários podem ativar um link público com permissões de visualização ou edição.
- Convites por email são registrados em `project_invites` com token e expiração de 7 dias (integre com Supabase Functions ou serviço externo para disparar o email real).
- A rota pública `/share/[token]` exibe o cronograma em modo somente leitura.

## Deploy na Vercel

1. Faça push do projeto para um repositório Git.
2. No painel da Vercel, importe o repositório e configure os comandos padrão (`npm install`, `npm run build`, `npm run start`).
3. Defina as variáveis de ambiente listadas acima.
4. Opcional: configure domínio customizado e preview branchs.

## Próximos passos sugeridos

- Implementar notificações de email reais para convites.
- Criar visualizações adicionais (ex.: calendário, relatório de orçamento).
- Adicionar testes end-to-end (Playwright) para garantir fluxo principal.
