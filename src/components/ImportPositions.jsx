import { useEffect, useMemo, useState } from 'react'
import {
  buildHeaderedTable,
  detectHasHeader,
  extractTicker,
  guessMapping,
  guessMappingFromData,
  isValidTicker,
  parseDelimitedTable,
  parseFlexibleNumber,
  parseXlsxTable,
} from '../lib/importParser'

const FIELDS = [
  { key: 'ticker', label: 'Coluna do ticker' },
  { key: 'quantity', label: 'Coluna da quantidade' },
  { key: 'avgPrice', label: 'Coluna do preço médio (opcional)' },
]

export default function ImportPositions({ onImport, onClose }) {
  const [rawTable, setRawTable] = useState(null)
  const [hasHeader, setHasHeader] = useState(true)
  const [mapping, setMapping] = useState({ ticker: -1, quantity: -1, avgPrice: -1 })
  const [pasteText, setPasteText] = useState('')
  const [fileError, setFileError] = useState(null)

  const loadTable = (table) => {
    if (table.length === 0) {
      setFileError('Não encontrei linhas nesse conteúdo.')
      return
    }
    setFileError(null)
    setRawTable(table)
    setHasHeader(detectHasHeader(table))
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(null)

    if (/\.xlsx?$/i.test(file.name)) {
      try {
        loadTable(await parseXlsxTable(file))
      } catch {
        setFileError('Não consegui ler esse arquivo Excel. Tente salvar como CSV.')
      }
      return
    }

    loadTable(parseDelimitedTable(await file.text()))
  }

  const handlePaste = () => {
    if (!pasteText.trim()) return
    loadTable(parseDelimitedTable(pasteText))
  }

  const table = useMemo(
    () => (rawTable ? buildHeaderedTable(rawTable, hasHeader) : null),
    [rawTable, hasHeader]
  )

  // re-chuta o mapeamento sempre que a tabela (ou a opção de cabeçalho) muda
  useEffect(() => {
    if (!table) return
    setMapping(hasHeader ? guessMapping(table.headers) : guessMappingFromData(table.rows))
  }, [table, hasHeader])

  const preview = useMemo(() => {
    if (!table) return []
    return table.rows
      .map((row) => {
        const rawTicker = mapping.ticker >= 0 ? row[mapping.ticker] : ''
        const rawQuantity = mapping.quantity >= 0 ? row[mapping.quantity] : ''
        const rawAvgPrice = mapping.avgPrice >= 0 ? row[mapping.avgPrice] : ''

        const ticker = extractTicker(rawTicker)
        const quantity = parseFlexibleNumber(rawQuantity)
        const avgPrice = parseFlexibleNumber(rawAvgPrice)
        const hasAvgPrice = avgPrice > 0
        // preço médio é opcional: a B3 não informa custo de compra no extrato de
        // custódia, só cotação atual — dá pra importar e completar depois.
        const valid = isValidTicker(ticker) && quantity > 0

        return { ticker, quantity, avgPrice: hasAvgPrice ? avgPrice : 0, hasAvgPrice, valid }
      })
      .filter((row) => row.ticker || Number.isFinite(row.quantity))
  }, [table, mapping])

  const validRows = preview.filter((row) => row.valid)
  const missingAvgPriceCount = validRows.filter((row) => !row.hasAvgPrice).length

  const handleImport = () => {
    for (const row of validRows) {
      onImport({
        id: crypto.randomUUID(),
        ticker: row.ticker,
        quantity: row.quantity,
        avgPrice: row.avgPrice,
      })
    }
    onClose()
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">Importar posições</h3>
          <p className="text-xs text-neutral-500">
            Cole os dados do seu extrato de custódia (B3 ou corretora) — ticker e quantidade
            bastam. Preço médio é opcional (a B3 não informa isso na posição).
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-neutral-500 transition hover:text-neutral-300"
        >
          fechar
        </button>
      </div>

      {!table && (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-neutral-400" htmlFor="import-file">
              Arquivo CSV ou Excel (.xlsx)
            </label>
            <input
              id="import-file"
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFile}
              className="mt-1 block w-full text-xs text-neutral-400 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-blue-400"
            />
            {fileError && <p className="mt-1 text-xs text-rose-400">{fileError}</p>}
          </div>

          <div className="text-center text-xs text-neutral-600">ou</div>

          <div>
            <label className="text-xs text-neutral-400" htmlFor="import-paste">
              Cole os dados (copiados de uma planilha)
            </label>
            <textarea
              id="import-paste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={4}
              placeholder={'Código\tQuantidade\tPreço Médio\nPETR4\t100\t38,50\nHGLG11\t20\t160,00'}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-neutral-600">
              Pode colar com ou sem a linha de título das colunas — eu tento identificar
              automaticamente.
            </p>
            <button
              type="button"
              onClick={handlePaste}
              className="mt-2 rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-400"
            >
              Processar
            </button>
          </div>
        </div>
      )}

      {table && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Confira se as colunas foram identificadas certo antes de importar.
            </p>
            <label className="flex items-center gap-1.5 text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="accent-blue-500"
              />
              a primeira linha colada é o cabeçalho
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400">{label}</label>
                <select
                  value={mapping[key]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [key]: Number(e.target.value) }))
                  }
                  className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-blue-500"
                >
                  <option value={-1}>Ignorar</option>
                  {table.headers.map((header, i) => (
                    <option key={i} value={i}>
                      {header || `Coluna ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-neutral-900 text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Ticker</th>
                  <th className="px-3 py-2">Quantidade</th>
                  <th className="px-3 py-2">Preço médio</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {preview.map((row, i) => (
                  <tr key={i} className={row.valid ? 'text-neutral-200' : 'text-neutral-600'}>
                    <td className="px-3 py-1.5">{row.ticker || '—'}</td>
                    <td className="px-3 py-1.5">
                      {Number.isFinite(row.quantity) ? row.quantity : '—'}
                    </td>
                    <td className="px-3 py-1.5">{row.hasAvgPrice ? row.avgPrice : '—'}</td>
                    <td className="px-3 py-1.5">
                      {!row.valid
                        ? 'ignorado'
                        : row.hasAvgPrice
                          ? 'ok'
                          : 'ok, sem preço médio'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {missingAvgPriceCount > 0 && (
            <p className="mt-3 rounded-lg border border-amber-900 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
              {missingAvgPriceCount} posiç{missingAvgPriceCount === 1 ? 'ão vai' : 'ões vão'}{' '}
              entrar sem preço médio (a B3 não informa custo de compra, só a posição atual).
              Elas não entram no cálculo de lucro/prejuízo até você editar o preço médio de
              cada uma na tabela.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              {validRows.length} de {preview.length} linhas prontas pra importar
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRawTable(null)}
                className="rounded-lg border border-neutral-700 px-4 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-500"
              >
                voltar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
              >
                Importar {validRows.length} posições
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
