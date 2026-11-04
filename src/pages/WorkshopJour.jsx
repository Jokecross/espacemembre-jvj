import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Icone from '../components/Icone.jsx'
import PromptCopie from '../components/PromptCopie.jsx'
import CaptureJour from '../components/CaptureJour.jsx'
import { lecteur } from '../lib/lecteur.js'
import { Compte, intitule } from './Workshop.jsx'

/**
 * La page d'un jour. Elle affiche les blocs de `page` dans leur ordre :
 * parties, étapes, encadré, « Bon à savoir », prompts, « Tu as réussi si… ».
 * Un jour fermé ne renvoie rien de tout ça : c'est la base qui le décide.
 */
export default function WorkshopJour() {
  const n = Number(useParams().jour)
  const [jours, setJours] = useState(null)
  const [zero, setZero] = useState(null)

  const charger = useCallback(
    () => supabase.rpc('mon_workshop').then(({ data }) => setJours(data || [])),
    [],
  )

  useEffect(() => {
    charger()
    supabase
      .from('workshop_reglages')
      .select('prompt_j0, parcours')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) =>
        setZero({
          jour: 0,
          ouvert: true,
          ...(data?.parcours?.jour0 || {}),
          page: { blocs: data?.parcours?.jour0?.blocs },
          prompt: data?.prompt_j0,
        }),
      )
  }, [charger])

  if (!jours || !zero) return <p className="text-muted">Chargement…</p>

  const j = n === 0 ? zero : jours.find((x) => x.jour === n)
  if (!j) return <Retour />

  const suivant = jours.find((x) => x.jour === n + 1)

  return (
    <>
      <Retour />

      <p className="eyebrow mt-5 text-accent">{n === 0 ? 'Avant de commencer' : `Jour ${n} sur 7`}</p>
      <h1 className="mt-2 font-title text-[26px] font-bold leading-tight tracking-tight text-navy sm:text-[34px]">
        {intitule(j)}
      </h1>

      {!j.ouvert ? (
        <div className="ligne-video verrou mt-6">
          <span className="rond-etat text-muted/60">
            <Icone nom="cadenas" taille={16} />
          </span>
          <span className="min-w-0 flex-1 text-sm text-muted">Ce jour n'est pas encore ouvert.</span>
          <Compte ouvreLe={j.ouvre_le} />
        </div>
      ) : (
        <Contenu jour={j} onDepose={charger} />
      )}

      <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {n > 0 && (
          <Link to={`/workshop/jour/${n - 1}`} className="btn-ghost">
            Jour {n - 1}
          </Link>
        )}
        {suivant?.ouvert && (
          <Link to={`/workshop/jour/${n + 1}`} className="btn-ghost sm:ml-auto">
            Jour {n + 1}
            <Icone nom="fleche" taille={16} />
          </Link>
        )}
      </nav>
    </>
  )
}

function Retour() {
  return (
    <Link
      to="/workshop"
      className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
    >
      <Icone nom="fleche" taille={15} className="rotate-180" />
      Retour au workshop
    </Link>
  )
}

/** Sans page écrite, on retombe sur les étapes et les prompts du jour. */
function blocsDe(j) {
  if (j.page?.blocs?.length) return j.page.blocs
  return [
    { type: 'etapes', de: 0, a: null },
    { type: 'prompt', n: 1, titre: 'Le prompt à coller dans Base44' },
    { type: 'prompt', n: 2, titre: j.prompt_2_titre || 'Le deuxième prompt' },
  ]
}

