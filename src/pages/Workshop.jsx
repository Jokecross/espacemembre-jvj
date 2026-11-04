import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Icone from '../components/Icone.jsx'
import Anneau from '../components/Anneau.jsx'
import { useEtatWorkshop } from '../components/ProgrammeVerrouille.jsx'
import { lecteur } from '../lib/lecteur.js'
import { APP, OUTIL } from '../lib/marque'

/**
 * L'accueil du parcours Kairo : le bandeau « Comment ça marche », puis une
 * ligne par jour. Chaque jour a sa page (WorkshopJour.jsx).
 *
 * Les sept jours se comptent depuis l'inscription de l'élève : le jour 1
 * est ouvert dès l'inscription, puis un jour s'ouvre à chaque minuit, qu'il
 * soit venu ou non.
 *
 * Un jour s'ouvre à minuit chez l'élève — c'est la base qui le décide
 * (`mon_workshop`), pas le navigateur : le contenu d'un jour à venir
 * n'est tout simplement pas renvoyé. Changer l'heure de son ordinateur ne
 * donne rien.
 *
 * Les élèves arrivés avant le workshop sont dispensés : ils voient les
 * sept jours d'un coup.
 */

/** « Jour 1 · Ta boutique », ou « Jour 1 » tant que le titre n'est pas écrit. */
export function intitule(j) {
  const titre = (j.titre || '').trim()
  return titre && titre !== `Jour ${j.jour}` ? `Jour ${j.jour} · ${titre}` : `Jour ${j.jour}`
}

