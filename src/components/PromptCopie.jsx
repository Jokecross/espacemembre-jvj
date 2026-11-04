import { useState } from 'react'
import Icone from './Icone.jsx'
import { copierTexte } from '../lib/copier.js'

/**
 * Un prompt à copier. Le texte n'est jamais retouché : ce que l'élève colle
 * dans Base44 est exactement ce qui est en base, crochets compris.
 */
export default function PromptCopie({ id, titre, texte }) {
  const [copie, setCopie] = useState(false)
  const [entier, setEntier] = useState(false)

  async function copier() {
    if (!(await copierTexte(texte))) return
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
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
