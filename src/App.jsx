import { useEffect, useMemo, useState } from 'react'
import AllocationChart from './components/AllocationChart'
import BackupControls from './components/BackupControls'
import HeroBalance from './components/HeroBalance'
import ImportPositions from './components/ImportPositions'
import LoginGate from './components/LoginGate'
import NetWorthChart from './components/NetWorthChart'
import PerformanceChart from './components/PerformanceChart'
import PerformanceOverview from './components/PerformanceOverview'
import PositionForm from './components/PositionForm'
import PositionsTable from './components/PositionsTable'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import TopHoldings from './components/TopHoldings'
import { useAuth } from './hooks/useAuth'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useQuotes } from './hooks/useQuotes'
import { recordSnapshot } from './lib/history'
import { computeRows, computeTotals, groupByAssetType } from './lib/portfolio'

function App() {
  const auth = useAuth()
  const [tab, setTab] = useState('inicio')
  const [positionsSubTab, setPositionsSubTab] = useState('acoes')
  const [pendingTicker, setPendingTicker] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [positions, setPositions] = useLocalStorage('studing:positions', [])
  const [hideValues, setHideValues] = useLocalStorage('studing:hideValues', false)
  const [history, setHistory] = useLocalStorage('studing:history', [])
  const tickers = useMemo(() => positions.map((p) => p.ticker), [positions])
  // não busca cotação enquanto a carteira ainda tá trancada
  const { quotes, errors, lastUpdated, loading, refresh } = useQuotes(
    auth.isUnlocked ? tickers : []
  )

  const rows = useMemo(() => computeRows(positions, quotes, errors), [positions, quotes, errors])
  const totals = useMemo(() => computeTotals(rows), [rows])
  const { acoes: acaoRows, fiis: fiiRows } = useMemo(() => groupByAssetType(rows), [rows])

  // assim que a cotação do ticker recém-adicionado chega, sabemos se é ação ou
  // FII e pulamos pra aba certa — antes disso não dá pra classificar (unit
  // de ação e FII terminam em 11 igual, só o longName da cotação diferencia).
  useEffect(() => {
    if (!pendingTicker) return
    const row = rows.find((r) => r.ticker === pendingTicker)
    if (!row || (!row.assetType && !row.error)) return
    setPositionsSubTab(row.assetType === 'fii' ? 'fiis' : 'acoes')
    setPendingTicker(null)
  }, [pendingTicker, rows])

  // registra um snapshot do patrimônio a cada atualização de cotação bem-sucedida,
  // pra montar o histórico de evolução ao longo do tempo
  useEffect(() => {
    if (!lastUpdated || totals.invested <= 0) return
    setHistory((prev) => recordSnapshot(prev, totals))
  }, [lastUpdated])

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

  const addPositionFromForm = (position) => {
    addPosition(position)
    setPendingTicker(position.ticker)
  }

  const updatePosition = (id, updates) =>
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))

  const removePosition = (id) => setPositions((prev) => prev.filter((p) => p.id !== id))

  return (
    <LoginGate auth={auth}>
      <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100">
        <Sidebar active={tab} onChange={setTab} onLogout={auth.logout} />

        <div className="flex-1 overflow-y-auto px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex animate-fade-in flex-wrap items-center justify-between gap-3">
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
                  . Atualiza ao abrir a página ou no botão "Atualizar agora".
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

            <div className="lg:hidden">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={auth.logout}
                  className="text-xs text-neutral-500 underline underline-offset-2 transition hover:text-neutral-300"
                >
                  sair
                </button>
              </div>
              <Tabs active={tab} onChange={setTab} />
            </div>

            {tab === 'inicio' && (
              <>
                <div className="mb-6 grid items-stretch gap-4 lg:grid-cols-3">
                  <div className="animate-fade-in-up">
                    <HeroBalance
                      totals={totals}
                      hidden={hideValues}
                      onToggleHidden={() => setHideValues((prev) => !prev)}
                    />
                  </div>
                  <div className="animate-fade-in-up [animation-delay:80ms]">
                    <PerformanceOverview totals={totals} hidden={hideValues} />
                  </div>
                  <div className="animate-fade-in-up [animation-delay:160ms]">
                    <TopHoldings rows={rows} />
                  </div>
                </div>

                {rows.length > 0 && (
                  <div className="mb-6 grid animate-fade-in-up gap-4 [animation-delay:220ms] lg:grid-cols-2">
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
                  <div className="animate-fade-in-up [animation-delay:300ms]">
                    <PerformanceChart rows={rows} />
                  </div>
                )}
              </>
            )}

            {tab === 'carteira' && (
              <>
                <div className="mb-6 flex animate-fade-in-up flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-neutral-100">Suas posições</h2>
                  <BackupControls positions={positions} onImport={setPositions} />
                </div>

                {totals.incompleteCount > 0 && (
                  <p className="mb-6 animate-fade-in-up rounded-lg border border-amber-900 bg-amber-950/40 px-4 py-3 text-xs text-amber-300">
                    {totals.incompleteCount} posiç
                    {totals.incompleteCount === 1 ? 'ão está' : 'ões estão'} sem preço médio e não
                    entram nos totais do início — defina o preço médio de cada uma na tabela.
                  </p>
                )}

                <div className="mb-6 flex animate-fade-in-up flex-col gap-3 [animation-delay:80ms]">
                  <PositionForm onAdd={addPositionFromForm} existingPositions={positions} />

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

                <div className="mb-4 flex animate-fade-in-up gap-1 border-b border-neutral-800 [animation-delay:160ms]">
                  {[
                    { id: 'acoes', label: 'Ações', count: acaoRows.length },
                    { id: 'fiis', label: 'FIIs', count: fiiRows.length },
                  ].map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setPositionsSubTab(section.id)}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        positionsSubTab === section.id
                          ? 'border-b-2 border-blue-500 text-white'
                          : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {section.label}{' '}
                      <span className="text-xs text-neutral-500">({section.count})</span>
                    </button>
                  ))}
                </div>

                <div className="animate-fade-in-up [animation-delay:220ms]">
                  <PositionsTable
                    rows={positionsSubTab === 'fiis' ? fiiRows : acaoRows}
                    emptyMessage={
                      positionsSubTab === 'fiis'
                        ? 'Nenhum FII adicionado ainda.'
                        : 'Nenhuma ação adicionada ainda. Use o formulário acima pra começar.'
                    }
                    onRemove={removePosition}
                    onUpdate={updatePosition}
                  />
                </div>
              </>
            )}

            {tab === 'historico' && (
              <div className="animate-fade-in-up">
                <NetWorthChart history={history} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LoginGate>
  )
}

export default App
