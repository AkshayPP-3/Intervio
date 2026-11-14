import type { ReactNode } from 'react'

type ModalProps = {
  children: ReactNode
  open: boolean
}

export function Modal({ children, open }: ModalProps) {
  return open ? <div role="dialog">{children}</div> : null
}
