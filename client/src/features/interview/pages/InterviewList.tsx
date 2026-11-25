import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Modal } from '../../../components/ui/Modal'
import { errorMessage } from '../../../services/api'
import { STATUS_LABEL } from '../../../utils/constants'
import type { Interview, InterviewStatus } from '../../../types/interview.types'
import { InterviewCard } from '../components/InterviewCard'
import { InterviewSetup } from '../components/InterviewSetup'
import { deleteInterview, listInterviews } from '../interview.service'

type Filter = 'ALL' | InterviewStatus
const FILTERS: Filter[] = ['ALL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export function InterviewList() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Interview[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [toDelete, setToDelete] = useState<Interview | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [tick, setTick] = useState(0)
  const load = () => {
    setError(null)
    setTick((t) => t + 1)
  }

  useEffect(() => {
    let cancelled = false
    listInterviews()
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Could not load your interviews.'))
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteInterview(toDelete.id)
      setItems((list) => (list ?? []).filter((i) => i.id !== toDelete.id))
      setToDelete(null)
    } catch (e) {
      setError(errorMessage(e, 'Could not delete the interview.'))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const shown = (items ?? []).filter((i) => filter === 'ALL' || i.status === filter)

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
      <div>
        <h1 className="text-[15px] font-bold text-white">Interviews</h1>
        <p className="mt-1 text-xs text-slate-400">Configure a mock interview. Restarting at any point in your journey.</p>
      </div>

      <div className="mt-5">
        <InterviewSetup />
      </div>

      <Card
        title="Your interviews"
        className="mt-6"
        action={
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter interviews">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-md px-2 py-1 text-[10px] transition ${
                  filter === f ? 'bg-blue-500 text-white' : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        }
      >
        {error && (
          <p role="alert" className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}{' '}
            <button className="underline" onClick={load}>
              Try again
            </button>
          </p>
        )}
        {items === null && !error && <p className="text-xs text-slate-400">Loading your interviews…</p>}
        {items && shown.length === 0 && (
          <p className="text-xs text-slate-400">
            {items.length === 0 ? 'No interviews yet. Start one above.' : 'No interviews match this filter.'}
          </p>
        )}
        <div className="space-y-2">
          {shown.map((i) => (
            <InterviewCard
              key={i.id}
              interview={i}
              onOpen={() => navigate(`/interviews/${i.id}`)}
              onReport={() => navigate(`/reports/${i.id}`)}
              onDelete={() => setToDelete(i)}
            />
          ))}
        </div>
      </Card>

      <Modal open={toDelete !== null} title="Delete interview?" busy={deleting} onClose={() => setToDelete(null)}>
        <p className="text-xs leading-5 text-slate-300">
          “{toDelete?.title}” and its questions, answers and report will be permanently deleted.
        </p>
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
