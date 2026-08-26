import { formatCurrency, formatPercent, VALUE_MASK } from '../lib/format'
import { STATUS } from '../lib/palette'

function ProgressRow({ label, value, percent, positive, hidden }) {
  const width = hidden ? 0 : Math.min(100, Math.abs(percent))
  const color = positive ? STATUS.good : STATUS.critical

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="font-medium" style={{ color }}>
          {hidden ? VALUE_MASK : value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function PerformanceOverview({ totals, hidden = false }) {
  const positive = totals.profit >= 0

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <p className="text-xs text-neutral-400">Desempenho</p>
      <ProgressRow
        label="Lucro / Prejuízo"
        value={`${positive ? '+' : ''}${formatCurrency(totals.profit)}`}
        percent={totals.profitPercent}
        positive={positive}
        hidden={hidden}
      />
      <ProgressRow
        label="Rentabilidade"
        value={`${positive ? '+' : ''}${formatPercent(totals.profitPercent)}`}
        percent={totals.profitPercent}
        positive={positive}
        hidden={hidden}
      />
    </div>
  )
}
