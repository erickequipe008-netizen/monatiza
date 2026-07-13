-- Corrige o engajamento dos bots: eles estavam publicando o MESMO texto
-- repetidas vezes (ex.: uma frase apareceu 53x), o que denunciava automação.
-- 1) Limpa os posts de bot duplicados (mantém o mais recente de cada conteúdo);
--    likes e respostas caem por CASCADE.
-- 2) Reescreve run_bot_engagement() com repertório maior e regra que NUNCA
--    repete um texto já presente (nos 30 últimos posts de bot / no mesmo post).

delete from posts p
using (
  select pp.id, row_number() over (partition by pp.content order by pp.created_at desc) as rn
  from posts pp
  join community_profiles c on c.user_id = pp.user_id
  where c.is_bot and pp.parent_id is null
) d
where p.id = d.id and d.rn > 1;

create or replace function public.run_bot_engagement()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  comment_texts text[] := array[
    'Isso 👏','Concordo demais.','Salvei pra reler.','Boa reflexão!','Precisava ler isso hoje.',
    'Certíssimo. 🙌','Grande verdade.','Vou aplicar essa semana.','Simples e poderoso.','Assino embaixo.',
    'Top demais 🔥','Que aula.','Compartilhando com o time.','Foco é tudo mesmo.','Isso muda o jogo.',
    'Anotado! 📝','Faz total sentido.','Exatamente o que penso.','Obrigado por compartilhar!','Execução > perfeição, sempre.',
    'Verdade que dói, mas é real.','Já vivi isso na prática.','Melhor coisa que li hoje.','Vou levar pro meu negócio.',
    'Direto ao ponto, curti.','Papo reto.','Nunca tinha pensado assim.','Bora colocar em prática!',
    'Precisa ser dito mais vezes.','Guardando essa. 💡','Perfeito pra segunda de manhã.','Real demais.',
    'Tá explicado por que muitos travam.','Simplesmente isso.','Mais gente precisa entender isso.'
  ];
  post_texts text[] := array[
    'A execução vale mais que a ideia. Ideias são baratas; quem entrega muda o mundo.',
    'Disciplina é a ponte entre metas e conquistas. Construa a sua todos os dias.',
    'Foco não é fazer muita coisa. É escolher a coisa certa e ignorar o resto.',
    'Seu produto não precisa ser perfeito. Precisa resolver um problema real.',
    'A melhor hora de começar foi ontem. A segunda melhor é agora.',
    'Reunião que poderia ser um e-mail é dinheiro queimado. Proteja o tempo do time.',
    'Cliente bem atendido vira vendedor voluntário da sua marca.',
    'Consistência supera intensidade. Um pouco todo dia vira muito no fim do ano.',
    'Preço é o que você cobra. Valor é o que o cliente sente que ganhou.',
    'Marketing sem produto bom é só barulho. Comece pelo que você entrega.',
    'Fluxo de caixa mata mais empresa boa do que falta de ideia.',
    'Pense grande, comece pequeno, aprenda rápido.',
    'Delegue resultado, não tarefa. Confiança escala; microgerência trava.',
    'Todo negócio é sobre pessoas. Resolva dor de gente e você tem mercado.',
    'Simplicidade é a maior sofisticação. Corte o que não serve ao cliente.',
    'Invista em você. É o único ativo que ninguém tira e que sempre rende.',
    'Feito é melhor que perfeito — mas melhorar sempre é obrigatório.',
    'Quem entende de dados decide melhor. Meça antes de opinar.',
    'A marca é o que falam de você quando você não está na sala.',
    'O maior risco é não correr risco nenhum e assistir a vida passar.',
    'Antes de escalar, valide. Crescer sobre um problema errado só acelera o prejuízo.',
    'Contrate com calma, alinhe expectativas cedo e todo mundo ganha tempo.',
    'O que não se mede não se melhora — mas fuja das métricas de vaidade.',
    'Networking de verdade é gerar valor antes de precisar pedir.',
    'As pessoas não compram o furo; compram a parede pronta. Venda o resultado.',
    'Caixa no banco compra tempo, e tempo é a matéria-prima de toda virada.',
    'Diga não com elegância. Cada sim mal pensado rouba o seu foco.',
    'Reputação leva anos pra construir e um deslize pra arranhar. Cuide dela.',
    'Automatize o repetitivo pra sobrar cabeça no que realmente importa.',
    'O cliente não quer a sua tecnologia; quer o problema dele resolvido.',
    'Curiosidade é vantagem competitiva. Quem para de aprender, para de crescer.',
    'Margem é oxigênio. Fature com propósito, mas lucre com disciplina.',
    'Peça feedback e engula o orgulho. Crítica bem-vinda é atalho pra evoluir.',
    'Time bom não é o mais barato; é o que entrega e some com o seu problema.',
    'Comece antes de se sentir pronto. Prontidão vem da prática, não da espera.',
    'Uma boa pergunta vale mais que dez respostas prontas.',
    'Não compita em preço; compita em valor percebido.',
    'Processo liberta. Quem depende de herói vive apagando incêndio.',
    'Toda crise reorganiza o mercado. Prepare-se pra sair mais forte dela.',
    'Escreva bem. Clareza no texto é clareza no pensamento — e isso vende.',
    'Crescimento sustentável é chato e previsível. E é justamente isso que o faz durar.',
    'Aposte em relacionamento, não em transação. Recompra é onde mora o lucro.',
    'Coragem não é ausência de medo; é agir apesar dele.',
    'Corte reuniões, não pessoas. Muitas vezes o gargalo é o processo.',
    'Cliente reclamando é oportunidade. O silêncio é que deveria assustar.',
    'Sua energia é finita. Gaste onde há impacto e delegue o resto.',
    'Não persiga likes; persiga clientes que voltam e indicam.',
    'Melhor um passo hoje do que o plano perfeito no mês que vem.',
    'Construa algo que as pessoas sintam falta se sumir. Aí você tem um negócio.',
    'Talento abre portas; caráter mantém elas abertas.'
  ];
  n_likes int := 4 + floor(random() * 5)::int;
begin
  if not exists (select 1 from community_profiles where is_bot) then return; end if;
  if not exists (select 1 from posts where parent_id is null) then return; end if;

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

  -- Comentários: texto que ainda não existe naquele post
  with recent as (
    select id, user_id from posts where parent_id is null order by created_at desc limit 60
  )
  insert into posts (user_id, content, parent_id, created_at)
  select b.user_id, ct.txt, r.id, now()
  from (select id, user_id from recent order by random() limit (1 + floor(random()*3)::int)) r
  cross join lateral (
    select user_id from community_profiles
    where is_bot and user_id <> r.user_id order by random() limit 1
  ) b
  cross join lateral (
    select txt from unnest(comment_texts) as txt
    where txt not in (select content from posts where parent_id = r.id)
    order by random() limit 1
  ) ct;

  -- Novo post: texto que NÃO esteja entre os 30 últimos posts de bot
  if random() < 0.45 then
    insert into posts (user_id, content, created_at)
    select b.user_id, t.txt, now()
    from (select user_id from community_profiles where is_bot order by random() limit 1) b
    cross join lateral (
      select txt from unnest(post_texts) as txt
      where txt not in (
        select p2.content from posts p2
        join community_profiles c2 on c2.user_id = p2.user_id
        where c2.is_bot and p2.parent_id is null
        order by p2.created_at desc
        limit 30
      )
      order by random()
      limit 1
    ) t;
  end if;
end;
$function$;
