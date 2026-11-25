import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Loader } from '../../components/ui/Loader'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage } from '../../services/api'
import type { Profile as ProfileType, ProfileInput } from '../../types/user.types'
import { DIFFICULTIES, LANGUAGES, PREFS_KEY } from '../../utils/constants'
import { formatDate } from '../../utils/helpers'
import { ProfileForm } from './components/ProfileForm'
import { getProfile, saveProfile, updateAccount, validateAccount } from './profile.service'

type Prefs = { difficulty: string; language: string; techRole: string }
const DEFAULT_PREFS: Prefs = { difficulty: 'Intermediate', language: 'English', techRole: 'Frontend Developer' }

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

const selectClass =
  'mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 outline-none focus:border-blue-400'

/** Settings: account, profile details, interview defaults and sign out. */
export function Profile() {
  const { user, updateUser, logout } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [accountErrors, setAccountErrors] = useState<{ name?: string; email?: string }>({})
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountBusy, setAccountBusy] = useState(false)

  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [prefs, setPrefs] = useState<Prefs>(readPrefs)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [draftsCleared, setDraftsCleared] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((p) => {
        if (!cancelled) setProfile(p)
      })
      .catch((e) => {
        if (!cancelled) setProfileError(errorMessage(e, 'Could not load your profile.'))
      })
      .finally(() => {
        if (!cancelled) setProfileLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function saveAccount(e: FormEvent) {
    e.preventDefault()
    const found = validateAccount(name, email)
    setAccountErrors(found)
    setAccountError(null)
    setAccountSaved(false)
    if (Object.keys(found).length) return
    setAccountBusy(true)
    try {
      const updated = await updateAccount({ name: name.trim(), email: email.trim() })
      updateUser(updated)
      setAccountSaved(true)
    } catch (err) {
      setAccountError(errorMessage(err, 'Could not update your account.'))
    } finally {
      setAccountBusy(false)
    }
  }

  async function saveProfileDetails(input: ProfileInput) {
    const saved = await saveProfile(input, profile !== null)
    setProfile(saved)
  }

  function savePrefs() {
    try {
      // Merge so the Practice page's own settings (technical role) are kept.
      const current = readPrefs()
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, difficulty: prefs.difficulty, language: prefs.language }))
      setPrefsSaved(true)
    } catch {
      setPrefsSaved(false)
    }
  }

  function clearDrafts() {
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('intervio_draft_'))
        .forEach((k) => sessionStorage.removeItem(k))
      setDraftsCleared(true)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
      <PageHeader title="Settings" description="Your account, profile and interview defaults." />

      <div className="grid items-start gap-3 xl:grid-cols-2">
        <Card title="Account">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={user?.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
              {user?.createdAt && <p className="mt-0.5 text-[11px] text-slate-500">Member since {formatDate(user.createdAt)}</p>}
            </div>
          </div>
          <form onSubmit={(e) => void saveAccount(e)} noValidate className="space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={accountErrors.name} autoComplete="name" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={accountErrors.email} autoComplete="email" />
            {accountError && (
              <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {accountError}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={accountBusy}>
                Save account
              </Button>
              {accountSaved && (
                <span role="status" className="text-xs text-emerald-300">
                  Account updated
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card title="Profile details">
          {!profileLoaded ? (
            <Loader label="Loading your profile…" />
          ) : (
            <>
              {profileError && (
                <p role="alert" className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {profileError}
                </p>
              )}
              <ProfileForm profile={profile} onSave={saveProfileDetails} />
            </>
          )}
        </Card>

        <Card title="Interview defaults">
          <p className="mb-3 text-[11px] text-slate-400">Used as the starting difficulty and language on the Practice page.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-semibold text-slate-300">
              Difficulty
              <select
                className={selectClass}
                value={prefs.difficulty}
                onChange={(e) => {
                  setPrefsSaved(false)
                  setPrefs({ ...prefs, difficulty: e.target.value })
                }}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-300">
              Language
              <select
                className={selectClass}
                value={prefs.language}
                onChange={(e) => {
                  setPrefsSaved(false)
                  setPrefs({ ...prefs, language: e.target.value })
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={savePrefs}>Save defaults</Button>
            {prefsSaved && (
              <span role="status" className="text-xs text-emerald-300">
                Saved
              </span>
            )}
          </div>
        </Card>

        <Card title="Session and data">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-300">Remove unsent answer drafts stored in this browser.</p>
              <Button variant="secondary" size="sm" onClick={clearDrafts}>
                {draftsCleared ? 'Cleared' : 'Clear drafts'}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 pt-3">
              <p className="text-xs text-slate-300">Sign out of Intervio on this device.</p>
              <Button variant="danger" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
