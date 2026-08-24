import { CATEGORICAL_DARK, CHART } from './palette'

const MAX_SLOTS = CATEGORICAL_DARK.length

// Cor determinada pelo ticker (identidade), nunca pela posição no ranking —
// senão o mesmo ativo troca de cor toda vez que a cotação move o ranking.
export function colorForTicker(ticker) {
  let hash = 0
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 31 + ticker.charCodeAt(i)) >>> 0
  }
  return CATEGORICAL_DARK[hash % CATEGORICAL_DARK.length]
}

export function buildSegments(rows) {
  const withValue = rows
    .map((row) => ({
      label: row.ticker,
      value: row.currentValue ?? row.investedValue,
    }))
    .filter((seg) => seg.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = withValue.reduce((sum, seg) => sum + seg.value, 0)
  if (total === 0) return []

  const head = withValue.slice(0, MAX_SLOTS - 1)
  const tail = withValue.slice(MAX_SLOTS - 1)

  const segments = head.map((seg) => ({
    ...seg,
    percent: (seg.value / total) * 100,
    color: colorForTicker(seg.label),
  }))

  if (tail.length > 0) {
    const tailValue = tail.reduce((sum, seg) => sum + seg.value, 0)
    segments.push({
      label: 'Outros',
      value: tailValue,
      percent: (tailValue / total) * 100,
      color: CHART.other,
    })
  }

  return segments
}
