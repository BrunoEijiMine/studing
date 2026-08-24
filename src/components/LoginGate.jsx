import { useState } from 'react'

export default function LoginGate({ auth, children }) {
  const [password, setPasswordInput] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (auth.isUnlocked) return children

  const handleSetup = async (e) => {
    e.preventDefault()
    if (password.length < 4) {
      setError('Use pelo menos 4 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setError(null)
    setSubmitting(true)
    await auth.setup(password)
    setSubmitting(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const ok = await auth.login(password)
    setSubmitting(false)
    if (!ok) setError('Senha incorreta.')
  }

  const handleForgot = () => {
    const confirmed = window.confirm(
      'Isso remove a trava atual e deixa criar uma senha nova. Suas posições continuam salvas, só a senha é resetada. Continuar?'
    )
    if (confirmed) auth.forgotPassword()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <form
        onSubmit={auth.isSetup ? handleLogin : handleSetup}
        className="w-full max-w-sm animate-fade-in-up rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">
            M
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Minha Carteira</span>
        </div>

        <h1 className="text-lg font-semibold text-white">
          {auth.isSetup ? 'Entrar' : 'Criar uma senha'}
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          {auth.isSetup
            ? 'Digite a senha pra acessar sua carteira.'
            : 'Isso só tranca a tela nesse navegador — os dados continuam salvos localmente, sem servidor.'}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>

          {!auth.isSetup && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400" htmlFor="confirm">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
              />
            </div>
          )}

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
          >
            {submitting ? 'Aguarde...' : auth.isSetup ? 'Entrar' : 'Criar senha e entrar'}
          </button>

          {auth.isSetup && (
            <button
              type="button"
              onClick={handleForgot}
              className="self-center text-xs text-neutral-500 underline underline-offset-2 transition hover:text-neutral-300"
            >
              esqueci minha senha
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
