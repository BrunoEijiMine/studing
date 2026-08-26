import { buildSegments } from '../lib/allocation'
import { formatPercent } from '../lib/format'

export default function TopHoldings({ rows, limit = 5 }) {
  const segments = buildSegments(rows).slice(0, limit)

  return (
    <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Maiores posições</h3>
      <p className="text-xs text-neutral-500">por valor atual na carteira</p>

      {segments.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Sem cotações suficientes ainda.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
                aria-hidden="true"
              />
              <span className="w-16 shrink-0 truncate text-xs font-medium text-neutral-200">
                {seg.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-neutral-400">
                {formatPercent(seg.percent)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
