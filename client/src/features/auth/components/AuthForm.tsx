import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { errorMessage } from '../../../services/api'
import { validateAuth } from '../auth.service'

type Mode = 'login' | 'register'
type Values = { name: string; email: string; password: string }

type AuthFormProps = {
  mode: Mode
  onSubmit: (values: Values) => Promise<void>
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const found = validateAuth(mode, values)
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      await onSubmit(values)
      // On success the auth layout redirects away, nothing else to do here.
    } catch (err) {
      setServerError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {mode === 'register' && (
        <Input label="Name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={set('email')}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={values.password}
        onChange={set('password')}
        error={errors.password}
        hint={mode === 'register' ? 'At least 8 characters.' : undefined}
      />

      {serverError && (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {serverError}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}
