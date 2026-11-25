import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { errorMessage } from '../../../services/api'
import type { Profile, ProfileInput } from '../../../types/user.types'

type ProfileFormProps = {
  profile: Profile | null
  onSave: (input: ProfileInput) => Promise<void>
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [values, setValues] = useState({
    bio: profile?.bio ?? '',
    phone: profile?.phone ?? '',
    location: profile?.location ?? '',
    education: profile?.education ?? '',
    skills: profile?.skills ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false)
    setValues((v) => ({ ...v, [key]: e.target.value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      await onSave({
        bio: values.bio.trim(),
        phone: values.phone.trim(),
        location: values.location.trim(),
        education: values.education.trim(),
        skills: values.skills.trim(),
      })
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err, 'Could not save your profile.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="grid gap-3 sm:grid-cols-2">
      <Input label="Phone" value={values.phone} onChange={set('phone')} autoComplete="tel" maxLength={30} />
      <Input label="Location" value={values.location} onChange={set('location')} maxLength={100} placeholder="City, country" />
      <Input
        label="Education"
        className="sm:col-span-2"
        value={values.education}
        onChange={set('education')}
        maxLength={200}
        placeholder="Degree, college, year"
      />
      <Input
        label="Skills"
        className="sm:col-span-2"
        value={values.skills}
        onChange={set('skills')}
        maxLength={300}
        hint="Separate with commas, e.g. React, TypeScript, SQL"
      />
      <div className="sm:col-span-2">
        <label htmlFor="profile-bio" className="block text-[11px] font-semibold text-slate-300">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={values.bio}
          onChange={set('bio')}
          maxLength={500}
          rows={3}
          className="mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
          placeholder="A short introduction about you"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" loading={busy}>
          Save profile
        </Button>
        {saved && (
          <span role="status" className="text-xs text-emerald-300">
            Profile saved
          </span>
        )}
      </div>
    </form>
  )
}
