import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// "navy" to baza w :root, wiec dla niego zdejmujemy atrybut; pozostale maja
// wlasne bloki [data-theme=...] w index.css.
export type Theme = 'navy' | 'dark' | 'forest' | 'plum' | 'ocean' | 'light' | 'sand'

export type ThemeInfo = {
  id: Theme
  label: string
  hint: string
  // Kolory do miniaturki w ustawieniach - te same, co w bloku CSS motywu.
  bg: string
  card: string
  accent: string
  text: string
}

export const THEMES: ThemeInfo[] = [
  {
    id: 'navy',
    label: 'Granatowy',
    hint: 'Domyślny. Chłodny granat z niebieskim akcentem.',
    bg: '#0a1220',
    card: '#101c33',
    accent: '#4f83ff',
    text: '#eef2f8',
  },
  {
    id: 'dark',
    label: 'Ciemny',
    hint: 'Czysta czerń bez koloru w tle.',
    bg: '#131314',
    card: '#1e1f20',
    accent: '#8ab4f8',
    text: '#f1f3f4',
  },
  {
    id: 'forest',
    label: 'Leśny',
    hint: 'Głęboka zieleń, miętowy akcent.',
    bg: '#0b1410',
    card: '#122018',
    accent: '#5cc98d',
    text: '#e9f4ee',
  },
  {
    id: 'plum',
    label: 'Śliwkowy',
    hint: 'Ciemne wino i fiolet.',
    bg: '#140f1c',
    card: '#1f1830',
    accent: '#b388ff',
    text: '#f1ecfa',
  },
  {
    id: 'ocean',
    label: 'Morski',
    hint: 'Zieleń morska z turkusem.',
    bg: '#07171b',
    card: '#0e272e',
    accent: '#3ec9d6',
    text: '#e6f4f6',
  },
  {
    id: 'light',
    label: 'Jasny',
    hint: 'Biel i granatowy akcent.',
    bg: '#ffffff',
    card: '#f7f8fb',
    accent: '#2f5fd0',
    text: '#0c1527',
  },
  {
    id: 'sand',
    label: 'Piaskowy',
    hint: 'Ciepły papier i terakota, do czytania za dnia.',
    bg: '#faf6ef',
    card: '#fffdf8',
    accent: '#b4552d',
    text: '#221d16',
  },
]

const STORAGE_KEY = 'takezo-theme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStored(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return THEMES.some((t) => t.id === stored) ? (stored as Theme) : 'navy'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStored)

  useEffect(() => {
    if (theme === 'navy') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = theme
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const apply = useCallback((next: Theme) => setTheme(next), [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme musi być użyte wewnątrz <ThemeProvider>')
  }
  return ctx
}
