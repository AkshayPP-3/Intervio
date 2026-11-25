/* -------------------------------------------------------------------------- */
/*  Practice data + helpers                                                    */
/*  "Start set" creates a real interview (Gemini writes 5 questions) through   */
/*  POST /api/interviews, then the interview room takes over.                  */
/* -------------------------------------------------------------------------- */

export type PracticeCategory = {
  key: string
  title: string
  description: string
  /** Fixed role sent to the API. null = the role the user picks (Technical). */
  role: string | null
  samples: string[]
}

export const CATEGORIES: PracticeCategory[] = [
  {
    key: 'aptitude',
    title: 'Aptitude',
    description: 'Percentages, time and work, series, puzzles',
    role: 'Aptitude',
    samples: [
      'A train 120 m long crosses a pole in 6 seconds. What is its speed in km/h?',
      'If 8 workers finish a job in 12 days, how many days will 6 workers need?',
      'What comes next: 2, 6, 12, 20, 30? Explain the pattern.',
      'A shop gives 20% off, then another 10% off. What single discount is that?',
    ],
  },
  {
    key: 'communication',
    title: 'Communication',
    description: 'Self-introduction, storytelling, pacing',
    role: 'Communication',
    samples: [
      'Tell me about yourself in under two minutes.',
      'Describe a time you explained something complex to a non-technical person.',
      'Why do you want this role?',
      'How do you handle disagreements with a teammate?',
    ],
  },
  {
    key: 'technical',
    title: 'Technical',
    description: 'Fundamentals for your chosen role',
    role: null,
    samples: [
      'Explain the difference between a process and a thread.',
      'What happens when you type a URL into the browser and press Enter?',
      'How do database indexes work, and what do they cost?',
      'Explain REST and how it differs from GraphQL.',
    ],
  },
  {
    key: 'coding',
    title: 'Coding and DSA',
    description: 'Arrays, strings, linked lists, hash maps',
    role: 'Coding and DSA',
    samples: [
      'Reverse a linked list and state the time and space complexity.',
      'Find two numbers in an array that add up to a target.',
      'Check whether a string is a palindrome, ignoring punctuation.',
      'Detect a cycle in a linked list.',
    ],
  },
  {
    key: 'hr',
    title: 'HR and Behavioural',
    description: 'STAR stories, strengths, salary talk',
    role: 'HR and Behavioural',
    samples: [
      'Tell me about your biggest failure and what you learned.',
      'Describe a time you met a tight deadline.',
      'How do you respond to feedback you disagree with?',
      'What are your salary expectations, and why?',
    ],
  },
  {
    key: 'system',
    title: 'System Design',
    description: 'Scalable architecture, trade-offs',
    role: 'System Design',
    samples: [
      'Design a URL shortener. Start with the requirements.',
      'How would you design a chat application for one million users?',
      'Design a notification service. How do you handle retries?',
      'How would you design a rate limiter?',
    ],
  },
  {
    key: 'gd',
    title: 'Group Discussion',
    description: 'Stance, structure, rebuttals',
    role: 'Group Discussion',
    samples: [
      'Is remote work better than working from an office? Give your stance.',
      'Should AI tools be allowed in school exams?',
      'Startups or large companies: which is better for freshers?',
      'Should coding be mandatory in schools?',
    ],
  },
]

export const TECH_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'QA Engineer',
]

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export const SENTENCES = [
  'I led a team of four engineers and reduced page load time by forty percent.',
  'I enjoy breaking complex problems into smaller steps and testing each one.',
  'In my last project I designed a REST API that served thousands of users.',
  'I take feedback seriously and use it to improve my work every week.',
  'My greatest strength is staying calm and communicating clearly under pressure.',
  'I would first clarify the requirements, then outline a simple solution and discuss trade-offs.',
]

/* ------------------------------ attempt counts ----------------------------- */

export type InterviewLite = {
  id: string
  title: string
  role: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export const practiceTitle = (c: PracticeCategory) => `${c.title} practice`

export function belongsTo(i: InterviewLite, c: PracticeCategory): boolean {
  return (
    i.title.toLowerCase() === practiceTitle(c).toLowerCase() || (c.role !== null && i.role === c.role)
  )
}

/** Completed attempts and the newest unfinished interview for a category. */
export function summarise(list: InterviewLite[], c: PracticeCategory) {
  const mine = list.filter((i) => belongsTo(i, c))
  const unfinished = mine
    .filter((i) => i.status === 'IN_PROGRESS')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]
  return {
    completed: mine.filter((i) => i.status === 'COMPLETED').length,
    unfinished: unfinished ?? null,
  }
}

/* ---------------------------- pronunciation drill -------------------------- */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function numberWord(n: number): string[] {
  if (n < 20) return [ONES[n] as string]
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)] as string
    return n % 10 === 0 ? [t] : [t, ONES[n % 10] as string]
  }
  return [String(n)]
}

/** Lower-case words; "40%" becomes "forty percent" so it matches how we speak. */
export function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/%/g, ' percent ')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return words.flatMap((w) => (/^\d{1,2}$/.test(w) ? numberWord(Number(w)) : [w]))
}

export type DrillResult = {
  accuracy: number
  words: { text: string; ok: boolean }[]
  extra: string[]
}

/** Aligns what was said with the target sentence (longest common subsequence). */
export function analyzeSpeech(target: string, heard: string): DrillResult {
  const display = target.split(/\s+/).filter(Boolean)
  const t = display.map((w) => tokenize(w).join(' '))
  const h = tokenize(heard)

  const dp: number[][] = Array.from({ length: t.length + 1 }, () => new Array<number>(h.length + 1).fill(0))
  for (let i = 1; i <= t.length; i++) {
    for (let j = 1; j <= h.length; j++) {
      dp[i]![j] =
        t[i - 1] === h[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
    }
  }

  const ok = new Array<boolean>(t.length).fill(false)
  const used = new Array<boolean>(h.length).fill(false)
  let i = t.length
  let j = h.length
  while (i > 0 && j > 0) {
    if (t[i - 1] === h[j - 1]) {
      ok[i - 1] = true
      used[j - 1] = true
      i--
      j--
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) i--
    else j--
  }

  const matched = ok.filter(Boolean).length
  return {
    accuracy: t.length ? Math.round((matched / t.length) * 100) : 0,
    words: display.map((w, k) => ({ text: w, ok: ok[k] === true })),
    extra: h.filter((_, k) => !used[k]),
  }
}
