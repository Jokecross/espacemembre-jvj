import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { MARQUE, OFFRE } from '../lib/marque'
import Couronne from '../components/Couronne.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState('idle') // idle | sending
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setState('sending')
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    if (error) {
      // Le message de Supabase est en anglais et vague : on dit ce qui se
      // passe vraiment, sans révéler si l'adresse existe.
      setError(
        /invalid login/i.test(error.message)
          ? "Adresse ou mot de passe incorrect."
          : error.message
      )
      setState('idle')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="card page-in w-full max-w-md p-7 shadow-lift sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-accent/30 bg-accent/[.08] text-accent">
            <Couronne className="h-[15px] w-[21px]" />
          </span>
          <span>
            <span className="block font-title text-[17px] font-bold leading-tight tracking-tight text-navy">{MARQUE}</span>
            <span className="block font-serif text-[16px] italic leading-tight text-accent">{OFFRE}</span>
          </span>
        </div>

        <h1 className="mt-7 text-[28px]">Accéder à mon <span className="mot-or">programme</span></h1>
        <p className="mt-2 text-sm">
          Entre l'adresse et le mot de passe que tu as choisis en activant ton accès.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            className="field"
            type="email"
            placeholder="ton@email.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="field"
            type="password"
            placeholder="Ton mot de passe"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

          <button className="btn w-full" disabled={state === 'sending'}>
            {state === 'sending' ? 'Connexion…' : 'Me connecter'}
          </button>
        </form>

        <p className="mt-5 text-xs text-muted">
          Mot de passe oublié ? Écris à ton coach, il te le réinitialise.
        </p>
      </div>
    </div>
  )
}
