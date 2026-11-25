import { APP_NAME } from '../../utils/constants'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="py-4 text-center text-[11px] text-slate-500">
      © {YEAR} {APP_NAME}. Practise. Improve. Get hired.
    </footer>
  )
}
