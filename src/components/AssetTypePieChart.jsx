import { formatCurrency, VALUE_MASK } from '../lib/format'
import { CATEGORICAL_DARK, CHART } from '../lib/palette'

const COLORS = { Ações: CATEGORICAL_DARK[0], FIIs: CATEGORICAL_DARK[1] }

function sumValue(rows) {
  return rows.reduce((sum, row) => sum + (row.currentValue ?? row.investedValue ?? 0), 0)
}

function buildStops(segments, total) {
  return segments.map((seg, i) => {
    const before = segments.slice(0, i).reduce((sum, s) => sum + s.value, 0)
    const start = (before / total) * 360
    const end = ((before + seg.value) / total) * 360
    return `${seg.color} ${start}deg ${end}deg`
  })
}

function PieCircle({ segments, total, hidden }) {
  // com valores escondidos, não dá pra mostrar as fatias reais — o formato já
  // entregaria a proporção mesmo com o texto mascarado
  const background = hidden ? CHART.gridline : `conic-gradient(${buildStops(segments, total).join(', ')})`

  return (
    <div
      role="img"
      aria-label={hidden ? 'Distribuição oculta' : 'Distribuição percentual entre ações e FIIs'}
      className="relative aspect-square h-full max-h-56 shrink-0 rounded-full"
      style={{ background }}
    >
      <div className="absolute rounded-full bg-neutral-950" style={{ inset: '14%' }} />
    </div>
  )
}

/** Pizza simples: % do patrimônio em ações vs. FIIs. */
export default function AssetTypePieChart({ acaoRows, fiiRows, hidden = false }) {
  const acoesValue = sumValue(acaoRows)
  const fiisValue = sumValue(fiiRows)
  const total = acoesValue + fiisValue

  const segments = [
    { label: 'Ações', value: acoesValue, color: COLORS.Ações },
    { label: 'FIIs', value: fiisValue, color: COLORS.FIIs },
  ].filter((seg) => seg.value > 0)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Ações vs. FIIs</h3>
      <p className="text-xs text-neutral-500">% do patrimônio por tipo de ativo</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Sem cotações suficientes ainda.</p>
      ) : (
        <div className="mt-5 flex flex-1 items-center gap-8">
          <PieCircle segments={segments} total={total} hidden={hidden} />
          <ul className="flex flex-col gap-2.5">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-neutral-200">{seg.label}</p>
                  <p className="text-neutral-500">
                    {hidden
                      ? VALUE_MASK
                      : `${((seg.value / total) * 100).toFixed(1)}% · ${formatCurrency(seg.value)}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
