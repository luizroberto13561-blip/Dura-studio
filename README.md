# DURA GAMES

Plataforma estática de catálogo de jogos, pronta para publicar no GitHub Pages.

## O que funciona na versão local
- Catálogo, busca e status dos jogos.
- Cadastro e login com senha derivada por PBKDF2 (não guarda a senha em texto puro).
- Mostrar/ocultar senha.
- Painel de administração local, com adicionar/editar/excluir jogos.
- Contagem de cliques por jogo neste navegador.
- Chave PIX configurável e botão de cópia.
- Espaço reservado para anúncios.

## Limitações importantes
Esta primeira versão usa `localStorage`. Cada navegador/dispositivo tem seus próprios usuários, jogos, chave PIX e contagens. Os dados podem ser apagados pelo usuário ao limpar os dados do navegador.
- **Não é um sistema de contas compartilhadas.**
- **A proteção de administrador não é segura para produção.** O projeto é estático; alguém com conhecimento técnico pode alterar dados locais ou o JavaScript. Não use para dados sensíveis.
- A contagem de acessos é local ao navegador, não representa acessos globais.
- Visitantes online reais não são calculados; a tela mostra `—`, sem inventar estatísticas.
- PIX aqui é apenas uma chave para contribuição voluntária; não processa pagamentos.
- Anúncios são apenas um espaço visual. Exibição de anúncios depende de uma rede externa e aprovação/conta nessa rede.

## Publicar gratuitamente no GitHub Pages (celular)
1. Entre em https://github.com e crie um repositório público chamado `dura-games`.
2. Envie os arquivos desta pasta para a raiz do repositório: `index.html`, `style.css`, `config.js`, `app.js` e `README.md`.
3. No repositório, abra **Settings** → **Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Em **Branch**, selecione `main` e a pasta `/ (root)`, depois toque em **Save**.
6. Aguarde a publicação. O endereço será `https://SEU-USUARIO.github.io/dura-games/`.

## Configurar PIX
Entre no painel Admin, preencha a chave PIX e salve. No modo local, ela fica salva somente no navegador onde foi configurada. Para um site público, configure a chave no `config.js` (campo `pixKey`) antes de publicar ou migre as configurações para um backend.

## Primeiro administrador no modo local
A primeira conta cadastrada naquele navegador recebe o perfil de administrador automaticamente. Isso é apenas uma conveniência para testar a versão local: qualquer pessoa usando aquele mesmo navegador antes de você poderia criar a primeira conta. Não use esse mecanismo como proteção real em um site público. Em produção, a função administrativa deve ser validada no servidor.

## Supabase (opcional, para versão compartilhada)
O projeto entregue está configurado em `mode: "local"`. Para transformar em plataforma multiusuário, será necessário implementar integração com Supabase Auth e tabelas protegidas por Row Level Security (RLS). O Supabase possui plano Free, sujeito aos limites e termos atuais; consulte https://supabase.com/pricing. Não é necessário adicionar cartão para usar a versão local ou publicar no GitHub Pages.

Estrutura SQL inicial sugerida (execute no SQL Editor do seu projeto Supabase):
```sql
create table public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  link text not null,
  description text,
  status text not null check (status in ('Disponível','Desenvolvendo','Manutenção')),
  clicks bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

-- Leitura pública do catálogo:
create policy "Anyone can read games"
on public.games for select
to anon, authenticated
using (true);

-- Não crie política pública de INSERT/UPDATE/DELETE.
-- Para administração, crie uma tabela de perfis e políticas RLS que
-- validem o UUID do usuário administrador no servidor.
```
**Atenção:** o SQL acima cria somente a tabela e leitura pública. Não ativa sozinho cadastro, login, contagem global, presença online ou administração. Essas funções precisam da integração JavaScript com Auth, políticas RLS e funções transacionais seguras. Nunca coloque `service_role` no frontend. Use somente a chave `anon`/publishable no navegador e proteja todas as operações com RLS.

## Gratuito não significa ilimitado
GitHub Pages e Supabase Free têm limites, regras e podem mudar os termos. Verifique os planos antes de lançar publicamente.
