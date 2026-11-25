export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatShortDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: Date | string | number): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} d ago`
  return formatDate(date)
}

export const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)}%`)

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n))

export function average(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number')
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase()
}

/** strengths / weaknesses are stored as a JSON array string by the AI evaluator */
export function parseList(text: string | null | undefined): string[] {
  if (!text) return []
  try {
    const parsed: unknown = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    }
  } catch {
    /* plain text */
  }
  return text
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Runs async work over a list with a small concurrency limit. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i] as T)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
