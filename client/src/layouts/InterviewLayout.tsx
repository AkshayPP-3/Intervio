import type { ReactNode } from 'react'

type InterviewLayoutProps = {
  children: ReactNode
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
  return <main>{children}</main>
}
