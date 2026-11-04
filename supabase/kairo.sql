-- =====================================================================
--  Le parcours Kairo : la page de chaque jour et les prompts de secours
--  À coller dans Supabase → SQL Editor → New query → Run. Rejouable.
--
--  Les textes vivent en base, jamais dans le code : le site est public,
--  et un jour à venir ne doit pas pouvoir se lire avant son ouverture.
-- =====================================================================

-- Les blocs d'un jour, dans l'ordre d'affichage.
alter table public.workshop_jours
  add column if not exists page jsonb;

-- Le bandeau « Comment ça marche » et la page du jour 0.
alter table public.workshop_reglages
  add column if not exists parcours jsonb;

-- La page « Si ça ne marche pas ».
create table if not exists public.workshop_secours (
  cle         text primary key,
  position    int  not null default 0,
  titre       text not null,
  intro       text,
  prompt      text not null,
  updated_at  timestamptz not null default now()
);

alter table public.workshop_secours enable row level security;

drop policy if exists "connecte lit le secours" on public.workshop_secours;
create policy "connecte lit le secours" on public.workshop_secours
  for select to authenticated using (auth.uid() is not null);

drop policy if exists "admin gere le secours" on public.workshop_secours;
create policy "admin gere le secours" on public.workshop_secours
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select, insert, update, delete on public.workshop_secours to authenticated;

-- La page d'un jour suit la même règle que ses prompts : rien n'est
-- renvoyé avant l'ouverture du jour.
drop function if exists public.mon_workshop();

create function public.mon_workshop()
returns table (
  jour            int,
  titre           text,
  resume          text,
  video_url       text,
  prompt          text,
  prompt_2        text,
  prompt_2_titre  text,
  consignes       text,
  ouvert          boolean,
  ouvre_le        timestamptz,
  capture_faite   boolean,
  etapes          jsonb,
  page            jsonb
)
language sql stable security definer set search_path = public
as $$
  with e as (
    select public.workshop_jour(auth.uid())    as jour_max,
           public.fuseau_membre(auth.uid())    as tz,
           public.workshop_depart(auth.uid())  as debut,
           (select workshop_dispense from members where id = auth.uid()) as dispense
  )
  select j.jour,
         j.titre,
         j.resume,
         case when j.jour <= e.jour_max then j.video_url      end,
         case when j.jour <= e.jour_max then j.prompt         end,
         case when j.jour <= e.jour_max then j.prompt_2       end,
         case when j.jour <= e.jour_max then j.prompt_2_titre end,
         case when j.jour <= e.jour_max then j.consignes      end,
         j.jour <= e.jour_max,
         case
           when j.jour <= e.jour_max or e.dispense or e.debut is null then null
           else ((((e.debut at time zone e.tz)::date + j.jour)::timestamp) at time zone e.tz)
         end,
         exists (select 1 from workshop_captures c
                  where c.member_id = auth.uid() and c.jour = j.jour),
         case when j.jour <= e.jour_max then j.etapes end,
         case when j.jour <= e.jour_max then j.page   end
  from workshop_jours j, e
  order by j.jour;
$$;

revoke all on function public.mon_workshop() from public, anon;
grant execute on function public.mon_workshop() to authenticated;

-- Vérification : la colonne et la table sont là.
select (select count(*) from public.workshop_jours)    as jours,
       (select count(*) from public.workshop_secours)  as prompts_secours;