/** Le fuseau de l'élève, pour que ses jours s'ouvrent à minuit chez lui. */
function fuseauNavigateur() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export default function Workshop() {
  const [jours, setJours] = useState(null)
  const etat = useEtatWorkshop(true)
  const [reglages, setReglages] = useState(null)

  useEffect(() => {
    supabase
      .from('workshop_reglages')
      .select('video_systeme_url, parcours')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => setReglages(data || {}))
  }, [])

  useEffect(() => {
    // Les jours partent de l'inscription : `workshop_demarrer` ne fait plus
    // que relever le fuseau, pour que minuit soit celui de l'élève.
    supabase
      .rpc('workshop_demarrer', { p_fuseau: fuseauNavigateur() })
      .then(() => supabase.rpc('mon_workshop'))
      .then(({ data }) => setJours(data || []))
  }, [])

  if (!jours || !reglages) return <p className="text-muted">Chargement…</p>

  const parcours = reglages.parcours
  const faits = jours.filter((j) => j.ouvert).length
  const duJour = [...jours].reverse().find((j) => j.ouvert)?.jour

  // L'introduction n'est pas vue : c'est elle qui retient tout, et beaucoup
  // d'élèves ne le comprennent pas. On le dit ici, en grand, plutôt que de
  // les laisser devant sept cadenas sans explication.
  const introAFaire = etat && !etat.intro_ok && !etat.dispense && !etat.equipe

  return (
    <>
      <p className="eyebrow">Ton workshop</p>
      <h1 className="mt-2 font-title text-[28px] font-bold tracking-tight text-navy sm:text-[38px]">
        Construis ton outil <span className="mot-or">Kairo</span>
      </h1>
      <p className="mt-2.5 max-w-[62ch] text-[15px] leading-relaxed">
        Un prompt par jour à coller dans {OUTIL}. Jour après jour, ton {APP} prend forme : c'est
        ce que tu montreras à tes prospects.
      </p>

      {introAFaire ? (
        <section className="carte-phare mt-6">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-accent">
                <Icone nom="lecture" taille={14} /> Une étape avant
              </span>
              <h2 className="mt-3.5 font-title text-[22px] font-extrabold leading-tight text-navy sm:text-[26px]">
                Regarde ton introduction pour ouvrir le jour 1
              </h2>
              <p className="mt-2.5 max-w-[42ch] text-[15px] leading-relaxed text-ink">
                Quelques minutes de vidéo, et ton workshop démarre. C'est la seule chose qui te
                sépare de ton premier prompt.
              </p>
            </div>
            <Link to="/" className="btn whitespace-nowrap px-7 py-3.5">
              Regarder l'introduction
              <Icone nom="fleche" taille={18} />
            </Link>
          </div>
        </section>
      ) : (
        <div className="card mt-6 flex flex-wrap items-center gap-4 p-5">
          <Anneau valeur={faits / 7} taille={48} texte={faits} />
          <p className="min-w-0 flex-1 text-sm">
            <b className="block font-title text-[15px] font-extrabold text-navy">
              {faits === 7 ? 'Tes sept jours sont ouverts' : `Tu en es au jour ${faits}`}
            </b>
            <span className="text-muted">
              {faits === 7
                ? 'Tu peux avancer à ton rythme.'
                : 'Le jour suivant s’ouvre cette nuit, à minuit.'}
            </span>
          </p>
          <span className="hidden h-1.5 w-48 overflow-hidden rounded-full bg-line sm:block">
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${(faits / 7) * 100}%` }}
            />
          </span>
        </div>
      )}

      {parcours?.bandeau && <CommentCaMarche bandeau={parcours.bandeau} />}

      {reglages.video_systeme_url && <VideoSysteme url={reglages.video_systeme_url} />}

      <div className="mt-6 flex flex-col gap-3">
        {parcours?.jour0 && (
          <LigneOuverte
            to="/workshop/jour/0"
            numero="00"
            titre={intitule({ jour: 0, titre: parcours.jour0.titre })}
            texte={parcours.jour0.resume}
            phare={faits === 0}
          />
        )}

        {jours.map((j) =>
          j.ouvert ? (
            <LigneOuverte
              key={j.jour}
              to={`/workshop/jour/${j.jour}`}
              numero={String(j.jour).padStart(2, '0')}
              titre={intitule(j)}
              texte={j.resume}
              phare={j.jour === duJour}
              fait={j.capture_faite}
            />
          ) : (
            <div key={j.jour} className="ligne-video verrou">
              <span className="num-video">{String(j.jour).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1">
                <b className="block font-title text-[15.5px] font-semibold text-muted sm:text-[16.5px]">
                  {intitule(j)}
                </b>
                {j.resume && (
                  <span className="line-clamp-2 text-[13px] text-muted/70">{j.resume}</span>
                )}
              </span>
              <Compte ouvreLe={j.ouvre_le} />
              <span className="rond-etat hidden text-muted/60 sm:grid">
                <Icone nom="cadenas" taille={16} />
              </span>
            </div>
          ),
        )}

        {parcours?.secours_intro && (
          <Link to="/workshop/secours" className="ligne-video">
            <span className="rond-etat text-accent">
              <Icone nom="cible" taille={17} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block font-title text-[15.5px] font-semibold text-navy sm:text-[16.5px]">
                Si ça ne marche pas
              </b>
              <span className="line-clamp-2 text-[13px] text-muted">
                Le prompt qui correspond à ton problème, à coller dans ton app.
              </span>
            </span>
            <Icone nom="fleche" taille={17} className="flex-none text-muted" />
          </Link>
        )}
      </div>
    </>
  )
}

function LigneOuverte({ to, numero, titre, texte, phare, fait }) {
  return (
    <Link to={to} className={`ligne-video ${phare ? 'prochaine' : ''}`}>
      <span className="num-video">{numero}</span>
      <span className="min-w-0 flex-1">
        <b className="block font-title text-[15.5px] font-semibold text-navy sm:text-[16.5px]">
          {titre}
        </b>
        {texte && <span className="line-clamp-2 text-[13px] text-muted">{texte}</span>}
      </span>
      {fait && <Icone nom="valide" taille={17} className="flex-none text-success" />}
      <Icone nom="fleche" taille={17} className={`flex-none ${phare ? 'text-accent' : 'text-muted'}`} />
    </Link>
  )
}

/** Les règles du parcours, en haut de page : c'est là que tout se joue. */
function CommentCaMarche({ bandeau }) {
  return (
    <section className="mt-6 rounded-2xl border-[1.5px] border-accent/45 bg-surface p-5 sm:p-6">
      <h2 className="font-title text-[19px] font-extrabold leading-tight text-navy sm:text-[22px]">
        {bandeau.titre}
      </h2>
      <ul className="mt-4 space-y-3">
        {bandeau.lignes.map((l, i) => (
          <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-navy">
            <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
            <span className="min-w-0 flex-1">{l}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * La vidéo obligatoire, entre l'avancement et le jour 1 : elle explique
 * le système avant le premier prompt.
 */
function VideoSysteme({ url }) {
  return (
    <section className="mt-6 rounded-[22px] border-[1.5px] border-accent/45 bg-surface p-5 shadow-[0_18px_40px_rgba(0,0,0,.18)] sm:p-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.12em] text-on-accent">
        <Icone nom="lecture" taille={14} /> Vidéo obligatoire
      </span>
      <h2 className="mt-3 font-title text-[19px] font-extrabold leading-tight text-navy sm:text-[22px]">
        À regarder pour comprendre le système
      </h2>
      <div className="mt-4 aspect-video overflow-hidden rounded-[14px] bg-panel">
        <iframe
          src={lecteur(url)}
          title="Vidéo obligatoire : comprendre le système"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </section>
  )
}

/** Le temps qu'il reste avant minuit, mis à jour chaque minute. */
export function Compte({ ouvreLe }) {
  const [reste, setReste] = useState(() => calcul(ouvreLe))

  useEffect(() => {
    const t = setInterval(() => setReste(calcul(ouvreLe)), 30000)
    return () => clearInterval(t)
  }, [ouvreLe])

  if (!reste) return <span className="flex-none text-[11px] font-bold text-muted">Bientôt</span>
  return (
    <span className="flex-none text-right text-[11px] font-bold text-muted">
      s’ouvre dans
      <b className="block font-title text-[13.5px] text-navy">{reste}</b>
    </span>
  )
}

function calcul(iso) {
  if (!iso) return null
  const ms = new Date(iso) - new Date()
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h >= 24 ? `${Math.floor(h / 24)} j ${h % 24} h` : h >= 1 ? `${h} h ${m} min` : `${m} min`
}
