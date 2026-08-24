const RECEIVED_WINDOW_DAYS = 365

/** Cruza as posições atuais com o histórico de dividendos por ticker. */
export function buildDividendEvents(positions, dividendsByTicker) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - RECEIVED_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const events = []

  for (const position of positions) {
    const list = dividendsByTicker[position.ticker] ?? []
    for (const dividend of list) {
      if (!dividend.paymentDate) continue
      events.push({
        ...dividend,
        quantity: position.quantity,
        total: dividend.rate * position.quantity,
      })
    }
  }

  const received = events
    .filter((event) => event.paymentDate <= now && event.paymentDate >= windowStart)
    .sort((a, b) => b.paymentDate - a.paymentDate)

  const upcoming = events
    .filter((event) => event.paymentDate > now)
    .sort((a, b) => a.paymentDate - b.paymentDate)

  return { received, upcoming }
}
