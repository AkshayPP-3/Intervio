import { api } from '../../services/api'
import type { Resume } from '../../types/resume.types'
import { MAX_RESUME_BYTES, RESUME_EXTENSIONS } from '../../utils/constants'

/*  GET /resumes   POST /resumes/upload (multipart field "file")   PATCH|DELETE /resumes/:id  */

export const listResumes = () => api.get<Resume[]>('/resumes')

export function uploadResume(file: File): Promise<Resume> {
  const form = new FormData()
  form.append('file', file)
  return api.upload<Resume>('/resumes/upload', form)
}

export const renameResume = (id: string, fileName: string) => api.patch<Resume>(`/resumes/${id}`, { fileName })

export const deleteResume = (id: string) => api.del(`/resumes/${id}`)

/** Returns an error message, or null when the file is acceptable (matches the server rules). */
export function validateResumeFile(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!RESUME_EXTENSIONS.some((ext) => name.endsWith(ext))) return 'Please choose a PDF, DOC or DOCX file.'
  if (file.size === 0) return 'This file is empty.'
  if (file.size > MAX_RESUME_BYTES) return 'The file is larger than 5 MB.'
  return null
}
