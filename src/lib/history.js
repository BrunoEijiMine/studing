function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/** Registra (ou atualiza, se já existe hoje) o snapshot do patrimônio e do benchmark do dia. */
export function recordSnapshot(history, totals, benchmarkPrice = null) {
  const date = todayKey()
  const entry = { date, invested: totals.invested, current: totals.current, benchmark: benchmarkPrice }
  const index = history.findIndex((h) => h.date === date)

  if (index === -1) return [...history, entry]

  const existing = history[index]
  if (
    existing.invested === entry.invested &&
    existing.current === entry.current &&
    existing.benchmark === entry.benchmark
  ) {
    return history
  }

  const next = [...history]
  next[index] = entry
  return next
}
