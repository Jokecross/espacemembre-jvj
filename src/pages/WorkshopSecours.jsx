import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Icone from '../components/Icone.jsx'
import PromptCopie from '../components/PromptCopie.jsx'

/** La page « Si ça ne marche pas » : un prompt par problème, à déplier. */
export default function WorkshopSecours() {
  const [liste, setListe] = useState(null)
  const [intro, setIntro] = useState(null)
  const [ouvert, setOuvert] = useState(null)

  useEffect(() => {
    supabase
      .from('workshop_secours')
      .select('*')
      .order('position')
      .then(({ data }) => setListe(data || []))
    supabase
      .from('workshop_reglages')
      .select('parcours')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => setIntro(data?.parcours?.secours_intro || null))
  }, [])

  return (
    <>
      <Link
        to="/workshop"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
      >
        <Icone nom="fleche" taille={15} className="rotate-180" />
        Retour au workshop
      </Link>

      <h1 className="mt-5 font-title text-[26px] font-bold leading-tight tracking-tight text-navy sm:text-[34px]">
        Si ça ne <span className="mot-or">marche pas</span>
      </h1>
      {intro && <p className="mt-2.5 max-w-[68ch] text-[15px] leading-relaxed">{intro}</p>}

      {!liste ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {liste.map((s) => (
            <section key={s.cle} className="overflow-hidden rounded-2xl border border-white/[.07] bg-[#111113]">
              <button
                onClick={() => setOuvert(ouvert === s.cle ? null : s.cle)}
                aria-expanded={ouvert === s.cle}
                className="flex w-full items-center gap-3 p-4 text-left sm:px-5"
              >
                <b className="min-w-0 flex-1 font-title text-[15.5px] font-semibold text-navy">{s.titre}</b>
                <span className="flex-none font-title text-lg font-bold text-accent">
                  {ouvert === s.cle ? '−' : '+'}
                </span>
              </button>

              {ouvert === s.cle && (
                <div className="border-t border-line p-4 sm:p-5">
                  {s.intro && <p className="text-[14.5px] leading-relaxed text-navy">{s.intro}</p>}
                  <PromptCopie id={s.cle} titre="Le prompt à coller" texte={s.prompt} />
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
