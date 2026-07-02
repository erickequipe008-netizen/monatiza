-- Stories de texto (sem mídia): frase + fundo em gradiente.
alter table public.stories alter column media_url drop not null;
alter table public.stories add column if not exists text_content text;
alter table public.stories add column if not exists bg text;
