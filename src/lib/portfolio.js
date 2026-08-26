// Fundos (FIIs, FIAGROs, ETFs...) sempre trazem "fundo" ou "fiagro" no nome
// longo da cotação; ações "unit" (SANB11, TAEE11...) também terminam em 11
// mas não têm essas palavras, então dá pra diferenciar sem precisar de outra
// chamada de API. Antes o regex exigia a frase exata "fundo de investimento
// imobiliário", o que deixava FIAGROs (ex: "Kinea Credito Agro Fiagro
// Imobiliario") e ETFs (ex: "iShares Ibovespa Fundo de Indice") caírem em
// "acao" por não usarem essa frase específica.
function classifyAssetType(quote) {
  if (!quote?.longName) return null
  return /fundo|fiagro/i.test(quote.longName) ? 'fii' : 'acao'
}

export function computeRows(positions, quotes, errors) {
  return positions.map((position) => {
    const quote = quotes[position.ticker]
    const currentPrice = quote?.regularMarketPrice ?? null
    const needsAvgPrice = !(position.avgPrice > 0)
    const investedValue = position.quantity * position.avgPrice
    const currentValue = currentPrice !== null ? position.quantity * currentPrice : null
    const profit = !needsAvgPrice && currentValue !== null ? currentValue - investedValue : null
    const profitPercent = profit !== null ? (profit / investedValue) * 100 : null

    return {
      ...position,
      currentPrice,
      dayChangePercent: quote?.regularMarketChangePercent ?? null,
      investedValue,
      currentValue,
      profit,
      profitPercent,
      needsAvgPrice,
      assetType: classifyAssetType(quote),
      error: errors?.[position.ticker] ?? null,
    }
  })
}

/** Separa em ações e FIIs. Enquanto a cotação não carrega, fica em "acao" por padrão. */
export function groupByAssetType(rows) {
  const fiis = rows.filter((row) => row.assetType === 'fii')
  const acoes = rows.filter((row) => row.assetType !== 'fii')
  return { acoes, fiis }
}

export function computeTotals(rows) {
  const complete = rows.filter((row) => !row.needsAvgPrice)

  const totals = complete.reduce(
    (acc, row) => {
      acc.invested += row.investedValue
      acc.current += row.currentValue ?? row.investedValue
      return acc
    },
    { invested: 0, current: 0 }
  )
  const profit = totals.current - totals.invested
  const profitPercent = totals.invested > 0 ? (profit / totals.invested) * 100 : 0
  const incompleteCount = rows.length - complete.length

  return { ...totals, profit, profitPercent, incompleteCount }
}
