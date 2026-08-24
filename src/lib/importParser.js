function detectDelimiter(line) {
  const candidates = [';', ',', '\t']
  let best = ';'
  let bestCount = -1
  for (const delimiter of candidates) {
    const count = line.split(delimiter).length
    if (count > bestCount) {
      bestCount = count
      best = delimiter
    }
  }
  return best
}

/** Parseia texto delimitado (CSV/TSV/;) em uma tabela crua (array de arrays). */
export function parseDelimitedTable(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const delimiter = detectDelimiter(lines[0])
  return lines.map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''))
  )
}

/** Lê um arquivo .xlsx/.xls direto no navegador (lazy-loaded) como tabela crua. */
export async function parseXlsxTable(file) {
  const { readSheet } = await import('read-excel-file/browser')
  const data = await readSheet(file)

  return data
    .map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))))
    .filter((row) => row.some((cell) => cell.trim() !== ''))
}

const TICKER_PATTERN = /[A-Z]{4}\d{1,2}/
const TICKER_EXACT = /^[A-Z]{4}\d{1,2}$/

export function extractTicker(raw) {
  if (!raw) return ''
  const upper = String(raw).toUpperCase().trim()
  const match = upper.match(TICKER_PATTERN)
  return match ? match[0] : upper
}

export function isValidTicker(ticker) {
  return TICKER_EXACT.test(ticker)
}

/** Aceita tanto "1.234,56" (BR) quanto "1234.56" (en-US). */
export function parseFlexibleNumber(raw) {
  if (raw === null || raw === undefined) return NaN
  let str = String(raw).trim()
  if (str === '') return NaN

  str = str.replace(/[^\d,.-]/g, '')
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.')
  } else if (str.includes(',')) {
    str = str.replace(',', '.')
  }

  return Number(str)
}

function rowLooksLikeData(row) {
  return row.some((cell) => {
    const trimmed = String(cell).trim()
    if (trimmed === '') return false
    if (isValidTicker(extractTicker(trimmed))) return true
    return /^-?[\d.,]+$/.test(trimmed)
  })
}

/** Chuta se a primeira linha da tabela é cabeçalho ou já é dado (ticker/número). */
export function detectHasHeader(table) {
  if (table.length === 0) return true
  return !rowLooksLikeData(table[0])
}

/** Divide a tabela crua em headers+rows, conforme hasHeader (manual ou auto-detectado). */
export function buildHeaderedTable(table, hasHeader) {
  if (table.length === 0) return { headers: [], rows: [] }
  if (!hasHeader) {
    const width = table[0].length
    return {
      headers: Array.from({ length: width }, (_, i) => {
        const sample = String(table[0][i] ?? '').trim()
        const truncated = sample.length > 24 ? `${sample.slice(0, 24)}…` : sample
        return `Coluna ${i + 1}${truncated ? ` (${truncated})` : ''}`
      }),
      rows: table,
    }
  }
  return { headers: table[0], rows: table.slice(1) }
}

const TICKER_KEYWORDS = ['código de negociação', 'codigo de negociacao', 'código', 'codigo', 'ticker', 'ativo', 'papel', 'produto']
const QUANTITY_KEYWORDS = ['quantidade', 'qtd', 'qtde']
const PRICE_KEYWORDS = ['preço médio', 'preco medio', 'preço medio', 'preco médio', 'pm']

function guessColumn(headers, keywords) {
  const lower = headers.map((h) => h.toLowerCase())
  for (const keyword of keywords) {
    const index = lower.findIndex((h) => h.includes(keyword))
    if (index !== -1) return index
  }
  return -1
}

export function guessMapping(headers) {
  return {
    ticker: guessColumn(headers, TICKER_KEYWORDS),
    quantity: guessColumn(headers, QUANTITY_KEYWORDS),
    avgPrice: guessColumn(headers, PRICE_KEYWORDS),
  }
}

/**
 * Chuta ticker/quantidade olhando os valores das linhas (sem cabeçalho pra guiar).
 * Preço médio nunca é chutado aqui — não dá pra distinguir "preço de fechamento"
 * de "preço médio de compra" só pelos números, e inventar isso mostraria um
 * custo de compra errado.
 */
export function guessMappingFromData(rows) {
  if (rows.length === 0) return { ticker: -1, quantity: -1, avgPrice: -1 }
  const width = Math.max(...rows.map((row) => row.length))

  let tickerCol = -1
  let bestTickerRate = 0
  for (let c = 0; c < width; c++) {
    const hits = rows.filter((row) => isValidTicker(extractTicker(row[c]))).length
    const rate = hits / rows.length
    if (rate > bestTickerRate) {
      bestTickerRate = rate
      tickerCol = c
    }
  }
  if (bestTickerRate < 0.8) tickerCol = -1

  // quantidade: coluna numérica, sempre inteira, que varia entre linhas e fica
  // numa faixa plausível de qtd. de ações/cotas — descarta CNPJ (14 dígitos),
  // número de conta e outros IDs grandes que também são inteiros.
  let quantityCol = -1
  for (let c = 0; c < width; c++) {
    if (c === tickerCol) continue
    const values = rows.map((row) => parseFlexibleNumber(row[c]))
    const finite = values.filter((v) => Number.isFinite(v))
    if (finite.length / rows.length < 0.8) continue
    const allIntegers = finite.every((v) => Number.isInteger(v))
    const plausibleRange = finite.every((v) => v >= 1 && v <= 1_000_000)
    const varies = new Set(finite).size > 1
    if (allIntegers && plausibleRange && varies) {
      quantityCol = c
      break
    }
  }

  return { ticker: tickerCol, quantity: quantityCol, avgPrice: -1 }
}
