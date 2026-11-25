import { useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { validateResumeFile } from '../resume.service'

type ResumeUploadProps = {
  uploading: boolean
  onUpload: (file: File) => void
  error: string | null
}

export function ResumeUpload({ uploading, onUpload, error }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  function take(file: File | undefined) {
    if (!file) return
    const problem = validateResumeFile(file)
    setLocalError(problem)
    if (!problem) onUpload(file)
  }

  const shown = localError ?? error

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a resume"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!uploading) take(e.dataTransfer.files[0])
        }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
          dragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'
        } ${uploading ? 'cursor-wait opacity-70' : ''}`}
      >
        <p className="text-xs font-semibold text-white">{uploading ? 'Uploading…' : 'Drag a file here or click to upload'}</p>
        <p className="mt-1 text-[11px] text-slate-400">PDF, DOC or DOCX, up to 5 MB</p>
        {!uploading && (
          <Button size="sm" variant="secondary" className="mt-3" tabIndex={-1}>
            Choose file
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            take(e.target.files?.[0])
            e.target.value = '' // lets you pick the same file again
          }}
        />
      </div>
      {shown && (
        <p role="alert" className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {shown}
        </p>
      )}
    </div>
  )
}
