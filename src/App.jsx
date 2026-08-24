import { useMemo, useState } from 'react'
import AllocationChart from './components/AllocationChart'
import BackupControls from './components/BackupControls'
import DividendsTab from './components/DividendsTab'
import ImportPositions from './components/ImportPositions'
import PerformanceChart from './components/PerformanceChart'
import PositionForm from './components/PositionForm'
import PositionsTable from './components/PositionsTable'
import StatTile from './components/StatTile'
import Tabs from './components/Tabs'
import { useDividends } from './hooks/useDividends'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useQuotes } from './hooks/useQuotes'
import { buildDividendEvents } from './lib/dividends'
import { formatCurrency, formatPercent } from './lib/format'
import { computeRows, computeTotals, groupByAssetType } from './lib/portfolio'

function App() {
  const [tab, setTab] = useState('carteira')
  const [showImport, setShowImport] = useState(false)
  const [positions, setPositions] = useLocalStorage('studing:positions', [])
  const tickers = useMemo(() => positions.map((p) => p.ticker), [positions])
  const { quotes, errors, lastUpdated, loading, refresh } = useQuotes(tickers)
  const {
    dividendsByTicker,
    errors: dividendErrors,
    loading: dividendsLoading,
    refresh: refreshDividends,
  } = useDividends(tickers)

  const rows = useMemo(() => computeRows(positions, quotes, errors), [positions, quotes, errors])
  const totals = useMemo(() => computeTotals(rows), [rows])
  const { acoes: acaoRows, fiis: fiiRows } = useMemo(() => groupByAssetType(rows), [rows])
  const { received, upcoming } = useMemo(
    () => buildDividendEvents(positions, dividendsByTicker),
    [positions, dividendsByTicker]
  )

  const addPosition = (position) =>
    setPositions((prev) => {
      const existingIndex = prev.findIndex((p) => p.ticker === position.ticker)
      if (existingIndex === -1) return [...prev, position]

      const existing = prev[existingIndex]
      const quantity = existing.quantity + position.quantity
      const avgPrice =
        (existing.quantity * existing.avgPrice + position.quantity * position.avgPrice) /
        quantity

      const next = [...prev]
      next[existingIndex] = { ...existing, quantity, avgPrice }
      return next
    })

  const updatePosition = (id, updates) =>
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))

  const removePosition = (id) => setPositions((prev) => prev.filter((p) => p.id !== id))

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Minha Carteira</h1>
            <p className="text-sm text-neutral-400">
              Cotações da B3 via{' '}
              <a
                href="https://brapi.dev"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-neutral-200"
              >
                brapi.dev
              </a>
              , atualizando a cada 10 minutos.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {lastUpdated && <span>Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}</span>}
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-neutral-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar agora'}
            </button>
          </div>
        </header>

        <Tabs active={tab} onChange={setTab} />

        <div className="mb-6 flex justify-end">
          <BackupControls positions={positions} onImport={setPositions} />
        </div>

        {tab === 'carteira' ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatTile label="Valor investido" value={formatCurrency(totals.invested)} />
              <StatTile label="Valor atual" value={formatCurrency(totals.current)} />
              <StatTile
                label="Lucro / Prejuízo"
                value={`${totals.profit >= 0 ? '+' : ''}${formatCurrency(totals.profit)}`}
                delta={totals.profit}
                deltaLabel={totals.profit >= 0 ? 'no positivo' : 'no negativo'}
              />
              <StatTile
                label="Rentabilidade"
                value={`${totals.profitPercent >= 0 ? '+' : ''}${formatPercent(totals.profitPercent)}`}
                delta={totals.profitPercent}
                deltaLabel={
                  totals.profitPercent >= 0 ? 'acima do investido' : 'abaixo do investido'
                }
              />
            </div>

            {totals.incompleteCount > 0 && (
              <p className="mb-6 rounded-lg border border-amber-900 bg-amber-950/40 px-4 py-3 text-xs text-amber-300">
                {totals.incompleteCount} posiç
                {totals.incompleteCount === 1 ? 'ão está' : 'ões estão'} sem preço médio e não
                entram nos totais acima — defina o preço médio de cada uma na tabela.
              </p>
            )}

            {rows.length > 0 && (
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <AllocationChart
                  rows={acaoRows}
                  title="Alocação — Ações"
                  emptyMessage="Nenhuma ação com cotação ainda."
                />
                <AllocationChart
                  rows={fiiRows}
                  title="Alocação — FIIs"
                  emptyMessage="Nenhum FII com cotação ainda."
                />
              </div>
            )}

            {rows.length > 0 && (
              <div className="mb-6">
                <PerformanceChart rows={rows} />
              </div>
            )}

            <div className="mb-6 flex flex-col gap-3">
              <PositionForm onAdd={addPosition} existingPositions={positions} />

              {showImport ? (
                <ImportPositions onImport={addPosition} onClose={() => setShowImport(false)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  className="self-start text-xs text-neutral-500 underline underline-offset-2 transition hover:text-neutral-300"
                >
                  ou importar várias posições de uma vez (CSV / extrato)
                </button>
              )}
            </div>

            <PositionsTable rows={rows} onRemove={removePosition} onUpdate={updatePosition} />
          </>
        ) : (
          <DividendsTab
            received={received}
            upcoming={upcoming}
            loading={dividendsLoading}
            errors={dividendErrors}
            onRefresh={refreshDividends}
          />
        )}
      </div>
    </div>
  )
}

export default App
