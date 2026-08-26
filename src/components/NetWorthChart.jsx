import { formatCurrency } from '../lib/format'
import { CATEGORICAL_DARK, STATUS } from '../lib/palette'

function formatDateLabel(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
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

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Patrimônio ao longo do tempo</h3>
      <p className="text-xs text-neutral-500">valor atual da carteira, por dia</p>

      {sorted.length < 2 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Ainda não há histórico suficiente — volte outro dia pra ver a evolução.
        </p>
      ) : (
        <Bars history={sorted} />
      )}
    </div>
  )
}
