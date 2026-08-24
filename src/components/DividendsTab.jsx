import { formatCurrency } from '../lib/format'
import StatTile from './StatTile'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function groupByTicker(events) {
  const map = new Map()
  for (const event of events) {
    if (!map.has(event.ticker)) map.set(event.ticker, [])
    map.get(event.ticker).push(event)
  }

  return [...map.entries()]
    .map(([ticker, items]) => ({
      ticker,
      items,
      quantity: items[0].quantity,
      total: items.reduce((sum, event) => sum + event.total, 0),
    }))
    .sort((a, b) => b.total - a.total)
}

function TickerGroup({ ticker, items, quantity, total }) {
  return (
    <details className="group border-b border-neutral-800 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 transition hover:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <span className="text-neutral-500 transition-transform group-open:rotate-90">▸</span>
          <span className="font-semibold text-neutral-100">{ticker}</span>
          <span className="text-xs text-neutral-500">
            {quantity} cotas · {items.length} pagamento{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="font-medium text-emerald-400">{formatCurrency(total)}</span>
      </summary>

      <div className="overflow-x-auto px-4 pb-3">
        <table className="w-full min-w-105 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="py-2 pr-4">Tipo</th>
              <th className="py-2 pr-4">Pagamento</th>
              <th className="py-2 pr-4">Valor/cota</th>
              <th className="py-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {items.map((event, i) => (
              <tr
                key={`${event.label}-${event.paymentDate.toISOString()}-${i}`}
                className="text-neutral-300"
              >
                <td className="py-2 pr-4">
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                    {event.label}
                  </span>
                  {event.estimated && (
                    <span className="ml-1.5 text-xs text-neutral-500">(estimado)</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-neutral-400">
                  {dateFormatter.format(event.paymentDate)}
                </td>
                <td className="py-2 pr-4 text-neutral-400">{formatCurrency(event.rate)}</td>
                <td className="py-2 pr-4 font-medium text-emerald-400">
                  {formatCurrency(event.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function EventsSection({ title, events, emptyMessage }) {
  const groups = groupByTicker(events)

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800">
      <div className="bg-neutral-900/70 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
      </div>
      {groups.length === 0 ? (
        <p className="p-6 text-center text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div>
          {groups.map((group) => (
            <TickerGroup key={group.ticker} {...group} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DividendsTab({ received, upcoming, loading, errors, onRefresh }) {
  const totalReceived = received.reduce((sum, event) => sum + event.total, 0)
  const totalUpcoming = upcoming.reduce((sum, event) => sum + event.total, 0)
  const errorTickers = Object.keys(errors ?? {})

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Proventos anunciados pelas empresas/fundos, cruzados com a quantidade que você tem
          hoje de cada ativo.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile label="Recebido (últimos 12 meses)" value={formatCurrency(totalReceived)} />
        <StatTile label="A receber (anunciado)" value={formatCurrency(totalUpcoming)} />
      </div>

      <p className="mb-6 text-xs text-neutral-500">
        "Recebidos" mostra só os últimos 12 meses. Os valores usam a quantidade{' '}
        <span className="text-neutral-400">atual</span> de cada ativo para todo o período — se
        você comprou mais cotas ao longo do tempo, o total pode estar superestimado.
      </p>

      {errorTickers.length > 0 && (
        <div className="mb-6 rounded-lg border border-rose-900 bg-rose-950/50 px-4 py-3 text-xs text-rose-300">
          {errorTickers.map((ticker) => (
            <p key={ticker}>
              <span className="font-semibold">{ticker}:</span> {errors[ticker]}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <EventsSection
          title="Recebidos (últimos 12 meses)"
          events={received}
          emptyMessage={loading ? 'Carregando...' : 'Nenhum dividendo recebido ainda.'}
        />
        <EventsSection
          title="A receber"
          events={upcoming}
          emptyMessage={loading ? 'Carregando...' : 'Nenhum pagamento futuro anunciado.'}
        />
      </div>
    </div>
  )
}
