function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/** Registra (ou atualiza, se já existe hoje) o snapshot do patrimônio do dia. */
export function recordSnapshot(history, totals) {
  const date = todayKey()
  const entry = { date, invested: totals.invested, current: totals.current }
  const index = history.findIndex((h) => h.date === date)

  if (index === -1) return [...history, entry]
  if (history[index].invested === entry.invested && history[index].current === entry.current) {
    return history
  }

  const next = [...history]
  next[index] = entry
  return next
}
