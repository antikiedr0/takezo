import { API_BASE } from '../api/client'

type Props = {
  name: string
  avatarUrl: string | null
  size?: number
}

// Zdjecie albo inicjaly - jedno miejsce, zeby naglowek i profil nie rozjechaly sie
// w momencie, gdy user wgra albo usunie zdjecie.
export function Avatar({ name, avatarUrl, size = 44 }: Props) {
  const initials = name.trim().slice(0, 2).toUpperCase() || 'TK'

  if (avatarUrl) {
    return (
      <img
        src={`${API_BASE}${avatarUrl}`}
        alt=""
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '999px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    )
  }

  return (
    <span
      className="avatar"
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size / 3)}px` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
