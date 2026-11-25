import { initials } from '../../utils/helpers'

type AvatarProps = {
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' }

export function Avatar({ name, size = 'sm' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-blue-500 font-semibold text-white ${SIZES[size]}`}
    >
      {initials(name)}
    </span>
  )
}
