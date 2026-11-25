import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import type { Resume } from '../../../types/resume.types'
import { formatDate } from '../../../utils/helpers'

type ResumeCardProps = {
  resume: Resume
  busy: boolean
  onRename: (name: string) => Promise<void>
  onDelete: () => void
}

export function ResumeCard({ resume, busy, onRename, onDelete }: ResumeCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(resume.fileName)
  const [saving, setSaving] = useState(false)

  async function save() {
    const next = name.trim()
    if (!next || next === resume.fileName) {
      setEditing(false)
      setName(resume.fileName)
      return
    }
    setSaving(true)
    try {
      await onRename(next)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            aria-label="Resume file name"
            value={name}
            maxLength={150}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void save()
              if (e.key === 'Escape') {
                setEditing(false)
                setName(resume.fileName)
              }
            }}
            className="h-8 w-full rounded-md border border-slate-600 bg-slate-900 px-2 text-xs text-white outline-none focus:border-blue-400"
          />
        ) : (
          <h3 className="truncate text-xs font-semibold text-white">{resume.fileName}</h3>
        )}
        <p className="mt-0.5 text-[11px] text-slate-400">Uploaded {formatDate(resume.createdAt)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <Button size="sm" loading={saving} onClick={() => void save()}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setEditing(false)
                setName(resume.fileName)
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {resume.fileUrl && (
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded-md bg-slate-700 px-3 text-xs font-semibold text-blue-300 hover:bg-slate-600"
              >
                View
              </a>
            )}
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(true)}>
              Rename
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
