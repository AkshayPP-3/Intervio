import { api } from '../../services/api'

export type PracticeTopic = {
  key: string
  label: string
  topic: string
}

export type PracticeTopicGroup = {
  key: string
  label: string
  topics: PracticeTopic[]
}

export type PracticeCategory = {
  key: string
  label: string
  icon: string
  description: string
  groups: PracticeTopicGroup[]
}

const group = (key: string, label: string, entries: [string, string][]): PracticeTopicGroup => ({
  key,
  label,
  topics: entries.map(([topicKey, topicLabel]) => ({
    key: topicKey,
    label: topicLabel,
    topic: `${label}: ${topicLabel}`,
  })),
})

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    key: 'aptitude',
    label: 'Aptitude',
    icon: '🧮',
    description: 'Quantitative aptitude, logical reasoning, and English',
    groups: [
      group('quant', 'Quantitative Aptitude', [
        ['number-system', 'Number system'],
        ['simplification', 'Simplification'],
        ['hcf-lcm', 'HCF and LCM'],
        ['ratio', 'Ratio and proportion'],
        ['percentages', 'Percentages'],
        ['profit-loss', 'Profit, loss, and discount'],
        ['interest', 'Simple and compound interest'],
        ['averages', 'Averages'],
        ['time-work', 'Time and work'],
        ['pipes', 'Pipes and cisterns'],
        ['speed-distance', 'Time, speed, and distance'],
        ['mixtures', 'Mixtures and alligation'],
        ['permutations', 'Permutations and combinations'],
        ['probability', 'Probability'],
        ['data-interpretation', 'Data interpretation'],
      ]),
      group('logical', 'Logical Reasoning', [
        ['number-series', 'Number and letter series'],
        ['analogy', 'Analogies and classification'],
        ['coding-decoding', 'Coding and decoding'],
        ['blood-relations', 'Blood relations'],
        ['directions', 'Directions and distance'],
        ['ordering', 'Ranking and ordering'],
        ['syllogisms', 'Syllogisms'],
        ['seating', 'Seating arrangements'],
        ['puzzles', 'Logic puzzles'],
        ['statements', 'Statements, assumptions, and conclusions'],
        ['clocks-calendars', 'Clocks and calendars'],
      ]),
      group('english', 'English & Verbal Ability', [
        ['grammar', 'Grammar and parts of speech'],
        ['tenses', 'Tenses and prepositions'],
        ['error-spotting', 'Error spotting and sentence correction'],
        ['vocabulary', 'Synonyms and antonyms'],
        ['idioms', 'Idioms and phrases'],
        ['fill-blanks', 'Fill in the blanks'],
        ['para-jumbles', 'Sentence ordering and para jumbles'],
        ['reading-comprehension', 'Reading comprehension'],
      ]),
    ],
  },
  {
    key: 'coding',
    label: 'Coding & DSA',
    icon: '💻',
    description: 'Practice problem solving across core data structures and algorithms',
    groups: [
      group('data-structures', 'Data Structures', [
        ['arrays-strings', 'Arrays and strings'],
        ['linked-lists', 'Linked lists'],
        ['stacks-queues', 'Stacks and queues'],
        ['hashing', 'Hash maps and sets'],
        ['trees', 'Trees and binary search trees'],
        ['heaps', 'Heaps and priority queues'],
        ['graphs', 'Graphs'],
      ]),
      group('algorithms', 'Algorithms', [
        ['searching', 'Searching and binary search'],
        ['sorting', 'Sorting'],
        ['recursion', 'Recursion and backtracking'],
        ['greedy', 'Greedy algorithms'],
        ['dynamic-programming', 'Dynamic programming'],
        ['complexity', 'Time and space complexity'],
      ]),
    ],
  },
  {
    key: 'technical',
    label: 'Technical Fundamentals',
    icon: '🛠️',
    description: 'Core computer science and software engineering topics',
    groups: [
      group('programming', 'Programming Fundamentals', [
        ['oop', 'Object-oriented programming'],
        ['language-concepts', 'Types, functions, and language fundamentals'],
        ['memory', 'Memory management and pointers'],
        ['exceptions', 'Error and exception handling'],
      ]),
      group('operating-systems', 'Operating Systems', [
        ['processes-threads', 'Processes and threads'],
        ['scheduling', 'CPU scheduling'],
        ['memory-management', 'Memory management and virtual memory'],
        ['deadlocks', 'Deadlocks and synchronization'],
      ]),
      group('databases', 'Databases & SQL', [
        ['sql', 'SQL queries and joins'],
        ['normalization', 'Database normalization'],
        ['indexing', 'Indexes and query performance'],
        ['transactions', 'Transactions and ACID properties'],
        ['nosql', 'Relational and NoSQL databases'],
      ]),
      group('networks', 'Computer Networks', [
        ['osi-tcp', 'OSI model and TCP/IP'],
        ['http-dns', 'HTTP, HTTPS, and DNS'],
        ['networking', 'Routing, firewalls, and load balancing'],
      ]),
      group('software-engineering', 'Software Engineering', [
        ['git', 'Git and version control'],
        ['testing', 'Unit, integration, and end-to-end testing'],
        ['design-patterns', 'Design patterns and SOLID principles'],
        ['security-basics', 'Secure coding fundamentals'],
      ]),
    ],
  },
  {
    key: 'development',
    label: 'Web & App Development',
    icon: '🌐',
    description: 'Frontend, backend, mobile, and cloud development',
    groups: [
      group('frontend', 'Frontend Development', [
        ['html-css', 'HTML and CSS'],
        ['javascript', 'JavaScript and TypeScript'],
        ['react', 'React and component design'],
        ['browser', 'Browser APIs and web performance'],
        ['accessibility', 'Web accessibility'],
      ]),
      group('backend', 'Backend Development', [
        ['rest-apis', 'REST API design'],
        ['authentication', 'Authentication and authorization'],
        ['nodejs', 'Node.js and server-side development'],
        ['caching', 'Caching and performance'],
        ['microservices', 'Microservices and distributed systems'],
      ]),
      group('mobile-cloud', 'Mobile & Cloud', [
        ['mobile', 'Mobile application fundamentals'],
        ['cloud', 'Cloud computing fundamentals'],
        ['devops', 'CI/CD and DevOps'],
        ['containers', 'Containers and orchestration'],
      ]),
    ],
  },
  {
    key: 'data-ai',
    label: 'Data Science & AI',
    icon: '📊',
    description: 'Statistics, data analysis, and machine learning',
    groups: [
      group('data-science', 'Data Science', [
        ['statistics', 'Statistics and probability'],
        ['data-analysis', 'Data cleaning and analysis'],
        ['visualization', 'Data visualization and interpretation'],
        ['python-data', 'Python for data science'],
      ]),
      group('machine-learning', 'Machine Learning', [
        ['ml-fundamentals', 'Machine learning fundamentals'],
        ['supervised-learning', 'Supervised learning'],
        ['unsupervised-learning', 'Unsupervised learning'],
        ['model-evaluation', 'Model evaluation and validation'],
        ['deep-learning', 'Neural networks and deep learning'],
      ]),
    ],
  },
  {
    key: 'system-design',
    label: 'System Design',
    icon: '🏗️',
    description: 'Design scalable, reliable systems and APIs',
    groups: [
      group('architecture', 'Architecture & Scalability', [
        ['high-level-design', 'High-level system design'],
        ['scalability', 'Scalability and availability'],
        ['distributed-systems', 'Distributed systems and consistency'],
      ]),
      group('data-design', 'Data & Storage Design', [
        ['schema-design', 'Database and schema design'],
        ['sharding-replication', 'Sharding and replication'],
        ['caching-queues', 'Caching and message queues'],
      ]),
      group('api-design', 'API & Product Design', [
        ['api-design', 'API design and versioning'],
        ['rate-limiting', 'Rate limiting and reliability'],
        ['requirements', 'Requirements and capacity estimation'],
      ]),
    ],
  },
  {
    key: 'hr',
    label: 'HR & Behavioural',
    icon: '🤝',
    description: 'Prepare clear, structured answers for common interview situations',
    groups: [
      group('behavioral', 'Behavioural Interviews', [
        ['situational', 'Situational questions'],
        ['leadership', 'Leadership and teamwork'],
        ['conflict', 'Conflict resolution'],
        ['failure', 'Failure, feedback, and learning'],
        ['strengths', 'Strengths and areas for improvement'],
      ]),
      group('career', 'Motivation & Career Goals', [
        ['introduction', 'Tell me about yourself'],
        ['motivation', 'Role and company motivation'],
        ['career-goals', 'Short-term and long-term career goals'],
        ['salary', 'Salary expectations and negotiation'],
      ]),
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: '🗣️',
    description: 'Build confidence, clarity, and professional communication',
    groups: [
      group('speaking', 'Speaking & Storytelling', [
        ['self-introduction', 'Professional self-introduction'],
        ['storytelling', 'Structured storytelling'],
        ['explaining', 'Explaining complex ideas clearly'],
        ['presentation', 'Presentation and meeting communication'],
      ]),
      group('professional-writing', 'Professional Communication', [
        ['business-vocabulary', 'Professional vocabulary'],
        ['email-etiquette', 'Email and workplace etiquette'],
        ['active-listening', 'Active listening and clarification'],
      ]),
    ],
  },
  {
    key: 'group-discussion',
    label: 'Group Discussion',
    icon: '💬',
    description: 'Practice structure, reasoning, and respectful discussion',
    groups: [
      group('discussion-skills', 'Discussion Skills', [
        ['current-affairs', 'Technology, business, and current affairs'],
        ['abstract-topics', 'Abstract topics and lateral thinking'],
        ['agree-disagree', 'Agreeing, disagreeing, and rebuttals'],
        ['opening-closing', 'Opening and closing a discussion'],
      ]),
    ],
  },
]

export const MIN_QUESTIONS = 5
export const MAX_QUESTIONS = 20

export type PracticeQuestion = {
  id: string
  question: string
}

export type PracticeResult = {
  question: string
  userAnswer: string
  idealAnswer: string
  score: number
  feedback: string
}

export async function generatePracticeQuestions(
  topic: string,
  count: number,
): Promise<PracticeQuestion[]> {
  const data = await api.post<{ questions: PracticeQuestion[] }>(
    '/practice/questions',
    { topic, count },
  )
  return data.questions
}

export async function evaluatePracticeAnswers(
  topic: string,
  qa: { question: string; userAnswer: string }[],
): Promise<PracticeResult[]> {
  const data = await api.post<{ results: PracticeResult[] }>(
    '/practice/evaluate',
    { topic, qa },
  )
  return data.results
}
