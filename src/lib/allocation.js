import { CATEGORICAL_DARK } from './palette'

// Cor determinada pelo ticker (identidade), nunca pela posição no ranking —
// senão o mesmo ativo troca de cor toda vez que a cotação move o ranking.
// Com mais ativos que cores na paleta, a cor se repete (ciclo determinístico
// por hash) — a lista abaixo do gráfico já identifica cada ativo pelo ticker.
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

  return withValue.map((seg) => ({
    ...seg,
    percent: (seg.value / total) * 100,
    color: colorForTicker(seg.label),
  }))
}
