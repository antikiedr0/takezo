// Prog poziomu n (liczac narastajaco): 100 * n XP.
// Poziom 1 od 0 XP, poziom 2 od 100, poziom 3 od 300, poziom 4 od 600...
const XP_PER_LEVEL_STEP = 100

export const XP_FOR_CLOSED_DAY = 50

// Suma XP potrzebna, zeby wejsc na dany poziom.
export function xpThresholdForLevel(level: number): number {
  if (level <= 1) {
    return 0
  }
  const steps = level - 1
  return (XP_PER_LEVEL_STEP * steps * (steps + 1)) / 2
}

export function levelFromXp(totalXp: number): number {
  let level = 1
  while (xpThresholdForLevel(level + 1) <= totalXp) {
    level += 1
  }
  return level
}

export function xpToNextLevel(totalXp: number): number {
  const next = levelFromXp(totalXp) + 1
  return xpThresholdForLevel(next) - totalXp
}
