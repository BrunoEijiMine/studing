import { useState } from 'react'
import { formatCurrency, formatPercent } from '../lib/format'
import { computeTotals } from '../lib/portfolio'

function ChangeBadge({ value }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="text-neutral-500">—</span>
  }
  const positive = value >= 0
  return (
    <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>
      {positive ? '+' : ''}
      {formatPercent(value)}
    </span>
  )
}

function PositionsSection({ rows, editingId, draft, setDraft, startEdit, cancelEdit, saveEdit, onRemove }) {
  const subtotal = computeTotals(rows)

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-2">Ticker</th>
            <th className="px-4 py-2">Qtd.</th>
            <th className="px-4 py-2">Preço médio</th>
            <th className="px-4 py-2">Cotação atual</th>
            <th className="px-4 py-2">Dia</th>
            <th className="px-4 py-2">Valor investido</th>
            <th className="px-4 py-2">Valor atual</th>
            <th className="px-4 py-2">Lucro / Prejuízo</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {rows.map((row) => {
            const isEditing = editingId === row.id

            return (
              <tr key={row.id} className="text-neutral-200">
                <td className="px-4 py-3 font-semibold">{row.ticker}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.quantity}
                      onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
                      className="w-20 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-neutral-100 outline-none focus:border-blue-500"
                      autoFocus
                    />
                  ) : (
                    row.quantity
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.avgPrice}
                      onChange={(e) => setDraft((d) => ({ ...d, avgPrice: e.target.value }))}
                      className="w-24 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-neutral-100 outline-none focus:border-blue-500"
                    />
                  ) : row.needsAvgPrice ? (
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-xs font-medium text-amber-400 transition hover:text-amber-300"
                    >
                      definir preço médio
                    </button>
                  ) : (
                    formatCurrency(row.avgPrice)
                  )}
                </td>
                {row.error ? (
                  <td className="px-4 py-3 text-rose-400" colSpan={5}>
                    {row.error}
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      {row.currentPrice !== null ? formatCurrency(row.currentPrice) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ChangeBadge value={row.dayChangePercent} />
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {row.needsAvgPrice ? '—' : formatCurrency(row.investedValue)}
                    </td>
                    <td className="px-4 py-3">
                      {row.currentValue !== null ? formatCurrency(row.currentValue) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.profit !== null ? (
                        <div className={row.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {row.profit >= 0 ? '+' : ''}
                          {formatCurrency(row.profit)}{' '}
                          <span className="text-xs opacity-80">
                            ({row.profit >= 0 ? '+' : ''}
                            {formatPercent(row.profitPercent)})
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(row.id)}
                        className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        salvar
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-neutral-500 transition hover:text-neutral-300"
                      >
                        cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-xs text-neutral-500 transition hover:text-neutral-200"
                      >
                        editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(row.id)}
                        className="text-xs text-neutral-500 transition hover:text-rose-400"
                      >
                        remover
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="border-t border-neutral-800 bg-neutral-900/40 font-semibold text-neutral-100">
          <tr>
            <td className="px-4 py-3" colSpan={5}>
              Subtotal
            </td>
            <td className="px-4 py-3">{formatCurrency(subtotal.invested)}</td>
            <td className="px-4 py-3">{formatCurrency(subtotal.current)}</td>
            <td className="px-4 py-3" colSpan={2}>
              <span className={subtotal.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {subtotal.profit >= 0 ? '+' : ''}
                {formatCurrency(subtotal.profit)}{' '}
                <span className="text-xs opacity-80">
                  ({subtotal.profit >= 0 ? '+' : ''}
                  {formatPercent(subtotal.profitPercent)})
                </span>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function PositionsTable({ rows, emptyMessage, onRemove, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ quantity: '', avgPrice: '' })

  const startEdit = (row) => {
    setEditingId(row.id)
    setDraft({
      quantity: String(row.quantity),
      avgPrice: row.needsAvgPrice ? '' : String(row.avgPrice),
    })
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = (id) => {
    const quantity = Number(draft.quantity)
    const avgPrice = Number(draft.avgPrice)
    if (quantity > 0 && avgPrice > 0) {
      onUpdate(id, { quantity, avgPrice })
    }
    setEditingId(null)
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
        {emptyMessage ?? 'Nenhuma posição adicionada ainda. Use o formulário acima pra começar.'}
      </p>
    )
  }

  return (
    <PositionsSection
      rows={rows}
      editingId={editingId}
      draft={draft}
      setDraft={setDraft}
      startEdit={startEdit}
      cancelEdit={cancelEdit}
      saveEdit={saveEdit}
      onRemove={onRemove}
    />
  )
}
