import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../../components/common/PageHeader'
import { InterviewSetup } from '../components/InterviewSetup'

/** /interviews/new, optionally /interviews/new?role=Backend%20Developer */
export function CreateInterview() {
  const [params] = useSearchParams()
  const role = params.get('role') ?? undefined
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
      <PageHeader title="New interview" description="Pick a stream, difficulty and language. Intervio writes the questions." />
      <InterviewSetup {...(role ? { initialRole: role } : {})} />
    </div>
  )
}
