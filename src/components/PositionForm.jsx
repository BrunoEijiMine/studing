import { useState } from 'react'
import { formatCurrency } from '../lib/format'

export default function PositionForm({ onAdd, existingPositions = [] }) {
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')

  const cleanTicker = ticker.trim().toUpperCase()
  const existing = existingPositions.find((p) => p.ticker === cleanTicker)

  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanQuantity = Number(quantity)
    const cleanAvgPrice = Number(avgPrice)

    if (!cleanTicker || cleanQuantity <= 0 || cleanAvgPrice <= 0) return

    onAdd({
      id: crypto.randomUUID(),
      ticker: cleanTicker,
      quantity: cleanQuantity,
      avgPrice: cleanAvgPrice,
    })

    setTicker('')
    setQuantity('')
    setAvgPrice('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-400" htmlFor="ticker">
            Ticker
          </label>
          <input
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="PETR4"
            className="w-28 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm uppercase text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-400" htmlFor="quantity">
            Quantidade
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
            className="w-28 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-400" htmlFor="avgPrice">
            Preço da compra (R$)
          </label>
          <input
            id="avgPrice"
            type="number"
            min="0"
            step="0.01"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            placeholder="38.50"
            className="w-32 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          {existing ? 'Somar à posição' : 'Adicionar'}
        </button>
      </div>

      {existing && (
        <p className="mt-3 text-xs text-neutral-500">
          Você já tem <span className="font-medium text-neutral-300">{existing.quantity}</span>{' '}
          {existing.ticker} a {formatCurrency(existing.avgPrice)}. Isso vai somar à posição e
          recalcular o preço médio — não duplicar a linha. Pra corrigir um valor errado, edite
          direto na tabela abaixo.
        </p>
      )}
    </form>
  )
}
