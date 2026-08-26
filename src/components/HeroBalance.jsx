import EyeToggle from './EyeToggle'
import { formatCurrency, formatPercent, VALUE_MASK } from '../lib/format'
import { STATUS } from '../lib/palette'

export default function HeroBalance({ totals, hidden = false, onToggleHidden }) {
  const positive = totals.profitPercent >= 0

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">Patrimônio total</p>
          {onToggleHidden && <EyeToggle hidden={hidden} onToggle={onToggleHidden} />}
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {hidden ? VALUE_MASK : formatCurrency(totals.current)}
        </p>
        <p
          className="mt-1.5 flex items-center gap-1 text-xs font-medium"
          style={{ color: positive ? STATUS.good : STATUS.critical }}
        >
          <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
          {hidden ? VALUE_MASK : formatPercent(totals.profitPercent)}{' '}
          {positive ? 'acima' : 'abaixo'} do investido
        </p>
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        Investido: {hidden ? VALUE_MASK : formatCurrency(totals.invested)}
      </p>
    </div>
  )
}
