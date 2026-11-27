import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { errorMessage } from '../../services/api'
import type { Resume as ResumeType } from '../../types/resume.types'
import { ResumeCard } from './components/ResumeCard'
import { ResumeUpload } from './components/ResumeUpload'
import { deleteResume, listResumes, renameResume, uploadResume } from './resume.service'

export function Resume() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<ResumeType[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toDelete, setToDelete] = useState<ResumeType | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [tick, setTick] = useState(0)
  const load = () => {
    setError(null)
    setTick((t) => t + 1)
  }

  useEffect(() => {
    let cancelled = false
    listResumes()
      .then((list) => {
        if (!cancelled) setResumes(list)
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Could not load your resumes.'))
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  async function upload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const created = await uploadResume(file)
      setResumes((list) => [created, ...(list ?? [])])
    } catch (e) {
      setUploadError(errorMessage(e, 'Upload failed. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  async function rename(id: string, name: string) {
    try {
      const updated = await renameResume(id, name)
      setResumes((list) => (list ?? []).map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      setError(errorMessage(e, 'Could not rename the file.'))
      throw e
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteResume(toDelete.id)
      setResumes((list) => (list ?? []).filter((r) => r.id !== toDelete.id))
      setToDelete(null)
    } catch (e) {
      setError(errorMessage(e, 'Could not delete the resume.'))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
      <PageHeader title="Resume" description="Keep your resumes in one place. Upload a new version any time." />

      <div className="grid items-start gap-3 xl:grid-cols-3">
        <div className="grid gap-3 xl:col-span-2">
          <Card title="Upload a resume">
            <ResumeUpload uploading={uploading} onUpload={(f) => void upload(f)} error={uploadError} />
          </Card>

          <Card title="Your resumes">
            {error && (
              <p role="alert" className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}{' '}
                <button className="underline" onClick={load}>
                  Try again
                </button>
              </p>
            )}
            {resumes === null && !error && <p className="text-xs text-slate-400">Loading your resumes…</p>}
            {resumes?.length === 0 && <p className="text-xs text-slate-400">No resumes yet. Upload one above.</p>}
            <div className="space-y-2">
              {resumes?.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  busy={deleting}
                  onRename={(name) => rename(r.id, name)}
                  onDelete={() => setToDelete(r)}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-3">
          <Card title="Next step">
            <p className="text-xs leading-5 text-slate-300">
              Intervio writes interview questions from the role you choose. Reading your resume is not supported yet,
              so pick the role that matches it.
            </p>
            <Button size="sm" className="mt-3" onClick={() => navigate('/interviews/new')}>
              Start an interview
            </Button>
          </Card>
          <Card title="Resume tips">
            <ul className="list-disc space-y-1.5 pl-4 text-[11px] leading-5 text-slate-400">
              <li>One page if you have under 5 years of experience</li>
              <li>Start bullets with action verbs and add numbers</li>
              <li>Use standard headings: Experience, Projects, Education, Skills</li>
              <li>Avoid tables and images so screening tools can read it</li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={toDelete !== null} title="Delete resume?" busy={deleting} onClose={() => setToDelete(null)}>
        <p className="text-xs leading-5 text-slate-300">“{toDelete?.fileName}” will be removed from your account.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void confirmDelete()} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
