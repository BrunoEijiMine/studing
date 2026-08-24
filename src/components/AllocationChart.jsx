import { buildSegments } from '../lib/allocation'
import { formatCurrency } from '../lib/format'

export default function AllocationChart({
  rows,
  title = 'Alocação da carteira',
  subtitle = 'por valor atual',
  emptyMessage = 'Sem cotações suficientes ainda.',
}) {
  const segments = buildSegments(rows)

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
      <p className="text-xs text-neutral-500">{subtitle}</p>

      {segments.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-5 flex h-9 w-full" role="img" aria-label="Distribuição percentual da carteira por ativo">
            {segments.map((seg, i) => (
              <div
                key={seg.label}
                title={`${seg.label}: ${formatCurrency(seg.value)} (${seg.percent.toFixed(1)}%)`}
                tabIndex={0}
                className="h-full transition-[filter] hover:brightness-110 focus:brightness-110 focus:outline-none"
                style={{
                  width: `${seg.percent}%`,
                  backgroundColor: seg.color,
                  marginRight: i < segments.length - 1 ? 2 : 0,
                  borderTopLeftRadius: i === 0 ? 4 : 0,
                  borderBottomLeftRadius: i === 0 ? 4 : 0,
                  borderTopRightRadius: i === segments.length - 1 ? 4 : 0,
                  borderBottomRightRadius: i === segments.length - 1 ? 4 : 0,
                }}
              />
            ))}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-center gap-1.5 text-xs text-neutral-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-neutral-200">{seg.label}</span>
                <span className="text-neutral-500">
                  {formatCurrency(seg.value)} · {seg.percent.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
