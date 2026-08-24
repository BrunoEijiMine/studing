import { formatCurrency } from '../lib/format'
import { CHART, STATUS } from '../lib/palette'

export default function PerformanceChart({ rows }) {
  const withProfit = rows.filter((row) => row.profit !== null)
  const maxAbs = Math.max(1, ...withProfit.map((row) => Math.abs(row.profit)))

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Lucro / prejuízo por ativo</h3>
      <p className="text-xs text-neutral-500">em relação ao preço médio de compra</p>

      {withProfit.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Sem cotações suficientes ainda.</p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {withProfit.map((row) => {
            const positive = row.profit >= 0
            const pct = (Math.abs(row.profit) / maxAbs) * 100

            return (
              <div
                key={row.id}
                className="grid grid-cols-[3.5rem_1fr_1fr] items-center gap-1 text-xs"
              >
                <span className="truncate text-right font-medium text-neutral-300">
                  {row.ticker}
                </span>

                <div
                  className="flex h-5 items-center justify-end"
                  style={{ borderRight: `1px solid ${CHART.baseline}` }}
                >
                  {!positive && (
                    <>
                      <span
                        className="mr-1.5 whitespace-nowrap font-medium"
                        style={{ color: STATUS.critical }}
                      >
                        {formatCurrency(row.profit)}
                      </span>
                      <div
                        title={`${row.ticker}: ${formatCurrency(row.profit)}`}
                        tabIndex={0}
                        className="h-4 rounded-l transition-[filter] hover:brightness-110 focus:brightness-110 focus:outline-none"
                        style={{ width: `${pct}%`, backgroundColor: STATUS.critical }}
                      />
                    </>
                  )}
                </div>

                <div className="flex h-5 items-center">
                  {positive && (
                    <>
                      <div
                        title={`${row.ticker}: +${formatCurrency(row.profit)}`}
                        tabIndex={0}
                        className="h-4 rounded-r transition-[filter] hover:brightness-110 focus:brightness-110 focus:outline-none"
                        style={{ width: `${pct}%`, backgroundColor: STATUS.good }}
                      />
                      <span
                        className="ml-1.5 whitespace-nowrap font-medium"
                        style={{ color: STATUS.good }}
                      >
                        +{formatCurrency(row.profit)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
