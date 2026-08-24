import { useCallback, useEffect, useRef, useState } from 'react'

const BRAPI_URL = 'https://brapi.dev/api/v2/stocks/quote'
const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN
const POLL_INTERVAL_MS = 10 * 60_000

async function fetchOne(ticker) {
  const url = new URL(BRAPI_URL)
  url.searchParams.set('symbols', ticker)

  const res = await fetch(url, {
    headers: BRAPI_TOKEN ? { Authorization: `Bearer ${BRAPI_TOKEN}` } : {},
  })
  const data = await res.json()

  if (data.error) {
    const needsToken = data.code === 'MISSING_TOKEN' && !BRAPI_TOKEN
    throw new Error(
      needsToken
        ? 'Precisa de um token gratuito da brapi.dev (crie em brapi.dev/dashboard)'
        : (data.message ?? 'Ticker não encontrado')
    )
  }

  const result = data.results?.[0]
  if (!result?.data) {
    throw new Error('Ticker não encontrado')
  }

  return { symbol: result.symbol, ...result.data }
}

/** Busca cotações em tempo real (brapi.dev) por ticker, isolando falhas individuais. */
export function useQuotes(tickers) {
  const [quotes, setQuotes] = useState({})
  const [errors, setErrors] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const tickersKey = tickers.join(',')

  const fetchQuotes = useCallback(async () => {
    if (!tickersKey) {
      setQuotes({})
      setErrors({})
      return
    }

    setLoading(true)

    const results = await Promise.allSettled(tickers.map(fetchOne))

    const nextQuotes = {}
    const nextErrors = {}

    results.forEach((result, i) => {
      const ticker = tickers[i]
      if (result.status === 'fulfilled') {
        nextQuotes[ticker] = result.value
      } else {
        nextErrors[ticker] = result.reason?.message ?? 'Erro ao buscar cotação'
      }
    })

    setQuotes(nextQuotes)
    setErrors(nextErrors)
    setLastUpdated(new Date())
    setLoading(false)
  }, [tickersKey])

  const intervalRef = useRef(null)

  useEffect(() => {
    fetchQuotes()

    intervalRef.current = setInterval(fetchQuotes, POLL_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchQuotes])

  return { quotes, errors, lastUpdated, loading, refresh: fetchQuotes }
}
