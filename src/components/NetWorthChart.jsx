import { formatCurrency } from '../lib/format'
import { CATEGORICAL_DARK, CHART, STATUS } from '../lib/palette'

function formatDateLabel(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

/** Indexa carteira e benchmark a 100 no primeiro dia em que ambos têm dado. */
function buildIndexedSeries(history) {
  const withBenchmark = history.filter((h) => h.benchmark != null)
  if (withBenchmark.length < 2) return null

  const base = withBenchmark[0]
  return withBenchmark.map((h) => ({
    date: h.date,
    portfolio: (h.current / base.current) * 100,
    benchmark: (h.benchmark / base.benchmark) * 100,
  }))
}

function BenchmarkComparison({ series }) {
  const width = 100
  const height = 32
  const allValues = series.flatMap((s) => [s.portfolio, s.benchmark])
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1

  const toPoints = (key) =>
    series
      .map((s, i) => {
        const x = (i / Math.max(series.length - 1, 1)) * width
        const y = height - ((s[key] - min) / range) * height
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')

  const last = series[series.length - 1]
  const portfolioChange = last.portfolio - 100
  const benchmarkChange = last.benchmark - 100
  const beating = portfolioChange >= benchmarkChange

  return (
    <div className="mt-6 border-t border-neutral-800 pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-neutral-300">Carteira vs. Ibovespa (BOVA11)</h4>
        <span
          className="text-xs font-medium"
          style={{ color: beating ? STATUS.good : STATUS.critical }}
        >
          {beating ? 'Batendo o Ibovespa' : 'Abaixo do Ibovespa'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-24 w-full overflow-visible"
      >
        <polyline
          points={toPoints('benchmark')}
          fill="none"
          stroke={CHART.textMuted}
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={toPoints('portfolio')}
          fill="none"
          stroke={CATEGORICAL_DARK[0]}
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORICAL_DARK[0] }} />
          Carteira: {portfolioChange >= 0 ? '+' : ''}
          {portfolioChange.toFixed(2)}%
        </span>
        <span className="flex items-center gap-1.5 text-neutral-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART.textMuted }} />
          Ibovespa: {benchmarkChange >= 0 ? '+' : ''}
          {benchmarkChange.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

function Bars({ history }) {
  const values = history.map((h) => h.current)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const first = history[0]
  const last = history[history.length - 1]
  const change = last.current - first.current
  const changePercent = first.current > 0 ? (change / first.current) * 100 : 0
  const positive = change >= 0

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-white">{formatCurrency(last.current)}</span>
        <span
          className="text-xs font-medium"
          style={{ color: positive ? STATUS.good : STATUS.critical }}
        >
          {positive ? '+' : ''}
          {formatCurrency(change)} ({positive ? '+' : ''}
          {changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="flex h-28 items-end gap-0.5">
        {history.map((point) => {
          const heightPercent = 12 + ((point.current - min) / range) * 88
          return (
            <div
              key={point.date}
              title={`${formatDateLabel(point.date)}: ${formatCurrency(point.current)}`}
              tabIndex={0}
              className="flex-1 rounded-t transition-[filter] hover:brightness-125 focus:brightness-125 focus:outline-none"
              style={{ height: `${heightPercent}%`, backgroundColor: CATEGORICAL_DARK[0] }}
            />
          )
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-neutral-500">
        <span>{formatDateLabel(first.date)}</span>
        <span>{formatDateLabel(last.date)}</span>
      </div>
    </div>
  )
}

/** Evolução diária do patrimônio, registrada automaticamente a cada atualização de cotações. */
export default function NetWorthChart({ history }) {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1))
  const indexedSeries = buildIndexedSeries(sorted)

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Patrimônio ao longo do tempo</h3>
      <p className="text-xs text-neutral-500">valor atual da carteira, por dia</p>

      {sorted.length < 2 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Ainda não há histórico suficiente — volte outro dia pra ver a evolução.
        </p>
      ) : (
        <>
          <Bars history={sorted} />
          {indexedSeries && <BenchmarkComparison series={indexedSeries} />}
        </>
      )}
    </div>
  )
}
