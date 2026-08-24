import { formatCurrency, formatPercent } from '../lib/format'
import { STATUS } from '../lib/palette'

export default function HeroBalance({ totals }) {
  const positive = totals.profitPercent >= 0

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <div>
        <p className="text-xs text-neutral-400">Patrimônio total</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {formatCurrency(totals.current)}
        </p>
        <p
          className="mt-1.5 flex items-center gap-1 text-xs font-medium"
          style={{ color: positive ? STATUS.good : STATUS.critical }}
        >
          <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
          {formatPercent(totals.profitPercent)} {positive ? 'acima' : 'abaixo'} do investido
        </p>
      </div>
      <p className="mt-4 text-xs text-neutral-500">Investido: {formatCurrency(totals.invested)}</p>
    </div>
  )
}
