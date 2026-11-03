# Espace membre — Jean Val Jean (formation IA)

Le portail des élèves de JVJ : formation vidéo, workshop de 7 jours, outils.
Repris de l'espace Sirius (`~/Espace Membre Sirius`, non modifié), à la charte de
la page JVJ (noir #0B0B0C, or #E3B64F, Inter Tight + Inter). Vite + React + Tailwind,
déployé sur Vercel ; données, comptes et vidéos dans un projet Supabase **dédié à JVJ**,
séparé de la base Sirius : le contenu de JVJ n'y croise jamais celui d'Anthony.

Les leads de JVJ ne passent pas par cette base : ils arrivent dans le CRM Sirius
(pastille « Page JVJ », équipe Base44). Les setters ouvrent ici `/admin` → Invitations
pour créer le lien d'accès d'un élève JVJ.

Noms affichés : `src/lib/marque.js` (MARQUE Jean Val Jean, OFFRE Formation IA,
OUTIL Base44, APP « outil », à confirmer).

```
src/lib/marque.js        nom de la marque, de l'offre et de l'outil d'IA
src/pages/Login.jsx      connexion (e-mail + mot de passe)
src/pages/Invite.jsx     /bienvenue/<jeton> : l'élève crée son compte
src/pages/Modules.jsx    accueil : prochaine action, modules, progression
src/pages/Lesson.jsx     le lecteur et le bouton « j'ai terminé »
src/pages/Workshop.jsx   les 7 jours : vidéo, prompts à copier, capture
src/pages/Outils.jsx     les outils recommandés
src/pages/Admin.jsx      back-office (invitations, suivi, contenu, formules…)
src/pages/WorkshopAdmin.jsx  réglages du workshop, prompt du jour 0, les 7 jours
api/invite-accept.js     crée le compte depuis une invitation (clé service_role)
api/reset-password.js    un admin pose un nouveau mot de passe
api/video-token.js       URL de lecture d'une leçon, après contrôle des droits
api/resource-url.js      URL signée d'un document
```

La base s'installe avec `supabase/INSTALLATION.sql` (voir
`supabase/LISEZMOI.md`).

## Comment un élève entre

1. Pendant l'appel, le setter ouvre `/admin` → **Invitations**, choisit la
   formule (mensuel ou annuel) et copie le lien `/bienvenue/<jeton>`. Juste en
   dessous, il a le **prompt du jour 0** à faire coller dans l'outil d'IA.
2. L'élève ouvre le lien, choisit son e-mail et son mot de passe : son compte
   est créé, sa formule appliquée, le lien brûlé (valable 14 jours).
3. Un guide de bienvenue en 4 étapes, puis l'espace.

Les comptes de l'équipe sont ceux du CRM : chaque ligne de `staff` devient un
membre `setter` ou `admin`, automatiquement.

## Le rythme

- Le workshop démarre à l'inscription. Chaque minuit, à l'heure de l'élève,
  ouvre le jour suivant.
- Avant le jour 3, seul le premier module (hors introduction) est ouvert ;
  au jour 3, toute la formule. Réglable dans **Workshop 7 jours**.
- Les modules marqués « introduction » sont toujours ouverts.

## Ce que l'admin remplit

Tout se fait dans `/admin`, rien n'est codé en dur :

- **Contenu** : modules, leçons, vidéo (fichier, Vimeo, Loom ou Tella), PDF.
- **Formules** : quels modules pour le mensuel, lesquels pour l'annuel.
- **Workshop 7 jours** : le prompt du jour 0, puis pour chaque jour un titre,
  une vidéo, un ou deux prompts et des consignes.
- **Outils**, **Prochaines étapes** (l'offre proposée en fin de programme,
  éteinte au départ), **Membres** (mots de passe).

## Variables Vercel

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | l'URL du projet Supabase de JVJ |
| `VITE_SUPABASE_ANON_KEY` | clé anon (publique) |
| `SUPABASE_URL` | la même URL |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role — **jamais** de préfixe `VITE_` |

En local : `.env` (ignoré par git) contient les deux variables `VITE_`.
Pour construire : `set -a; . ./.env; set +a; npx vite build`.
