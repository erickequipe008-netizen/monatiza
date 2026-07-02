-- Posts diários automáticos para @erickboniz (voz de CEO/fundador) e @empreende (empreendedorismo).
-- Segue o mesmo padrão de 0016_monatiza_daily_post.sql (SECURITY DEFINER + pg_cron).
-- A mensagem do dia é escolhida pelo dia do ano (extract(doy)), garantindo rotação diária.

-- @erickboniz — opinião forte, estilo fundador (Elon Musk / Steve Jobs)
create or replace function public.post_daily_erickboniz()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid;
  v_msgs text[] := array[
    'Simplicidade é sofisticação. Se o seu produto precisa de manual, ele ainda não está pronto.',
    'Prefiro errar rápido a acertar tarde. Velocidade de aprendizado é a única vantagem que ninguém copia.',
    'Contrate por caráter e vontade de aprender. Competência a gente treina; atitude, não.',
    'A maioria superestima o que faz em um ano e subestima o que faz em dez. Pense grande e seja paciente.',
    'Não construa o que dá para vender. Construa o que as pessoas não conseguem mais viver sem.',
    'Reunião que poderia ser um e-mail é dinheiro queimado. Proteja o tempo do seu time.',
    'Foco não é fazer muita coisa bem. É escolher a coisa certa e ignorar o resto com coragem.',
    'O cliente não quer a sua tecnologia. Ele quer o problema dele resolvido. Nunca inverta isso.',
    'Trabalhe com quem te puxa para cima. O ambiente decide o teto do seu crescimento.',
    'Prefiro um time pequeno e obcecado a um exército desmotivado. Densidade de talento vence tamanho.',
    'Se você não está um pouco constrangido com a primeira versão, você lançou tarde demais.',
    'Dinheiro é combustível, não destino. Empresa sem propósito compra tempo, mas não compra lealdade.',
    'A execução vale mais que a ideia. Ideias são baratas; quem entrega muda o mundo.',
    'Delegue resultado, não tarefa. Contrate gente boa e depois saia do caminho.',
    'O melhor marketing é um produto que as pessoas fazem questão de recomendar.',
    'Persistência é subestimada. Quase toda vitória parece impossível até o dia anterior.',
    'Não terceirize o coração do seu negócio. O que te diferencia, você domina.',
    'Leio todos os dias. Quem para de aprender começa a ser substituído — inclusive por si mesmo.',
    'Padrão alto não é crueldade. É respeito por quem confia no que você entrega.',
    'Escale processo, não caos. Crescer multiplicando bagunça só antecipa o problema.',
    'Ouça o cliente insatisfeito. Ele é o consultor mais honesto e mais barato que você tem.',
    'A pressa mata a qualidade; a lentidão mata a empresa. O jogo é achar o ritmo certo.',
    'Coragem é decidir com 70% da informação. Esperar os 100% é chegar atrasado de propósito.',
    'Nunca compita por preço se você pode competir por valor. Barato todo mundo copia.',
    'Um bom líder repete a visão até cansar — e então repete de novo. Clareza é generosidade.',
    'Fracasso não é o oposto de sucesso. É parte do processo de quem tenta coisas difíceis.',
    'Cuide da cultura como se fosse o produto. No fim, é ela que constrói todo o resto.',
    'Prefiro perder uma venda a perder a confiança. Reputação é o ativo que não aparece no balanço.',
    'Não espere estar pronto. Comece, ajuste no caminho e deixe o mercado te ensinar.',
    'Grandes empresas nascem de obsessão por detalhe. O cliente sente o que você achou que ninguém notaria.'
  ];
  v_msg text;
begin
  select user_id into v_uid from public.community_profiles where handle = 'erickboniz' limit 1;
  if v_uid is null then return; end if;
  v_msg := v_msgs[(extract(doy from now())::int % array_length(v_msgs, 1)) + 1];
  insert into public.posts (user_id, content) values (v_uid, v_msg);
end;
$function$;

-- @empreende — frases de sucesso e empreendedorismo
create or replace function public.post_daily_empreende()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid;
  v_msgs text[] := array[
    'O sucesso é a soma de pequenos esforços repetidos todos os dias.',
    'Empreender é transformar um problema em oportunidade — e um não em aprendizado.',
    'Comece antes de se sentir pronto. A jornada ensina o que nenhum plano prevê.',
    'Quem tem um porquê forte encontra qualquer como. Encontre o seu propósito.',
    'O maior risco é não correr risco nenhum e assistir à vida passar.',
    'Disciplina é a ponte entre metas e conquistas. Construa a sua todos os dias.',
    'Cada cliente bem atendido é um vendedor voluntário da sua marca.',
    'Não desista nos primeiros obstáculos. É ali que a maioria abandona — e você não é a maioria.',
    'Invista em conhecimento: é a única coisa que multiplica quando você compartilha.',
    'Foco no essencial. Fazer bem poucas coisas vale mais que fazer mal muitas.',
    'O tempo é o seu recurso mais valioso. Gaste-o com o que realmente importa.',
    'Trabalhe com propósito e o dinheiro se torna consequência, não obsessão.',
    'A concorrência não é inimiga: é o lembrete diário de que você pode melhorar.',
    'Persistência vence o talento quando o talento desiste. Continue firme.',
    'Toda grande empresa já foi apenas uma ideia que alguém teve coragem de começar.',
    'Erros são aulas pagas. O importante é não repetir a mesma matrícula.',
    'Cerque-se de pessoas que sonham grande e agem maior ainda.',
    'O cliente lembra de como você o fez sentir muito mais do que do preço que pagou.',
    'Planeje com ambição, execute com paciência e ajuste com humildade.',
    'Sua atitude de hoje constrói a realidade de amanhã. Escolha bem.',
    'Empreendedor de verdade resolve dores reais, não corre atrás de modismo.',
    'A liberdade financeira começa com um hábito simples: gastar menos do que se ganha.',
    'Não espere a oportunidade perfeita. Crie oportunidades com o que você já tem em mãos.',
    'Reputação leva anos para se construir. Honre cada compromisso, por menor que pareça.',
    'Aprenda a ouvir o mercado. Ele sempre diz o que precisa — basta prestar atenção.',
    'Quem se adapta rápido sobrevive. Quem antecipa a mudança, lidera.',
    'Grandes resultados exigem decisões pequenas e corretas, tomadas todos os dias.',
    'Acredite no seu projeto mesmo quando ninguém mais acreditar. A convicção abre portas.',
    'Transforme conhecimento em ação. Ideia sem execução é apenas sonho adiado.',
    'O melhor momento para começar foi ontem. O segundo melhor é agora. Vá em frente!'
  ];
  v_msg text;
begin
  select user_id into v_uid from public.community_profiles where handle = 'empreende' limit 1;
  if v_uid is null then return; end if;
  v_msg := v_msgs[(extract(doy from now())::int % array_length(v_msgs, 1)) + 1];
  insert into public.posts (user_id, content) values (v_uid, v_msg);
end;
$function$;

-- Agenda diária (UTC). Horários escalonados: empreende 11h, monatiza 12h (0016), erickboniz 13h30.
select cron.schedule('empreende_daily_post', '0 11 * * *', 'select public.post_daily_empreende();');
select cron.schedule('erickboniz_daily_post', '30 13 * * *', 'select public.post_daily_erickboniz();');
