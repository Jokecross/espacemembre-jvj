-- =====================================================================
--  Ce qui s'affiche sous chaque vidéo : bouton, lien, blocs à copier.
--  À coller dans Supabase → SQL Editor → New query → Run. Rejouable.
--
--  Le contenu vit sur la leçon : la règle qui ferme une vidéo le ferme
--  aussi, et il n'est jamais dans le code public du site.
-- =====================================================================

alter table public.lessons
  add column if not exists sous_video jsonb;

-- Vérification : la colonne est là, et les 20 vidéos aussi.
select count(*) as videos,
       count(sous_video) as videos_avec_contenu
from public.lessons;
