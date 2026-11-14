type AvatarProps = {
  name: string
  src?: string
}

export function Avatar({ name, src }: AvatarProps) {
  return <img src={src} alt={name} />
}
