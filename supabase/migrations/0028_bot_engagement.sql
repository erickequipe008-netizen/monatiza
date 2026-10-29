-- ─────────────────────────────────────────────────────────────────
-- Engajamento de bootstrap da comunidade (100% no banco, via pg_cron).
--
-- Ativa a frota de contas-semente já existentes (e-mails
-- @comunidade.monatiza.com e @monatiza.fake) marcando-as com is_bot=true.
-- A cada ~10 min, run_bot_engagement() faz alguns bots curtirem e
-- comentarem publicações recentes (inclusive de usuários reais) e, às
-- vezes, publicarem algo novo. Volume modesto para parecer natural.
--
-- Seguro/aditivo: nenhuma conta real (@gmail.com) ou marca (@monatiza.com)
-- é marcada. Reversível: is_bot=false + cron.unschedule desligam tudo.
-- ─────────────────────────────────────────────────────────────────

alter table public.community_profiles
  add column if not exists is_bot boolean not null default false;

create index if not exists idx_community_profiles_is_bot
  on public.community_profiles (is_bot) where is_bot;

-- Marca a frota de seed (exclui contas reais e de marca por segurança).
update public.community_profiles p
set is_bot = true
from auth.users u
where u.id = p.user_id
  and (u.email like '%@comunidade.monatiza.com' or u.email like '%@monatiza.fake')
  and p.is_bot = false;

-- Motor de engajamento: curtidas + comentários + eventual post novo.
create or replace function public.run_bot_engagement()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_texts text[] := array[
    'Isso 👏','Concordo demais.','Salvei aqui pra reler.','Boa reflexão!',
    'Precisava ler isso hoje.','Certíssimo. 🙌','Grande verdade.','Vou aplicar essa semana.',
    'Simples e poderoso.','Assino embaixo.','Top demais 🔥','Que aula.',
    'Compartilhando com o time.','Perfeito, foco é tudo.','Isso muda o jogo.','Anotado! 📝',
    'Faz total sentido.','Exatamente o que penso.','Show, obrigado por compartilhar!','Real. Execução > perfeição.'
  ];
  post_texts text[] := array[
    'A execução vale mais que a ideia. Ideias são baratas; quem entrega muda o mundo.',
    'Disciplina é a ponte entre metas e conquistas. Construa a sua todos os dias.',
    'Foco não é fazer muita coisa. É escolher a coisa certa e ignorar o resto.',
    'Seu produto não precisa ser perfeito. Precisa resolver um problema real.',
    'A melhor hora de começar foi ontem. A segunda melhor é agora.',
    'Reunião que poderia ser um e-mail é dinheiro queimado. Proteja o tempo do time.',
    'Cliente bem atendido é vendedor voluntário da sua marca.',
    'Consistência supera intensidade. Um pouco todo dia vira muito no fim do ano.',
    'Preço é o que você cobra. Valor é o que o cliente sente que ganhou.',
    'Marketing sem produto bom é só barulho. Comece pelo que você entrega.',
    'Cash is king. Fluxo de caixa mata mais empresa boa do que falta de ideia.',
    'Pense grande, comece pequeno, aprenda rápido.',
    'Delegue resultado, não tarefa. Confiança escala; microgerência trava.',
    'Todo negócio é sobre pessoas. Resolva dor de gente e você tem mercado.',
    'Simplicidade é a maior sofisticação. Corte o que não serve ao cliente.',
    'Invista em você. É o único ativo que ninguém tira e que sempre rende.',
    'Feito é melhor que perfeito — mas melhorar sempre é obrigatório.',
    'Quem entende de dados decide melhor. Meça antes de opinar.',
    'A marca é o que falam de você quando você não está na sala.',
    'O maior risco é não correr risco nenhum e assistir a vida passar.'
  ];
  n_likes int := 4 + floor(random() * 5)::int;   -- 4..8
begin
  -- Nada a fazer sem bots ou sem posts recentes
  if not exists (select 1 from community_profiles where is_bot) then return; end if;
  if not exists (select 1 from posts where parent_id is null) then return; end if;

  -- CURTIDAS: bots aleatórios curtem posts recentes (não o próprio)
  with recent as (
    select id, user_id from posts where parent_id is null order by created_at desc limit 60
  ),
  picks as (
    select r.id as post_id, r.user_id as author,
           (select user_id from community_profiles where is_bot order by random() limit 1) as bot
    from (select id, user_id from recent order by random() limit n_likes) r
  )
  insert into post_likes (post_id, user_id, created_at)
  select post_id, bot, now() from picks where bot is not null and bot <> author
  on conflict (post_id, user_id) do nothing;

  -- COMENTÁRIOS: 1..3 bots respondem posts recentes
  with recent as (
    select id, user_id from posts where parent_id is null order by created_at desc limit 60
  )
  insert into posts (user_id, content, parent_id, created_at)
  select b.user_id,
         comment_texts[1 + floor(random() * array_length(comment_texts, 1))::int],
         r.id, now()
  from (select id, user_id from recent order by random() limit (1 + floor(random()*3)::int)) r
  cross join lateral (
    select user_id from community_profiles
    where is_bot and user_id <> r.user_id order by random() limit 1
  ) b;

  -- PUBLICAÇÃO NOVA: 35% de chance
  if random() < 0.35 then
    insert into posts (user_id, content, created_at)
    select user_id, post_texts[1 + floor(random() * array_length(post_texts, 1))::int], now()
    from community_profiles where is_bot order by random() limit 1;
  end if;
end;
$$;

revoke all on function public.run_bot_engagement() from anon, authenticated;

-- Agenda: a cada 10 minutos (evita duplicar se re-rodar a migração)
select cron.unschedule('bot-engagement') where exists (select 1 from cron.job where jobname = 'bot-engagement');
select cron.schedule('bot-engagement', '*/10 * * * *', 'select public.run_bot_engagement();');
