-- Conta oficial @monatiza publica um post por dia, automaticamente (pg_cron).
create extension if not exists pg_cron;

create or replace function public.post_daily_monatiza()
returns void
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_uid uuid;
  v_msgs text[] := array[
    'Bom dia! Por aqui a regra é simples: informação de qualidade gera decisão melhor. 📈',
    'A notícia que move o mercado você lê primeiro aqui na Monatiza.',
    'Dica do dia: reserve 15 minutos para ler sobre economia. Seu bolso agradece.',
    'Negócio que cresce é negócio que se informa. O que você quer entender melhor hoje?',
    'IA não vai te substituir — quem usa IA, sim. Está acompanhando as novidades?',
    'Mercado em alta ou em baixa, o que importa é ter estratégia. 💡',
    'Empreender é resolver o problema dos outros e ser pago por isso. Qual problema você resolve?',
    'Lembrete: diversificar é proteger o futuro. Não coloque tudo numa cesta só.',
    'O Brasil tem oportunidade em cada esquina para quem enxerga dados. Vamos juntos.',
    'Conhecimento é o único investimento que ninguém tira de você.',
    'Hoje é um ótimo dia para começar aquela ideia parada. Dá o primeiro passo. 🚀',
    'Quer mais alcance na comunidade? Comece publicando o que você sabe. 🙌',
    'Economia explicada sem complicação — é isso que a gente entrega todo dia.',
    'Notícia boa é a que te faz pensar, não só reagir. Pensou hoje?',
    'Startups brasileiras estão chamando atenção lá fora. Está de olho?',
    'Sua carreira agradece: aprenda uma coisa nova por dia.',
    'Tecnologia muda rápido. Quem lê, acompanha. Quem acompanha, decide melhor.',
    'Saúde financeira começa com um passo: saber para onde vai o seu dinheiro.',
    'A melhor hora de investir em você foi ontem. A segunda melhor é agora.',
    'Comunidade Monatiza: espaço para debater ideias com gente que pensa grande. Participe!',
    'O mercado de trabalho premia quem se adapta. Bora se atualizar?',
    'Pequenos hábitos, grandes resultados. Vale para dinheiro, carreira e vida.',
    'Cada reportagem nossa nasce de uma pergunta. Qual é a sua pergunta hoje?',
    'Inovação não é sorte, é repetição com propósito. Continue.',
    'Fim de semana é para descansar e ler o que importa. Estamos aqui.',
    'Quem entende o cenário, antecipa o movimento. Informe-se.',
    'O futuro pertence a quem se prepara hoje. Bora construir?',
    'Obrigado por fazer parte da comunidade Monatiza. Juntos a gente vai mais longe. 💜'
  ];
  v_msg text;
begin
  select user_id into v_uid from public.community_profiles where handle = 'monatiza' limit 1;
  if v_uid is null then return; end if;
  v_msg := v_msgs[(extract(doy from now())::int % array_length(v_msgs, 1)) + 1];
  insert into public.posts (user_id, content) values (v_uid, v_msg);
end;
$func$;

-- Todo dia às 12:00 UTC (09:00 BRT).
select cron.schedule('monatiza_daily_post', '0 12 * * *', 'select public.post_daily_monatiza();');
