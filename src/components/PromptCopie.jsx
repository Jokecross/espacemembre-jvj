import { useState } from 'react'
import Icone from './Icone.jsx'

/**
 * Un prompt à copier. Le texte n'est jamais retouché : ce que l'élève colle
 * dans Base44 est exactement ce qui est en base, crochets compris.
 */
export default function PromptCopie({ id, titre, texte }) {
  const [copie, setCopie] = useState(false)
  const [entier, setEntier] = useState(false)

  function fini() {
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  function secours() {
    const zone = document.createElement('textarea')
    zone.value = texte
    zone.setAttribute('readonly', '')
    zone.style.position = 'fixed'
    zone.style.left = '-9999px'
    document.body.appendChild(zone)
    zone.select()
    zone.setSelectionRange(0, texte.length)
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(zone)
    if (ok) fini()
  }

  async function copier() {
    try {
      // Certains navigateurs laissent cette promesse en attente sans jamais
      // répondre : passé ce délai, on prend la solution de secours.
      await Promise.race([
        navigator.clipboard.writeText(texte),
        new Promise((_, non) => setTimeout(non, 1500)),
      ])
      fini()
    } catch {
      secours()
    }
  }

  return (
    <div className="mt-5" data-prompt={id}>
      <h3 className="font-title text-[15px] font-extrabold text-navy">{titre}</h3>

      <button
        onClick={copier}
        className={`mt-2.5 w-full py-4 text-[15px] ${copie ? 'btn-ghost' : 'btn'}`}
      >
        <Icone nom={copie ? 'valide' : 'copier'} taille={18} epaisseur={copie ? 2.2 : 1.6} />
        {copie ? 'Copié !' : 'COPIER LE PROMPT'}
      </button>

      <pre
        className={`mt-3 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 font-mono text-xs leading-relaxed text-navy [overflow-wrap:anywhere] ${
          entier ? '' : 'max-h-64'
        }`}
      >
        {texte}
      </pre>

      <button
        onClick={() => setEntier(!entier)}
        className="mt-2 text-[13px] font-semibold text-muted underline underline-offset-2 hover:text-navy"
      >
        {entier ? 'Réduire le prompt' : 'Voir tout le prompt'}
      </button>
    </div>
  )
}