function Contenu({ jour: j, onDepose }) {
  const etapes = Array.isArray(j.etapes) ? j.etapes.filter((e) => typeof e === 'string' && e.trim()) : []
  const blocs = blocsDe(j)
  let partie = 0

  return (
    <div className="mt-5">
      {j.resume && (
        <div className="card p-5">
          <p className="eyebrow text-accent">Ce que tu construis aujourd'hui</p>
          <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-navy">{j.resume}</p>
        </div>
      )}

      {j.video_url && (
        <div className="mt-5 aspect-video overflow-hidden rounded-[14px] bg-panel">
          <iframe
            src={lecteur(j.video_url)}
            title={`Jour ${j.jour}`}
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}

      {blocs.map((b, i) => {
        if (b.type === 'partie') {
          partie += 1
          return (
            <h2 key={i} className="mt-8 font-title text-[20px] font-extrabold leading-tight text-navy">
              <span className="text-accent">Partie {partie}</span> · {b.titre}
            </h2>
          )
        }
        if (b.type === 'etapes') {
          const liste = etapes.slice(b.de, b.a ?? undefined)
          return liste.length ? <Etapes key={i} etapes={liste} debut={b.de + 1} /> : null
        }
        if (b.type === 'encadre') return <Encadre key={i} bloc={b} />
        if (b.type === 'savoir') return <BonASavoir key={i} items={b.items} />
        if (b.type === 'prompt') {
          const texte = b.n === 2 ? j.prompt_2 : j.prompt
          return texte ? <PromptCopie key={i} id={b.id} titre={b.titre} texte={texte} /> : null
        }
        if (b.type === 'reussi') return <Reussi key={i} items={b.items} />
        if (b.type === 'fin') {
          return (
            <section key={i} className="carte-phare mt-5">
              <p className="relative text-[15px] leading-relaxed text-navy">{b.texte}</p>
            </section>
          )
        }
        return null
      })}

      {j.consignes && (
        <div className="mt-5 flex gap-3 rounded-xl border-[1.5px] border-accent/45 bg-canvas p-4">
          <Icone nom="cible" taille={18} className="mt-0.5 flex-none text-accent" />
          <p className="text-sm">
            <b className="block font-title text-[14.5px] font-extrabold text-navy">Avant demain</b>
            <span className="mt-0.5 block whitespace-pre-line">{j.consignes}</span>
          </p>
        </div>
      )}

      {!j.video_url && !j.prompt && etapes.length === 0 && (
        <p className="mt-5 text-sm text-muted">Le contenu de ce jour arrive très vite.</p>
      )}

      {j.jour > 0 && <CaptureJour jour={j.jour} deja={j.capture_faite} onDepose={onDepose} />}

      <Link
        to="/workshop/secours"
        className="mt-4 inline-block text-[13px] font-semibold text-muted underline underline-offset-2 hover:text-navy"
      >
        Ça coince ? Va dans « Si ça ne marche pas ».
      </Link>
    </div>
  )
}

/** Les étapes, numérotées et reliées. Le jour 1 reprend à 6 après sa partie 1. */
function Etapes({ etapes, debut }) {
  return (
    <div className="mt-5 rounded-xl bg-canvas p-4 sm:p-5">
      <h3 className="font-title text-[15px] font-extrabold text-navy">Les étapes</h3>
      <ol className="mt-4">
        {etapes.map((e, i) => (
          <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < etapes.length - 1 && (
              <span aria-hidden="true" className="absolute bottom-0 left-[14px] top-8 w-px bg-line-strong" />
            )}
            <span className="grid h-[29px] w-[29px] flex-none place-items-center rounded-full border-[1.5px] border-accent/60 bg-surface font-title text-[12.5px] font-extrabold text-accent">
              {debut + i}
            </span>
            <p className="min-w-0 flex-1 whitespace-pre-line pt-[3px] text-[14.5px] leading-relaxed text-navy">
              {e}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Encadre({ bloc }) {
  return (
    <div className="mt-5 rounded-xl border-[1.5px] border-accent/45 bg-canvas p-4 sm:p-5">
      <h3 className="font-title text-[15px] font-extrabold text-navy">{bloc.titre}</h3>
      <ol className="mt-3 space-y-2">
        {bloc.items.map((e, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-navy">
            <b className="flex-none font-title text-accent">{i + 1}.</b>
            <span className="min-w-0 flex-1">{e}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function BonASavoir({ items }) {
  return (
    <div className="mt-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h3 className="font-title text-[15px] font-extrabold text-navy">Bon à savoir</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((e, i) => (
          <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed">
            <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
            <span className="min-w-0 flex-1">{e}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Reussi({ items }) {
  return (
    <div className="mt-6 rounded-xl border border-success/30 bg-success-bg p-4 sm:p-5">
      <h3 className="font-title text-[15px] font-extrabold text-success">Tu as réussi si…</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((e, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-success">
            <Icone nom="valide" taille={17} className="mt-[3px] flex-none" />
            <span className="min-w-0 flex-1">{e}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
