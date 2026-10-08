// Ikony rysowane w jednym miejscu - te same ksztalty co na projekcie w canvasie.
type P = { size?: number }

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const MarkIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M4 20 20 4" />
    <path d="M14 4h6v6" />
  </svg>
)

export const FlameIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 3 4 6a7 7 0 0 1-14 0c0-6 7-7 7-10Z" />
  </svg>
)

export const SunIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
)

export const MoonIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export const FolderIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
  </svg>
)

export const UserIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </svg>
)

export const CheckIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const ClockIcon = ({ size = 13 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const PlusIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const ArrowRightIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowLeftIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)

export const BoltIcon = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
)

export const LogoutIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base} aria-hidden="true">
    <path d="M15 17l5-5-5-5M20 12H9M11 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
  </svg>
)
