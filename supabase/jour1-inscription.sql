-- =====================================================================
--  Le jour 1 s'ouvre dès l'inscription, puis un jour à chaque minuit
--  À coller dans Supabase → SQL Editor → New query → Run. Rejouable.
--
--  Inscrit lundi : jour 1 lundi, jour 2 mardi, jour 3 mercredi… Le jour 3
--  ouvre toujours les vidéos de l'offre, donc un jour plus tôt qu'avant.
--  Le passage reste à minuit, à l'heure de l'élève.
-- =====================================================================

create or replace function public.workshop_jour(p_member uuid)
returns int
language sql stable security definer set search_path = public
as $$
  select case
    when p_member is null then 0
    when is_equipe(p_member) then 7
    when exists (select 1 from members where id = p_member and workshop_dispense) then 7
    else coalesce(
      (
        select least(
          7,
          greatest(
            0,
            ( (now() at time zone public.fuseau_membre(p_member))::date
            - (public.workshop_depart(p_member) at time zone public.fuseau_membre(p_member))::date )::int
          ) + 1
        )
        from members m
        where m.id = p_member
      ),
      0
    )
  end;
$$;

-- Les dates annoncées à l'élève suivent : le jour N s'ouvre N - 1 nuits
-- après l'inscription.
create or replace function public.mon_workshop()
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
           else ((((e.debut at time zone e.tz)::date + j.jour - 1)::timestamp) at time zone e.tz)
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

create or replace function public.mon_etat_workshop()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'jour',           public.workshop_jour(auth.uid()),
    'jour_deblocage', (select jour_deblocage from workshop_reglages where id = 1),
    'dispense',       coalesce((select workshop_dispense from members where id = auth.uid()), false),
    'equipe',         public.is_equipe(auth.uid()),
    'intro_ok',       public.intro_terminee(auth.uid()),
    'modules_avant',  (select modules_avant_j3 from workshop_reglages where id = 1),
    'fuseau',         public.fuseau_membre(auth.uid()),
    'ouvre_le',       case
      when public.workshop_jour(auth.uid()) >= (select jour_deblocage from workshop_reglages where id = 1) then null
      else ((((public.workshop_depart(auth.uid()) at time zone public.fuseau_membre(auth.uid()))::date
              + (select jour_deblocage from workshop_reglages where id = 1) - 1)::timestamp)
             at time zone public.fuseau_membre(auth.uid()))
    end
  );
$$;

-- Le suivi des setters : sans capture, le retard part du jour 1, plus du
-- jour 0. Un élève du jour 1 qui n'a rien déposé a 1 jour en attente.
create or replace view public.suivi_workshop as
  select m.id,
         m.first_name as prenom,
         m.email,
         m.plan_code,
         m.activated_at,
         public.workshop_jour(m.id)                       as jour,
         count(c.jour)                                    as captures,
         max(c.jour)                                      as dernier_jour_depose,
         max(c.created_at)                                as derniere_capture_at,
         public.workshop_jour(m.id) - coalesce(max(c.jour), 0) as jours_de_retard
    from public.members m
    left join public.workshop_captures c on c.member_id = m.id
   where m.role = 'member'
     and not m.workshop_dispense
   group by m.id;

alter view public.suivi_workshop set (security_invoker = on);

-- Vérification : le jour de chaque élève.
select m.email, m.activated_at::date as inscrit_le, public.workshop_jour(m.id) as jour
from public.members m
where m.role = 'member'
order by m.activated_at desc
limit 10;
