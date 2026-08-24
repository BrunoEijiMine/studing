import { useCallback, useEffect, useState } from 'react'

const STOCKS_URL = 'https://brapi.dev/api/v2/stocks/dividends'
const FII_URL = 'https://brapi.dev/api/v2/fii/dividends'
const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: BRAPI_TOKEN ? { Authorization: `Bearer ${BRAPI_TOKEN}` } : {},
  })
  return res.json()
}

function normalize(ticker, entry) {
  return {
    ticker,
    label: entry.label,
    rate: entry.rate,
    paymentDate: entry.paymentDate ? new Date(entry.paymentDate) : null,
    exDate: entry.lastDatePrior ? new Date(entry.lastDatePrior) : null,
    estimated: (entry.remarks ?? '').includes('estimated'),
  }
}

async function fetchOne(ticker) {
  const stocksUrl = new URL(STOCKS_URL)
  stocksUrl.searchParams.set('symbols', ticker)
  const stocksData = await fetchJson(stocksUrl)

  if (stocksData.error) {
    if (stocksData.code === 'FII_DIVIDENDS_MISUSE') {
      const fiiUrl = new URL(FII_URL)
      fiiUrl.searchParams.set('symbols', ticker)
      const fiiData = await fetchJson(fiiUrl)

      if (fiiData.error) {
        throw new Error(fiiData.message ?? 'Erro ao buscar dividendos')
      }

      return (fiiData.dividends ?? []).map((entry) => normalize(ticker, entry))
    }

    throw new Error(stocksData.message ?? 'Erro ao buscar dividendos')
  }

  const cashDividends = stocksData.results?.[0]?.data?.cashDividends ?? []
  return cashDividends.map((entry) => normalize(ticker, entry))
}

/** Busca histórico e pagamentos anunciados de dividendos/rendimentos por ticker. */
export function useDividends(tickers) {
  const [dividendsByTicker, setDividendsByTicker] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const tickersKey = tickers.join(',')

  const fetchAll = useCallback(async () => {
    if (!tickersKey) {
      setDividendsByTicker({})
      setErrors({})
      return
    }

    setLoading(true)

    const results = await Promise.allSettled(tickers.map(fetchOne))

    const next = {}
    const nextErrors = {}

    results.forEach((result, i) => {
      const ticker = tickers[i]
      if (result.status === 'fulfilled') {
        next[ticker] = result.value
      } else {
        nextErrors[ticker] = result.reason?.message ?? 'Erro ao buscar dividendos'
      }
    })

    setDividendsByTicker(next)
    setErrors(nextErrors)
    setLoading(false)
  }, [tickersKey])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { dividendsByTicker, errors, loading, refresh: fetchAll }
}
